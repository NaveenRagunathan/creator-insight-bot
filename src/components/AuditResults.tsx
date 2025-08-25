import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Download, 
  RotateCcw,
  User,
  Palette,
  Target,
  Search,
  Copy,
  ShoppingCart
} from "lucide-react";

interface AuditResultsProps {
  data: any;
  onNewAudit: () => void;
}

export const AuditResults = ({ data, onNewAudit }: AuditResultsProps) => {
  const [activeTab, setActiveTab] = useState<number | "all">("all");
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-score-excellent";
    if (score >= 60) return "text-score-good";
    if (score >= 40) return "text-score-warning";
    return "text-score-critical";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-score-excellent" />;
    if (score >= 60) return <TrendingUp className="w-5 h-5 text-score-good" />;
    if (score >= 40) return <AlertTriangle className="w-5 h-5 text-score-warning" />;
    return <XCircle className="w-5 h-5 text-score-critical" />;
  };

  const agents = [
    {
      icon: <User className="w-5 h-5" />,
      name: "Business & Profile",
      data: data.business_summary,
      description: "Brand positioning and audience alignment"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      name: "Style & Brand",
      data: data.style_alignment,
      description: "Visual design and brand consistency"
    },
    {
      icon: <Target className="w-5 h-5" />,
      name: "Hero Section",
      data: data.hero_audit,
      description: "First impression and clarity"
    },
    {
      icon: <Copy className="w-5 h-5" />,
      name: "Problem Definition",
      data: data.problem_fit,
      description: "Problem articulation and messaging"
    },
    {
      icon: <Search className="w-5 h-5" />,
      name: "Copy & SEO",
      data: data.copy_seo,
      description: "Content optimization and search visibility"
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      name: "Conversion Analysis",
      data: data.conversion_analysis,
      description: "User flow and conversion barriers"
    }
  ];

  // determine agents to show based on tab
  const displayedAgents = activeTab === "all" ? agents : [agents[activeTab as number]];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full mb-6">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Audit Complete</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Website Audit Report
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Analyzed: <span className="text-foreground font-medium">{data.website_url}</span>
          </p>

          {/* Overall Score */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card-glow inline-block">
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(data.overall_score)}`}>
                {data.overall_score}
              </div>
              <div className="text-left">
                <div className="text-2xl font-semibold">Overall Score</div>
                <div className="text-muted-foreground">Out of 100</div>
              </div>
            </div>
            <Progress value={data.overall_score} className="w-64 h-3" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={onNewAudit} variant="outline" size="lg">
              <RotateCcw className="mr-2 w-4 h-4" />
              Audit Another Site
            </Button>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90">
              <Download className="mr-2 w-4 h-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Tabs / Nav */}
        <div className="flex gap-3 justify-center mb-8 flex-wrap">
          <Button variant={activeTab === "all" ? undefined : "ghost"} size="sm" onClick={() => setActiveTab("all")}>All</Button>
          {agents.map((a, i) => (
            <Button key={a.name} variant={activeTab === i ? undefined : "ghost"} size="sm" onClick={() => setActiveTab(i)}>
              <div className="flex items-center gap-2">
                {a.icon}
                <span className="hidden sm:inline">{a.name}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Agent Analysis Grid */}
        <div className={`grid ${activeTab === "all" ? "lg:grid-cols-2" : "grid-cols-1"} gap-6 mb-12`}>
          {displayedAgents.map((agent, index) => (
            <Card key={index} className="bg-agent-card border border-border shadow-card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {agent.icon}
                  <div>
                    <div className="flex items-center gap-3">
                      {agent.name}
                      {getScoreIcon(agent.data?.score ?? 0)}
                      <Badge variant="outline" className={getScoreColor(agent.data?.score ?? 0)}>
                        {agent.data?.score ?? 0}/100
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={agent.data?.score ?? 0} className="h-2" />
                
                <div>
                  <h4 className="font-semibold mb-2">Key Insights</h4>
                  {Array.isArray(agent.data?.insights) ? (
                    <ul className="text-sm space-y-1">
                      {agent.data.insights.map((ins: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{String(ins)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{String(agent.data?.insights ?? "")}</p>
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {Array.isArray(agent.data?.recommendations) ? (
                      agent.data.recommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-muted-foreground">{String(rec)}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">{String(agent.data?.recommendations ?? "")}</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Recommendations */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 shadow-card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="w-6 h-6 text-primary" />
              Priority Action Items
            </CardTitle>
            <CardDescription>
              Focus on these improvements for maximum impact on your conversion rate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {data.top_recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-secondary rounded-2xl border border-border">
          <h3 className="text-2xl font-bold mb-4">Need Help Implementing These Changes?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team specializes in implementing these exact optimizations to boost conversion rates. 
            Let us turn these insights into results for your business.
          </p>
          <Button size="lg" className="bg-gradient-primary hover:opacity-90">
            Get Implementation Quote
          </Button>
        </div>
      </div>
    </div>
  );
};