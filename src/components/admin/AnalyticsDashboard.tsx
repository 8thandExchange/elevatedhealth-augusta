import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Users, TrendingUp, Activity, CheckCircle } from "lucide-react";

interface Analytics {
  totalSubmissions: number;
  statusBreakdown: Record<string, number>;
  commonSymptoms: Array<{ symptom: string; count: number }>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
  insuranceDistribution: Record<string, number>;
  goalDistribution: Record<string, number>;
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: submissions, error } = await supabase
        .from('hrt_quiz_submissions')
        .select('*');

      if (error) throw error;

      // Calculate analytics
      const statusBreakdown: Record<string, number> = {};
      const symptomCounts: Record<string, number> = {};
      const ageDistribution: Record<string, number> = {};
      const genderDistribution: Record<string, number> = {};
      const insuranceDistribution: Record<string, number> = {};
      const goalDistribution: Record<string, number> = {};

      submissions?.forEach((sub) => {
        // Status
        statusBreakdown[sub.status] = (statusBreakdown[sub.status] || 0) + 1;

        // Symptoms
        sub.symptoms.forEach((symptom: string) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });

        // Demographics
        ageDistribution[sub.age_range] = (ageDistribution[sub.age_range] || 0) + 1;
        genderDistribution[sub.gender] = (genderDistribution[sub.gender] || 0) + 1;
        insuranceDistribution[sub.insurance] = (insuranceDistribution[sub.insurance] || 0) + 1;
        goalDistribution[sub.primary_goal] = (goalDistribution[sub.primary_goal] || 0) + 1;
      });

      // Sort symptoms by frequency
      const commonSymptoms = Object.entries(symptomCounts)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setAnalytics({
        totalSubmissions: submissions?.length || 0,
        statusBreakdown,
        commonSymptoms,
        ageDistribution,
        genderDistribution,
        insuranceDistribution,
        goalDistribution,
      });
    } catch (error: any) {
      toast.error("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSubmissions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.statusBreakdown.new || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.statusBreakdown.contacted || 0) + (analytics.statusBreakdown.scheduled || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.statusBreakdown.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Common Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle>Most Common Symptoms</CardTitle>
          <CardDescription>Top 10 symptoms reported by patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.commonSymptoms.map(({ symptom, count }) => (
              <div key={symptom} className="flex items-center justify-between">
                <span className="text-sm">{symptom}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(count / analytics.totalSubmissions) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demographics Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.ageDistribution).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between text-sm">
                  <span>{range}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.genderDistribution).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between text-sm">
                  <span>{gender}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insurance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.insuranceDistribution).map(([insurance, count]) => (
                <div key={insurance} className="flex items-center justify-between text-sm">
                  <span>{insurance}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Primary Goals */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Treatment Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.goalDistribution).map(([goal, count]) => (
                <div key={goal} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{goal.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
