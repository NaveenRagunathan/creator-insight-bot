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
      const { supabase } = await import("@/integrations/supabase/client");
      
      const response = await supabase.functions.invoke('website-audit', {
        body: {
          website_url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
          social_url: socialUrl || null,
          email: email || null
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const auditData = response.data;
      
      // Transform the API response to match the expected UI format
      const transformedResults = {
        overall_score: auditData.overallScore,
        website_url: websiteUrl,
        social_url: socialUrl,
        business_summary: {
          score: auditData.auditResults.business.score,
          insights: auditData.auditResults.business.insights,
          recommendations: auditData.auditResults.business.recommendations
        },
        style_alignment: {
          score: auditData.auditResults.style.score,
          insights: auditData.auditResults.style.insights,
          recommendations: auditData.auditResults.style.recommendations
        },
        hero_audit: {
          score: auditData.auditResults.hero.score,
          insights: auditData.auditResults.hero.insights,
          recommendations: auditData.auditResults.hero.recommendations
        },
        problem_fit: {
          score: auditData.auditResults.problem.score,
          insights: auditData.auditResults.problem.insights,
          recommendations: auditData.auditResults.problem.recommendations
        },
        copy_seo: {
          score: auditData.auditResults.seo.score,
          insights: auditData.auditResults.seo.insights,
          recommendations: auditData.auditResults.seo.recommendations
        },
        conversion_analysis: {
          score: auditData.auditResults.conversion.score,
          insights: auditData.auditResults.conversion.insights,
          recommendations: auditData.auditResults.conversion.recommendations
        },
        top_recommendations: [
          ...auditData.auditResults.hero.recommendations.slice(0, 2),
          ...auditData.auditResults.conversion.recommendations.slice(0, 2),
          ...auditData.auditResults.seo.recommendations.slice(0, 1)
        ].filter(Boolean).slice(0, 5)
      };

      onAuditComplete(transformedResults);
      
      toast({
        title: "Audit Complete!",
        description: "Your AI website audit has been generated successfully.",
      });
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: "Audit Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
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