import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  ArrowRight, 
  Pill, 
  Leaf, 
  Brain, 
  Zap,
  ShoppingCart,
  BookOpen,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

interface LabData {
  testosterone_t?: number | null;
  estradiol_e2?: number | null;
  cortisol_morning?: number | null;
  cortisol_noon?: number | null;
  cortisol_evening?: number | null;
  cortisol_night?: number | null;
  dhea_s?: number | null;
  progesterone_pg?: number | null;
  fasting_insulin?: number | null;
  a1c?: number | null;
  tsh?: number | null;
  free_t3?: number | null;
  free_t4?: number | null;
  serotonin?: number | null;
  dopamine?: number | null;
  gaba?: number | null;
  glutamate?: number | null;
  mercury?: number | null;
  lead_level?: number | null;
  arsenic?: number | null;
  cadmium?: number | null;
  vitamin_d?: number | null;
  magnesium?: number | null;
  selenium?: number | null;
  zinc?: number | null;
  triglycerides?: number | null;
  hdl?: number | null;
  ldl?: number | null;
}

interface ActionItem {
  id: string;
  severity: 'red' | 'yellow';
  finding: string;
  description: string;
  recommendation: string;
  actionLabel: string;
  actionLink: string;
  actionType: 'supplement' | 'protocol' | 'consult' | 'learn';
  icon: React.ComponentType<{ className?: string }>;
}

interface ActionPlanTabProps {
  labData: LabData | null;
  gender?: string;
}

