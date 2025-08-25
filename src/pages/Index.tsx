import { useState } from "react";
import { AuditForm } from "@/components/AuditForm";
import { AuditResults } from "@/components/AuditResults";
import { Hero } from "@/components/Hero";

const Index = () => {
  const [auditData, setAuditData] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleAuditComplete = (data: any) => {
    setAuditData(data);
    setIsAuditing(false);
  };

  const handleStartAudit = () => {
    setIsAuditing(true);
    setAuditData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <main className="relative">
        {!auditData && !isAuditing ? (
          <>
            <Hero />
            <AuditForm onStartAudit={handleStartAudit} onAuditComplete={handleAuditComplete} />
          </>
        ) : isAuditing ? (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Analyzing Your Website...</h2>
              <div className="bg-card border border-border rounded-lg p-8 shadow-card-glow">
                <div className="space-y-6">
                  <div className="animate-pulse">
                    <div className="h-2 bg-gradient-primary rounded-full"></div>
                  </div>
                  <p className="text-muted-foreground">Our AI agents are examining your website across multiple dimensions...</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <AuditResults data={auditData} onNewAudit={() => { setAuditData(null); setIsAuditing(false); }} />
        )}
      </main>
    </div>
  );
};

export default Index;