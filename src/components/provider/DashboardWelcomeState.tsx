import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, Calendar, MessageCircle, FileText, Activity } from "lucide-react";
import AddPatientModal from "./AddPatientModal";
import TodayScheduleWidget from "./TodayScheduleWidget";
import { CORE_SERVICES } from "@/lib/stripeConfig";

interface DashboardWelcomeStateProps {
  providerName: string;
  onPatientSelect?: (patientId: string) => void;
  onRefresh?: () => void;
  stats?: {
    pendingReview: number;
    todayAppointments: number;
    unreadMessages: number;
    pendingLabs: number;
  };
}

const DashboardWelcomeState = ({ 
  providerName, 
  onPatientSelect, 
  onRefresh,
  stats = { pendingReview: 0, todayAppointments: 0, unreadMessages: 0, pendingLabs: 0 }
}: DashboardWelcomeStateProps) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h2 className="text-2xl font-playfair text-foreground mb-2">
          Welcome, {providerName}
        </h2>
        <p className="text-muted-foreground">
          Select a patient from the list or use the quick actions below
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-4 pb-3 text-center">
            <Activity className="w-6 h-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.pendingReview}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <CardContent className="pt-4 pb-3 text-center">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.todayAppointments}</p>
            <p className="text-xs text-muted-foreground">Today's Appointments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
          <CardContent className="pt-4 pb-3 text-center">
            <MessageCircle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.unreadMessages}</p>
            <p className="text-xs text-muted-foreground">Unread Messages</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-4 pb-3 text-center">
            <FileText className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-foreground">{stats.pendingLabs}</p>
            <p className="text-xs text-muted-foreground">Labs Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Patient Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Add Patient
            </CardTitle>
            <CardDescription>
              Start a new patient journey or add an existing patient
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AddPatientModal 
              onPatientAdded={onRefresh}
              trigger={
                <Button className="w-full gap-2" size="lg">
                  <UserPlus className="w-5 h-5" />
                  Add New Patient
                </Button>
              }
            />
            <p className="text-xs text-center text-muted-foreground">
              Choose between Wellness Assessment invite ({CORE_SERVICES.wellnessAssessment.displayPrice}) or direct add (no fee)
            </p>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <TodayScheduleWidget 
          onPatientSelect={onPatientSelect} 
          compact 
        />
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-3 flex flex-col gap-1">
              <Users className="w-5 h-5" />
              <span className="text-xs">All Patients</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col gap-1">
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Consultations</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col gap-1">
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">Messages</span>
            </Button>
            <Button variant="outline" className="h-auto py-3 flex flex-col gap-1">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Resources</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardWelcomeState;
