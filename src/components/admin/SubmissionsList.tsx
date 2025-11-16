import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Phone, Mail, Calendar } from "lucide-react";

type SubmissionStatus = 'new' | 'contacted' | 'scheduled' | 'completed';

interface Submission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  age_range: string;
  gender: string;
  symptoms: string[];
  symptom_duration: string;
  past_hrt: string;
  past_hrt_details?: string;
  medical_conditions?: string;
  current_medications?: string;
  primary_goal: string;
  insurance: string;
  status: SubmissionStatus;
  notes?: string;
  contacted_at?: string;
  scheduled_at?: string;
  completed_at?: string;
}

export const SubmissionsList = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();

    // Set up realtime subscription
    const channel = supabase
      .channel('hrt_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hrt_quiz_submissions'
        },
        () => {
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('hrt_quiz_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch submissions");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: SubmissionStatus, notes?: string) => {
    try {
      const updates: any = { status, notes };
      
      if (status === 'contacted' && !submissions.find(s => s.id === id)?.contacted_at) {
        updates.contacted_at = new Date().toISOString();
      } else if (status === 'scheduled' && !submissions.find(s => s.id === id)?.scheduled_at) {
        updates.scheduled_at = new Date().toISOString();
      } else if (status === 'completed' && !submissions.find(s => s.id === id)?.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('hrt_quiz_submissions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success("Status updated successfully");
    } catch (error: any) {
      toast.error("Failed to update status");
    }
  };

  const filteredSubmissions = filterStatus === "all" 
    ? submissions 
    : submissions.filter(s => s.status === filterStatus);

  const getStatusColor = (status: SubmissionStatus) => {
    const colors = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      scheduled: "bg-purple-500",
      completed: "bg-green-500"
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Submissions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          {filteredSubmissions.length} submission(s)
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{submission.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {submission.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {submission.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(submission.created_at), 'PPp')}
                    </span>
                  </div>
                </div>
                <Badge className={getStatusColor(submission.status)}>
                  {submission.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Age Range:</span> {submission.age_range}
                </div>
                <div>
                  <span className="font-semibold">Gender:</span> {submission.gender}
                </div>
                <div>
                  <span className="font-semibold">Insurance:</span> {submission.insurance}
                </div>
                <div>
                  <span className="font-semibold">Primary Goal:</span> {submission.primary_goal}
                </div>
              </div>

              {expandedId === submission.id && (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <span className="font-semibold">Symptoms:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {submission.symptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="outline">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold">Symptom Duration:</span> {submission.symptom_duration}
                  </div>
                  <div>
                    <span className="font-semibold">Past HRT:</span> {submission.past_hrt}
                    {submission.past_hrt_details && (
                      <p className="text-muted-foreground mt-1">{submission.past_hrt_details}</p>
                    )}
                  </div>
                  {submission.medical_conditions && (
                    <div>
                      <span className="font-semibold">Medical Conditions:</span>
                      <p className="text-muted-foreground mt-1">{submission.medical_conditions}</p>
                    </div>
                  )}
                  {submission.current_medications && (
                    <div>
                      <span className="font-semibold">Current Medications:</span>
                      <p className="text-muted-foreground mt-1">{submission.current_medications}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">Status:</span>
                  <Select
                    value={submission.status}
                    onValueChange={(value) => updateStatus(submission.id, value as SubmissionStatus, submission.notes)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <span className="font-semibold text-sm">Notes:</span>
                  <Textarea
                    placeholder="Add notes about this submission..."
                    value={submission.notes || ""}
                    onChange={(e) => {
                      const newSubmissions = submissions.map(s =>
                        s.id === submission.id ? { ...s, notes: e.target.value } : s
                      );
                      setSubmissions(newSubmissions);
                    }}
                    onBlur={(e) => updateStatus(submission.id, submission.status, e.target.value)}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                className="w-full"
              >
                {expandedId === submission.id ? 'Show Less' : 'Show More Details'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
