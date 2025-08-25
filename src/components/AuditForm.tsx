import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Globe, Twitter, Linkedin, Instagram, Sparkles } from "lucide-react";

interface AuditFormProps {
  onStartAudit: () => void;
  onAuditComplete: (data: any) => void;
}

export const AuditForm = ({ onStartAudit, onAuditComplete }: AuditFormProps) => {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteUrl) {
      toast({
        title: "Website URL Required",
        description: "Please enter a website URL to audit.",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(websiteUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    onStartAudit();

    try {
      // TODO: Replace with actual API call to Supabase Edge Function
      // This will call the AI agents once Supabase is connected
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call
      
      // Mock audit results for demo
      const mockResults = {
        overall_score: 78,
        website_url: websiteUrl,
        social_url: socialUrl,
        business_summary: {
          score: 85,
          insights: "Strong brand positioning in the tech space with clear value proposition.",
          recommendations: ["Clarify target audience in hero section", "Add social proof testimonials"]
        },
        style_alignment: {
          score: 72,
          insights: "Brand style is modern but could better reflect professional expertise.",
          recommendations: ["Update color scheme for more authority", "Improve typography hierarchy"]
        },
        hero_audit: {
          score: 68,
          insights: "Hero section lacks clarity and compelling call-to-action.",
          recommendations: ["Rewrite headline for immediate clarity", "Strengthen primary CTA button"]
        },
        problem_fit: {
          score: 75,
          insights: "Problem articulation is present but could be more specific.",
          recommendations: ["Add pain point specificity", "Include customer problem examples"]
        },
        copy_seo: {
          score: 82,
          insights: "SEO fundamentals are solid with room for content optimization.",
          recommendations: ["Optimize meta descriptions", "Add more semantic keywords"]
        },
        conversion_analysis: {
          score: 70,
          insights: "Several conversion barriers identified in user flow.",
          recommendations: ["Reduce form friction", "Add trust signals", "Improve mobile CTA placement"]
        },
        top_recommendations: [
          "Clarify your hero headline for immediate impact",
          "Add customer testimonials and trust badges",
          "Optimize mobile call-to-action placement",
          "Strengthen problem-solution messaging",
          "Improve page loading speed"
        ]
      };

      onAuditComplete(mockResults);
      
      toast({
        title: "Audit Complete!",
        description: "Your website audit has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Audit Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <section id="audit-form" className="py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-card border border-border shadow-card-glow">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Start Your AI Website Audit
            </CardTitle>
            <CardDescription className="text-base">
              Enter your website URL and optionally your social profile to get comprehensive insights from our AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website URL *
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social" className="text-sm font-medium flex items-center gap-2">
                  <div className="flex gap-1">
                    <Twitter className="w-4 h-4" />
                    <Linkedin className="w-4 h-4" />
                    <Instagram className="w-4 h-4" />
                  </div>
                  Social Profile (Optional)
                </Label>
                <Input
                  id="social"
                  type="url"
                  placeholder="https://twitter.com/yourhandle or LinkedIn profile"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Adding your social profile helps our AI understand your brand voice and audience.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />
                <p className="text-xs text-muted-foreground">
                  Get your audit report emailed to you for future reference.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity text-lg py-6 shadow-audit-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Starting Audit..." : "Analyze My Website"}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>⚡ Analysis typically takes 1-2 minutes</p>
              <p>🔒 Your data is secure and never shared</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};