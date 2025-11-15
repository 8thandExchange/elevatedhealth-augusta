import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, TrendingDown, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultationModal = ({ isOpen, onClose }: ConsultationModalProps) => {
  const consultationOptions = [
    {
      icon: Brain,
      title: "Ketamine Therapy",
      description: "IV infusions & SPRAVATO® for depression, PTSD, and anxiety",
      color: "primary",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0XA11WP_5kIZjLuXt6N_cJq5cpLLRdm3T19lrV6w-gjh-VeN5JN0yybyGHXEP1Qo8rjBOpzMyW?gv=true"
    },
    {
      icon: TrendingDown,
      title: "Medical Weight Loss",
      description: "Physician-supervised semaglutide (GLP-1) therapy",
      color: "accent",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1CBfpH07YJj-i6hEBsR8fQQSlo73zA8irBgHx6vj82matcVWu0-K-MFMrC5euDFR-vG5QujSlP?gv=true"
    },
    {
      icon: Zap,
      title: "Hormone Replacement",
      description: "Bioidentical hormone therapy to restore vitality",
      color: "gold",
      bookingUrl: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ1hhrEVpqc7nipsCg8QbgW72gW8vbl-SnUXT-LL4z4zFT1w8jTUBr5cfiruiNd47uu28seod93b?gv=true"
    }
  ];

  const handleBooking = (url: string) => {
    window.open(url, "_blank");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center mb-2">
            Book Your Free Consultation
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Choose the service you're interested in to schedule your consultation
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {consultationOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <Card 
                key={index}
                className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-${option.color}/40`}
                onClick={() => handleBooking(option.bookingUrl)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`mb-4 inline-flex p-4 rounded-xl bg-${option.color}/10 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-10 w-10 text-${option.color}`} />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {option.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {option.description}
                  </p>

                  <Button 
                    className={`w-full bg-${option.color} hover:bg-${option.color}-light text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBooking(option.bookingUrl);
                    }}
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
