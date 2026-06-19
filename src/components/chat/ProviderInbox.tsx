import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronLeft, MessageCircle, Search, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSecureChat, Conversation } from '@/hooks/useSecureChat';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';

const ProviderInbox = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    sendMessage,
    isLoading,
  } = useSecureChat('provider');

  const filteredConversations = conversations.filter((conv) =>
    conv.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConv = conversations.find((c) => c.id === activeConversation);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Patient Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
            <div className="border-r p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <div className="col-span-2 p-4">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Patient Messages
          {conversations.some((c) => (c.unread_count || 0) > 0) && (
            <Badge variant="destructive" className="ml-2">
              {conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0)} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[520px]">
          {/* Conversation List — full-width on mobile until a thread is opened */}
          <div className={cn("border-r flex-col", activeConversation ? "hidden md:flex" : "flex")}>
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversation}
                      onClick={() => setActiveConversation(conv.id)}
                      getInitials={getInitials}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Thread — full-width on mobile when a thread is open */}
          <div className={cn("md:col-span-2 flex-col", activeConversation ? "flex" : "hidden md:flex")}>
            {activeConversation ? (
              <>
                <div className="p-3 border-b flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden -ml-1 p-1 rounded-md hover:bg-muted text-muted-foreground"
                    aria-label="Back to conversations"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {activeConv?.patient?.full_name ? getInitials(activeConv.patient.full_name) : 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{activeConv?.patient?.full_name || 'Patient'}</p>
                    <p className="text-xs text-muted-foreground">Secure conversation</p>
                  </div>
                </div>
                <MessageThread messages={messages} currentUserRole="provider" />
                <MessageInput onSend={sendMessage} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Select a conversation</p>
                  <p className="text-sm">Choose a patient to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  getInitials: (name: string) => string;
}

const ConversationItem = ({ conversation, isActive, onClick, getInitials }: ConversationItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 text-left hover:bg-muted/50 transition-colors",
        isActive && "bg-muted"
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {conversation.patient?.full_name ? getInitials(conversation.patient.full_name) : 'P'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm truncate">
              {conversation.patient?.full_name || 'Patient'}
            </p>
            {(conversation.unread_count || 0) > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {format(new Date(conversation.last_message_at || conversation.created_at), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ProviderInbox;
