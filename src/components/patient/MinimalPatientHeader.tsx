import { useNavigate } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface MinimalPatientHeaderProps {
  patientName: string;
  avatarUrl?: string | null;
  onEditProfile?: () => void;
}

const MinimalPatientHeader = ({ patientName, avatarUrl, onEditProfile }: MinimalPatientHeaderProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const firstName = patientName.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Greeting */}
          <div className="flex items-center gap-3">
            <Avatar 
              className="w-10 h-10 border-2 border-gold/30 cursor-pointer hover:border-gold/60 transition-all"
              onClick={onEditProfile}
            >
              <AvatarImage src={avatarUrl || undefined} alt={patientName} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-inter font-semibold">
                {getInitials(patientName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-gold font-inter font-medium uppercase tracking-wider">Welcome back</p>
              <h1 className="font-playfair text-lg text-foreground font-semibold -mt-0.5">
                {firstName}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 text-muted-foreground hover:text-foreground hidden md:flex"
              onClick={onEditProfile}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MinimalPatientHeader;