const generateActionItems = (data: LabData | null, gender?: string): ActionItem[] => {
  if (!data) return [];
  
  const actions: ActionItem[] = [];

  // Vitamin D
  if (data.vitamin_d !== null && data.vitamin_d !== undefined) {
    if (data.vitamin_d < 30) {
      actions.push({
        id: 'low-vitamin-d',
        severity: 'red',
        finding: `Low Vitamin D (${data.vitamin_d} ng/mL)`,
        description: 'Vitamin D deficiency impairs immune function, bone health, and mood regulation.',
        recommendation: 'Vitamin D3 5,000 IU daily with fatty meal',
        actionLabel: 'Shop Supplements',
        actionLink: '/patient/resources',
        actionType: 'supplement',
        icon: Pill,
      });
    } else if (data.vitamin_d < 50) {
      actions.push({
        id: 'subopt-vitamin-d',
        severity: 'yellow',
        finding: `Sub-optimal Vitamin D (${data.vitamin_d} ng/mL)`,
        description: 'Optimal Vitamin D is 50-80 ng/mL for hormone production and immune health.',
        recommendation: 'Vitamin D3 2,000-3,000 IU daily',
        actionLabel: 'Shop Supplements',
        actionLink: '/patient/resources',
        actionType: 'supplement',
        icon: Pill,
      });
    }
  }

  // Magnesium
  if (data.magnesium !== null && data.magnesium !== undefined && data.magnesium < 4.5) {
    actions.push({
      id: 'low-magnesium',
      severity: 'red',
      finding: `Low Magnesium (${data.magnesium} mg/dL)`,
      description: 'Magnesium deficiency causes muscle cramps, anxiety, insomnia, and impairs hormone production.',
      recommendation: 'Magnesium Glycinate 400mg at bedtime',
      actionLabel: 'Shop Supplements',
      actionLink: '/patient/resources',
      actionType: 'supplement',
      icon: Leaf,
    });
  }

  // Mercury
  if (data.mercury !== null && data.mercury !== undefined && data.mercury > 5) {
    actions.push({
      id: 'high-mercury',
      severity: 'red',
      finding: `Elevated Mercury (${data.mercury} μg/L)`,
      description: 'Mercury toxicity impairs thyroid function, neurological health, and hormone metabolism.',
      recommendation: 'Heavy Metal Detox Protocol - Consider amalgam removal evaluation',
      actionLabel: 'Book Detox Consult',
      actionLink: '/consult',
      actionType: 'consult',
      icon: AlertTriangle,
    });
  }

  // Lead
  if (data.lead_level !== null && data.lead_level !== undefined && data.lead_level > 5) {
    actions.push({
      id: 'high-lead',
      severity: 'red',
      finding: `Elevated Lead (${data.lead_level} μg/dL)`,
      description: 'Lead exposure affects cognitive function and cardiovascular health. Check home/water sources.',
      recommendation: 'Chelation Protocol + Environmental Assessment',
      actionLabel: 'Book Consult',
      actionLink: '/consult',
      actionType: 'consult',
      icon: AlertTriangle,
    });
  }

  // High Cortisol
  if (data.cortisol_morning !== null && data.cortisol_morning !== undefined && data.cortisol_morning > 25) {
    actions.push({
      id: 'high-cortisol',
      severity: 'yellow',
      finding: `Elevated Morning Cortisol (${data.cortisol_morning} ng/mL)`,
      description: 'Chronic stress response can lead to weight gain, sleep issues, and hormone imbalance.',
      recommendation: 'AdreneVive + Stress Management Protocol',
      actionLabel: 'Start Adrenal Repair',
      actionLink: '/patient/resources',
      actionType: 'protocol',
      icon: Brain,
    });
  }

  // Flat Cortisol Curve
  if (data.cortisol_morning !== null && data.cortisol_night !== null && 
      data.cortisol_morning !== undefined && data.cortisol_night !== undefined) {
    const ratio = data.cortisol_morning / (data.cortisol_night || 1);
    if (ratio < 3) {
      actions.push({
        id: 'adrenal-fatigue',
        severity: 'red',
        finding: 'Adrenal Exhaustion Pattern',
        description: 'Flat cortisol curve indicates HPA axis dysfunction. You may feel "wired but tired".',
        recommendation: 'Adrenal Recovery Protocol with adaptogenic herbs',
        actionLabel: 'Start Adrenal Repair',
        actionLink: '/patient/resources',
        actionType: 'protocol',
        icon: Zap,
      });
    }
  }

  // Insulin Resistance
  if (data.fasting_insulin !== null && data.fasting_insulin !== undefined && data.fasting_insulin > 10) {
    actions.push({
      id: 'insulin-resistance',
      severity: 'red',
      finding: `Insulin Resistance (${data.fasting_insulin} uIU/mL)`,
      description: 'Elevated insulin blocks fat burning and accelerates aging. Your metabolism is "stuck".',
      recommendation: 'GLP-1 Therapy + Low-Carb Protocol',
      actionLabel: 'Explore Weight Loss',
      actionLink: '/weight-loss',
      actionType: 'protocol',
      icon: Zap,
    });
  }

  // Pre-Diabetes
  if (data.a1c !== null && data.a1c !== undefined && data.a1c > 5.7) {
    actions.push({
      id: 'pre-diabetes',
      severity: data.a1c > 6.4 ? 'red' : 'yellow',
      finding: `Elevated HbA1c (${data.a1c}%)`,
      description: data.a1c > 6.4 ? 'Diabetic range. Immediate intervention needed.' : 'Pre-diabetic range. Early intervention can reverse this.',
      recommendation: 'Metabolic Reset Protocol + GLP-1 Therapy',
      actionLabel: 'Start Metabolic Reset',
      actionLink: '/weight-loss',
      actionType: 'protocol',
      icon: Zap,
    });
  }

  // Low Serotonin
  if (data.serotonin !== null && data.serotonin !== undefined && data.serotonin < 120) {
    actions.push({
      id: 'low-serotonin',
      severity: 'yellow',
      finding: `Low Serotonin (${data.serotonin} μg/g)`,
      description: 'Serotonin deficiency causes mood instability, anxiety, and sleep disturbances.',
      recommendation: '5-HTP 100mg + B6 Support or Ketamine Therapy',
      actionLabel: 'Learn About Options',
      actionLink: '/ketamine',
      actionType: 'learn',
      icon: Brain,
    });
  }

  // Low GABA
  if (data.gaba !== null && data.gaba !== undefined && data.gaba < 2.5) {
    actions.push({
      id: 'low-gaba',
      severity: 'yellow',
      finding: `Low GABA (${data.gaba} μmol/L)`,
      description: 'GABA deficiency causes anxiety, racing thoughts, and difficulty relaxing.',
      recommendation: 'L-Theanine + Magnesium + GABA Support',
      actionLabel: 'Shop Supplements',
      actionLink: '/patient/resources',
      actionType: 'supplement',
      icon: Brain,
    });
  }

  // High Triglycerides
  if (data.triglycerides !== null && data.triglycerides !== undefined && data.triglycerides > 150) {
    actions.push({
      id: 'high-triglycerides',
      severity: data.triglycerides > 200 ? 'red' : 'yellow',
      finding: `Elevated Triglycerides (${data.triglycerides} mg/dL)`,
      description: 'High triglycerides increase cardiovascular risk and indicate metabolic dysfunction.',
      recommendation: 'Omega-3 Protocol + Reduce Refined Carbohydrates',
      actionLabel: 'Learn More',
      actionLink: '/patient/resources',
      actionType: 'learn',
      icon: Zap,
    });
  }

  // Subclinical Hypothyroid
  if (data.tsh !== null && data.tsh !== undefined && data.tsh > 2.5) {
    actions.push({
      id: 'thyroid-suboptimal',
      severity: data.tsh > 4.5 ? 'red' : 'yellow',
      finding: `Sub-optimal Thyroid (TSH ${data.tsh} mIU/L)`,
      description: 'Elevated TSH indicates sluggish thyroid. Causes fatigue, weight gain, cold intolerance.',
      recommendation: 'Thyroid optimization with T3/T4 support',
      actionLabel: 'Book Thyroid Consult',
      actionLink: '/consult',
      actionType: 'consult',
      icon: Zap,
    });
  }

  // Sort by severity (red first)
  return actions.sort((a, b) => {
    if (a.severity === 'red' && b.severity === 'yellow') return -1;
    if (a.severity === 'yellow' && b.severity === 'red') return 1;
    return 0;
  });
};

