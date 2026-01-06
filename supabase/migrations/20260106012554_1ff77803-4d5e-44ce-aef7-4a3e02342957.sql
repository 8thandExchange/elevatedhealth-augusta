-- Create email_templates table for editable email/SMS templates
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  template_key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  sms_text TEXT,
  merge_fields TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Staff and admins can view templates
CREATE POLICY "Staff and admins can view templates"
ON public.email_templates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create communication_logs table to track all sent messages
CREATE TABLE public.communication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  sent_by UUID,
  template_key TEXT,
  subject TEXT,
  body_preview TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- Patients can view their own communication logs
CREATE POLICY "Patients can view their own communication logs"
ON public.communication_logs
FOR SELECT
USING (patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()));

-- Staff and admins can view all communication logs
CREATE POLICY "Staff and admins can view all communication logs"
ON public.communication_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Staff and admins can insert communication logs
CREATE POLICY "Staff and admins can insert communication logs"
ON public.communication_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Insert default templates
INSERT INTO public.email_templates (name, template_key, category, subject, body_html, sms_text, merge_fields) VALUES
(
  'Welcome Email',
  'welcome',
  'onboarding',
  'Welcome to Elevated Health Augusta, {{patient_name}}!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">Welcome to Elevated Health Augusta!</h1>
    <p>Dear {{patient_name}},</p>
    <p>We are thrilled to welcome you to the Elevated Health Augusta family. Your journey to optimal health and wellness begins now.</p>
    <p>Here''s what happens next:</p>
    <ul>
      <li>Complete your intake forms in the patient portal</li>
      <li>Schedule your initial consultation</li>
      <li>Review your personalized treatment plan</li>
    </ul>
    <p>If you have any questions, please don''t hesitate to reach out at <strong>(706) 922-7454</strong>.</p>
    <p>Warm regards,<br>The Elevated Health Augusta Team</p>
  </div>',
  'Welcome to Elevated Health Augusta, {{patient_name}}! Your journey to optimal health starts now. Questions? Call (706) 922-7454',
  ARRAY['patient_name', 'first_name', 'email']
),
(
  '$99 Discovery Consultation Invite',
  'consultation_invite',
  'onboarding',
  'Your $99 Discovery Consultation Awaits, {{patient_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">Take the First Step to Feeling Your Best</h1>
    <p>Dear {{patient_name}},</p>
    <p>You''ve been invited to schedule a <strong>$99 Discovery Consultation</strong> with our expert clinical team.</p>
    <p>During this comprehensive 30-minute session, we''ll:</p>
    <ul>
      <li>Review your health history and current concerns</li>
      <li>Discuss your wellness goals</li>
      <li>Create a personalized roadmap to optimal health</li>
    </ul>
    <p><a href="{{payment_link}}" style="background-color: #c9a962; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Book Your Consultation</a></p>
    <p>Questions? Call us at <strong>(706) 922-7454</strong></p>
  </div>',
  'Hi {{patient_name}}! Book your $99 Discovery Consultation at Elevated Health Augusta. Click here: {{payment_link}} or call (706) 922-7454',
  ARRAY['patient_name', 'first_name', 'payment_link']
),
(
  'Kit Payment Request',
  'kit_payment',
  'billing',
  'Complete Your Lab Kit Payment - {{patient_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">Your Lab Kit is Ready</h1>
    <p>Dear {{patient_name}},</p>
    <p>To continue your health optimization journey, please complete your lab kit payment. Once received, we''ll ship your at-home collection kit within 24-48 hours.</p>
    <p><a href="{{payment_link}}" style="background-color: #c9a962; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Payment</a></p>
    <p>Questions? Call <strong>(706) 922-7454</strong></p>
  </div>',
  'Hi {{patient_name}}, complete your lab kit payment to continue: {{payment_link}}. Questions? (706) 922-7454',
  ARRAY['patient_name', 'payment_link', 'kit_type']
),
(
  'Labs Reviewed Notification',
  'labs_reviewed',
  'clinical',
  'Your Lab Results Are Ready - {{patient_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">Great News! Your Lab Results Are In</h1>
    <p>Dear {{patient_name}},</p>
    <p>Our clinical team has reviewed your lab results and your personalized insights are now available in your patient portal.</p>
    <p>Your provider will reach out shortly to discuss your results and next steps.</p>
    <p>Log in to your portal to view your results now.</p>
    <p>Questions? Call <strong>(706) 922-7454</strong></p>
  </div>',
  'Hi {{patient_name}}, your lab results are ready! Log into your patient portal or call (706) 922-7454',
  ARRAY['patient_name', 'first_name']
),
(
  'Treatment Authorized',
  'treatment_authorized',
  'clinical',
  'Your Treatment Has Been Authorized - {{patient_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">Your Treatment is Approved!</h1>
    <p>Dear {{patient_name}},</p>
    <p>Great news! Your treatment protocol has been authorized by our clinical team. Your prescription will be sent to our partner pharmacy shortly.</p>
    <p>You can expect to receive your treatment within 5-7 business days.</p>
    <p>Questions? Call <strong>(706) 922-7454</strong></p>
  </div>',
  'Hi {{patient_name}}, your treatment has been authorized! Expect delivery in 5-7 days. Questions? (706) 922-7454',
  ARRAY['patient_name', 'treatment_type']
),
(
  'Intake Reminder',
  'intake_reminder',
  'onboarding',
  'Complete Your Health Intake - {{patient_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">One More Step to Get Started</h1>
    <p>Dear {{patient_name}},</p>
    <p>We noticed you haven''t completed your health intake forms yet. This information helps us create your personalized treatment plan.</p>
    <p>It only takes about 10 minutes to complete.</p>
    <p><a href="{{portal_link}}" style="background-color: #c9a962; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Complete Intake Now</a></p>
  </div>',
  'Hi {{patient_name}}, please complete your intake forms to continue your health journey. Questions? (706) 922-7454',
  ARRAY['patient_name', 'portal_link']
),
(
  'Appointment Reminder',
  'appointment_reminder',
  'scheduling',
  'Reminder: Your Appointment Tomorrow - {{patient_name}}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #1a1a2e;">Appointment Reminder</h1>
    <p>Dear {{patient_name}},</p>
    <p>This is a friendly reminder about your appointment tomorrow at <strong>{{appointment_time}}</strong>.</p>
    <p><strong>Location:</strong> 1230 Augusta West Parkway, Augusta, GA 30909</p>
    <p>Need to reschedule? Call us at <strong>(706) 922-7454</strong></p>
  </div>',
  'Hi {{patient_name}}, reminder: your appointment is tomorrow at {{appointment_time}}. Need to reschedule? Call (706) 922-7454',
  ARRAY['patient_name', 'appointment_time', 'appointment_date']
);