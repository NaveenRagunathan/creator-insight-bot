import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, TrendingUp } from "lucide-react";

export const Hero = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('audit-form');
    formSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-bg"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="relative container mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-8">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI-Powered Website Analysis</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
          Get Your Website
          <span className="block bg-gradient-primary bg-clip-text text-transparent">
            Audit Report
          </span>
          in Minutes
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
          Our AI agents analyze your website across 6 critical dimensions: design, copy, SEO, 
          conversion barriers, and brand alignment. Get actionable insights to boost your conversions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-audit-glow"
            onClick={scrollToForm}
          >
            Start Free Audit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-border/50 text-lg px-8 py-6"
          >
            View Sample Report
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-agent-card border border-border rounded-xl p-6 shadow-card-glow">
            <Target className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">6 AI Agents</h3>
            <p className="text-sm text-muted-foreground">Specialized agents analyze design, copy, SEO, conversions, and more</p>
          </div>
          <div className="bg-agent-card border border-border rounded-xl p-6 shadow-card-glow">
            <TrendingUp className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">Actionable Insights</h3>
            <p className="text-sm text-muted-foreground">Get prioritized recommendations to improve your conversion rate</p>
          </div>
          <div className="bg-agent-card border border-border rounded-xl p-6 shadow-card-glow">
            <Zap className="w-8 h-8 text-primary mb-4 mx-auto" />
            <h3 className="font-semibold mb-2">Fast Results</h3>
            <p className="text-sm text-muted-foreground">Complete audit report generated in under 2 minutes</p>
          </div>
        </div>
      </div>
    </section>
  );
};