const ActionPlanTab = ({ labData, gender }: ActionPlanTabProps) => {
  const actionItems = generateActionItems(labData, gender);

  if (actionItems.length === 0) {
    return (
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-playfair text-xl text-foreground mb-2">Looking Great!</h3>
            <p className="text-muted-foreground font-inter text-sm max-w-sm mx-auto">
              {labData ? 
                "Your labs look optimal. Keep up the good work! Continue your current protocol and check back after your next lab panel." :
                "Complete your lab testing to receive personalized action items based on your biology."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const redCount = actionItems.filter(a => a.severity === 'red').length;
  const yellowCount = actionItems.filter(a => a.severity === 'yellow').length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="bg-card border-border/50 rounded-2xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-playfair text-lg text-foreground">Your Action Plan</h3>
            <div className="flex gap-2">
              {redCount > 0 && (
                <Badge className="bg-red-500/10 text-red-500 border-0 gap-1 font-inter">
                  <AlertTriangle className="w-3 h-3" />
                  {redCount} Critical
                </Badge>
              )}
              {yellowCount > 0 && (
                <Badge className="bg-gold/10 text-gold border-0 gap-1 font-inter">
                  {yellowCount} Attention
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-inter">
            Personalized recommendations based on your lab results
          </p>
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="space-y-3">
        {actionItems.map((item) => {
          const Icon = item.icon;
          const actionIcon = {
            supplement: ShoppingCart,
            protocol: Zap,
            consult: Calendar,
            learn: BookOpen,
          }[item.actionType];
          const ActionIcon = actionIcon;

          return (
            <Card 
              key={item.id} 
              className={`rounded-2xl overflow-hidden border-l-4 ${
                item.severity === 'red' 
                  ? 'border-l-red-500 bg-red-500/5' 
                  : 'border-l-gold bg-gold/5'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  {/* Header Row */}
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.severity === 'red' 
                        ? 'bg-red-500/10' 
                        : 'bg-gold/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        item.severity === 'red' ? 'text-red-500' : 'text-gold'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-inter font-semibold text-foreground text-sm">{item.finding}</h4>
                        <Badge 
                          variant="outline" 
                          className={`shrink-0 text-xs font-inter ${
                            item.severity === 'red' 
                              ? 'border-red-500/30 text-red-500 bg-red-500/5' 
                              : 'border-gold/30 text-gold bg-gold/5'
                          }`}
                        >
                          {item.severity === 'red' ? 'Critical' : 'Attention'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-inter mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-13 sm:pl-0">
                    <p className="text-sm font-inter text-foreground/80 flex items-start gap-1">
                      <span className="text-gold">→</span>
                      <span>{item.recommendation}</span>
                    </p>
                    <Link to={item.actionLink} className="shrink-0">
                      <Button 
                        size="sm" 
                        className="h-8 px-4 bg-navy hover:bg-navy-light text-white font-inter text-xs gap-1.5 rounded-xl w-full sm:w-auto"
                      >
                        <ActionIcon className="w-3 h-3" />
                        {item.actionLabel}
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ActionPlanTab;
