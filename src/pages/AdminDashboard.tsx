import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SubmissionsList } from "@/components/admin/SubmissionsList";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import AdminNavbar from "@/components/admin/AdminNavbar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        navigate("/admin/login");
        return;
      }

      // Check if user has admin or staff role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleError) throw roleError;

      const hasAccess = roles?.some(r => r.role === 'admin' || r.role === 'staff');
      
      if (!hasAccess) {
        await supabase.auth.signOut();
        toast.error("Access denied");
        navigate("/admin/login");
        return;
      }

      setUserEmail(user.email || "");
      setIsLoading(false);
    } catch (error: any) {
      toast.error(error.message || "Authentication error");
      navigate("/admin/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar 
        title="HRT Quiz Dashboard" 
        subtitle={userEmail}
      />

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <SubmissionsList />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
