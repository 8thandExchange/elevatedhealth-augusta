import { Card } from "@/components/ui/card";
import providerImage from "@/assets/provider-portrait.jpg";
import { Award, Heart, GraduationCap, Shield, BookOpen, Users2, CheckCircle2 } from "lucide-react";

const Team = () => {
  return (
    <section id="team" className="py-24 bg-muted/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-2 rounded-full mb-6">
              <Award className="h-5 w-5" />
              <span className="font-semibold">Meet Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Experienced Providers Dedicated to Your Healing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our board-certified team brings years of specialized training in ketamine therapy and mental health treatment
            </p>
          </div>

          <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-12 max-w-4xl mx-auto">
            <Card className="overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-[500px] md:h-auto">
                  <img 
                    src={providerImage} 
                    alt="Healthcare provider at Elevated Health Augusta" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center bg-gradient-subtle">
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-primary mb-2">Lauren Bursey, NP-C</h3>
                    <div className="text-lg text-muted-foreground mb-4">Board-Certified Nurse Practitioner</div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <GraduationCap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Specialized Training</div>
                        <div className="text-muted-foreground">
                          Advanced certification in ketamine therapy and mental health treatment protocols
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Heart className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Patient-Centered Approach</div>
                        <div className="text-muted-foreground">
                          Committed to creating a safe, welcoming environment where patients feel heard and supported
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Award className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <div className="font-semibold text-foreground mb-1">Evidence-Based Care</div>
                        <div className="text-muted-foreground">
                          Utilizes the latest research and proven protocols to deliver optimal outcomes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
                    <p className="text-foreground italic">
                      "Elevated Health was created as a space for patients to start healing. Our services help with anxiety, depression, PTSD, and OCD. Patients feel safe here, and that's our goal. While the journey to healing is hard, it's worth the effort."
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Credentials Section */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-primary mb-4">Professional Credentials & Qualifications</h3>
              <p className="text-lg text-muted-foreground">
                Specialized training and certifications in advanced mental health treatment
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Education & Certifications */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Education & Certification</h4>
                    <p className="text-sm text-muted-foreground">Academic Background & Clinical Training</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Board-Certified Nurse Practitioner (NP-C)</div>
                      <div className="text-sm text-muted-foreground">American Academy of Nurse Practitioners</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Advanced Practice Registered Nurse</div>
                      <div className="text-sm text-muted-foreground">Georgia Board of Nursing</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Ketamine Therapy Certification</div>
                      <div className="text-sm text-muted-foreground">Specialized training in ketamine-assisted therapy protocols</div>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Specialized Training */}
              <Card className="p-8 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Specialized Training</h4>
                    <p className="text-sm text-muted-foreground">Advanced Clinical Expertise</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Treatment-Resistant Depression</div>
                      <div className="text-sm text-muted-foreground">Advanced protocols for complex cases</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">PTSD & Trauma-Informed Care</div>
                      <div className="text-sm text-muted-foreground">Specialized approach for veterans and first responders</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Mental Health Pharmacology</div>
                      <div className="text-sm text-muted-foreground">Comprehensive medication management expertise</div>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Professional Memberships */}
              <Card className="p-8 bg-gradient-to-br from-gold/5 to-primary/5 border-gold/10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Users2 className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Professional Memberships</h4>
                    <p className="text-sm text-muted-foreground">Active Medical Associations</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">American Association of Nurse Practitioners</div>
                      <div className="text-sm text-muted-foreground">National professional organization</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Georgia Nurses Association</div>
                      <div className="text-sm text-muted-foreground">State professional organization</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">American Psychiatric Nurses Association</div>
                      <div className="text-sm text-muted-foreground">Specialized psychiatric nursing organization</div>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Clinical Focus Areas */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-gold/5 border-primary/10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Clinical Focus Areas</h4>
                    <p className="text-sm text-muted-foreground">Treatment Specializations</p>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Depression & Anxiety Disorders</div>
                      <div className="text-sm text-muted-foreground">Evidence-based treatment approaches</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Chronic Pain Management</div>
                      <div className="text-sm text-muted-foreground">Integrated pain and mental health care</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-foreground">Veterans Mental Health</div>
                      <div className="text-sm text-muted-foreground">Specialized care for military service members</div>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Commitment Statement */}
            <Card className="mt-8 p-8 bg-gradient-to-r from-primary/5 via-accent/5 to-gold/5 border-primary/20">
              <div className="text-center max-w-3xl mx-auto">
                <Award className="h-12 w-12 text-gold mx-auto mb-4" />
                <h4 className="text-2xl font-bold text-foreground mb-4">Commitment to Excellence</h4>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Lauren Bursey, NP-C maintains active participation in continuing education and stays current with the latest advances in ketamine therapy, mental health treatment, and evidence-based medicine. Her commitment to professional development ensures that patients receive the most effective and compassionate care available.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
