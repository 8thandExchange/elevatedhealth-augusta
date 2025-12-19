import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, ShieldAlert } from "lucide-react";

interface IdleWarningModalProps {
  isOpen: boolean;
  remainingTime: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export const IdleWarningModal = ({
  isOpen,
  remainingTime,
  onStayLoggedIn,
  onLogout,
}: IdleWarningModalProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs} seconds`;
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-full">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-xl">Session Timeout Warning</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-4">
            <p>
              For your security, you will be automatically logged out due to inactivity.
            </p>
            <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {formatTime(remainingTime)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Click "Stay Logged In" to continue your session, or you will be redirected to the login page.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onLogout} className="border-destructive text-destructive hover:bg-destructive/10">
            Log Out Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={onStayLoggedIn} className="bg-primary hover:bg-primary/90">
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
