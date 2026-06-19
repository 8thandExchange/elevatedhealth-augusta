import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, RefreshCw, Send } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface SmsMessage {
  id: string;
  patient_id: string | null;
  direction: "inbound" | "outbound";
  from_number: string;
  to_number: string;
  body: string;
  delivery_status: string | null;
  is_read: boolean;
  created_at: string;
}

interface SmsThread {
  key: string;
  phone: string;
  patientId: string | null;
  patientName: string | null;
  messages: SmsMessage[];
  unreadCount: number;
  lastMessageAt: string;
}

function phoneLast10(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "").slice(-10);
  if (d.length === 10) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  return phone;
}

const SmsInbox = () => {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [patientNames, setPatientNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("sms_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(500);

      if (error) throw error;
      setMessages((data as SmsMessage[]) || []);

      const patientIds = [
        ...new Set((data || []).map((m) => m.patient_id).filter(Boolean)),
      ] as string[];

      if (patientIds.length > 0) {
        const { data: patients } = await supabase
          .from("patients")
          .select("id, full_name")
          .in("id", patientIds);

        const map: Record<string, string> = {};
        for (const p of patients || []) {
          map[p.id] = p.full_name;
        }
        setPatientNames(map);
      }
    } catch (err) {
      console.error("SMS inbox load error:", err);
      toast.error("Failed to load SMS messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("sms-inbox")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sms_messages" },
        () => loadMessages(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadMessages]);

  const threads = useMemo((): SmsThread[] => {
    const map = new Map<string, SmsThread>();

    for (const msg of messages) {
      const counterparty =
        msg.direction === "inbound" ? msg.from_number : msg.to_number;
      const key = phoneLast10(counterparty);

      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          phone: counterparty,
          patientId: msg.patient_id,
          patientName: msg.patient_id ? patientNames[msg.patient_id] ?? null : null,
          messages: [msg],
          unreadCount: msg.direction === "inbound" && !msg.is_read ? 1 : 0,
          lastMessageAt: msg.created_at,
        });
      } else {
        existing.messages.push(msg);
        if (msg.patient_id && !existing.patientId) {
          existing.patientId = msg.patient_id;
          existing.patientName = patientNames[msg.patient_id] ?? null;
        }
        if (msg.direction === "inbound" && !msg.is_read) {
          existing.unreadCount += 1;
        }
        if (msg.created_at > existing.lastMessageAt) {
          existing.lastMessageAt = msg.created_at;
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  }, [messages, patientNames]);

  const selectedThread = threads.find((t) => t.key === selectedKey) ?? null;

  const markThreadRead = async (thread: SmsThread) => {
    const unreadIds = thread.messages
      .filter((m) => m.direction === "inbound" && !m.is_read)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("sms_messages")
      .update({ is_read: true })
      .in("id", unreadIds);
  };

  const handleSelectThread = async (thread: SmsThread) => {
    setSelectedKey(thread.key);
    setReplyText("");
    await markThreadRead(thread);
    loadMessages();
  };

  const handleSendReply = async () => {
    if (!selectedThread || !replyText.trim()) return;

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-sms-reply", {
        body: {
          to_phone: selectedThread.phone,
          body: replyText.trim(),
          patient_id: selectedThread.patientId,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setReplyText("");
      toast.success("SMS sent");
      await loadMessages();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send SMS";
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            SMS Inbox
            {totalUnread > 0 && (
              <Badge variant="destructive">{totalUnread} unread</Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Outbound texts are logged here. Patient replies arrive in GoHighLevel Conversations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadMessages} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[480px]">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[420px]">
              {threads.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4">
                  No messages yet. Inbound texts to your Twilio number will appear here.
                </p>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.key}
                    type="button"
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors ${
                      selectedKey === thread.key ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">
                        {thread.patientName || formatPhoneDisplay(thread.phone)}
                      </span>
                      {thread.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {thread.messages[thread.messages.length - 1]?.body}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                    </p>
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 flex flex-col">
          {selectedThread ? (
            <>
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-sm">
                  {selectedThread.patientName || "Unknown caller"}
                  <span className="text-muted-foreground font-normal ml-2">
                    {formatPhoneDisplay(selectedThread.phone)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 h-[320px] px-4 py-3">
                  <div className="space-y-3">
                    {selectedThread.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.direction === "outbound"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{msg.body}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.direction === "outbound"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(msg.created_at), "MMM d, h:mm a")}
                            {msg.delivery_status && msg.direction === "outbound" && (
                              <> · {msg.delivery_status}</>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="border-t p-4 space-y-2">
                  <Textarea
                    placeholder="Type your reply…"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSendReply}
                      disabled={isSending || !replyText.trim()}
                      className="gap-2"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send SMS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full min-h-[420px] text-muted-foreground text-sm">
              Select a conversation to view messages and reply.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SmsInbox;
