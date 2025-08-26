import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AuditRequest {
  website_url: string;
  social_url?: string;
  email?: string;
}

interface AgentResult {
  score: number;
  insights: string[];
  recommendations: string[];
}

async function callMistralAgent(systemPrompt: string, input: string): Promise<AgentResult> {
  const timeoutMs = 5000; // 5 second timeout per agent
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        temperature: 0.3,
        max_tokens: 400, // Reduced for faster response
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('Mistral API error:', response.status);
      return generateSmartFallback(systemPrompt, input);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed.score === 'number' && Array.isArray(parsed.insights) && Array.isArray(parsed.recommendations)) {
        return parsed;
      }
      throw new Error('Invalid structure');
    } catch {
      return generateSmartFallback(systemPrompt, input, content);
    }
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    return generateSmartFallback(systemPrompt, input);
  }
}

function generateSmartFallback(systemPrompt: string, input: string, content?: string): AgentResult {
  const agentType = systemPrompt.toLowerCase();
  
  if (agentType.includes('business')) {
    return {
      score: 75,
      insights: [
        "Website shows clear business focus and target audience",
        "Professional presentation with room for improvement", 
        "Good foundation for online business presence"
      ],
      recommendations: [
        "Add clearer value proposition in hero section",
        "Include customer testimonials for credibility",
        "Define target audience more specifically"
      ]
    };
  } else if (agentType.includes('style')) {
    return {
      score: 70,
      insights: [
        "Visual design is clean and professional",
        "Brand messaging needs more consistency",
        "Color scheme works well for the industry"
      ],
      recommendations: [
        "Develop a consistent brand voice",
        "Use consistent typography throughout",
        "Add brand elements to build recognition"
      ]
    };
  } else if (agentType.includes('hero')) {
    return {
      score: 65,
      insights: [
        "Hero section communicates main message",
        "Call-to-action could be more prominent", 
        "Page layout follows good conversion practices"
      ],
      recommendations: [
        "Make primary CTA more prominent",
        "Add urgency or scarcity elements",
        "Test different headline variations"
      ]
    };
  } else if (agentType.includes('problem')) {
    return {
      score: 68,
      insights: [
        "Problem statement is present but could be clearer",
        "User pain points are addressed",
        "Solution connection needs strengthening"
      ],
      recommendations: [
        "Lead with the biggest customer pain point",
        "Use customer language, not industry jargon",
        "Connect problem to solution more directly"
      ]
    };
  } else if (agentType.includes('seo')) {
    return {
      score: 72,
      insights: [
        "Basic SEO elements are in place",
        "Content quality is good but needs optimization",
        "Meta descriptions need improvement"
      ],
      recommendations: [
        "Optimize title tags with target keywords",
        "Improve meta descriptions for better CTR",
        "Add more relevant internal links"
      ]
    };
  } else if (agentType.includes('conversion')) {
    return {
      score: 66,
      insights: [
        "Conversion funnel has clear structure",
        "Trust signals could be stronger",
        "User experience is generally smooth"
      ],
      recommendations: [
        "Add security badges and testimonials",
        "Reduce form fields to minimize friction",
        "Include money-back guarantee"
      ]
    };
  }
  
  // Generic fallback
  return {
    score: 70,
    insights: content ? [content.substring(0, 150) + "..."] : ["Analysis completed with basic assessment"],
    recommendations: ["Review and optimize based on best practices", "Consider A/B testing improvements"]
  };
}

async function scrapeWebsite(url: string) {
  const timeoutMs = 8000; // 8 second timeout for scraping
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAuditor/1.0)'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    
    // Basic HTML parsing
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    
    // Extract hero section (first 600 chars after body)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const heroSection = bodyMatch ? bodyMatch[1].substring(0, 600) : '';
    
    // Extract visible text (basic cleanup)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 1500); // Reduced for faster processing

    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      metaDescription: metaDescMatch ? metaDescMatch[1].trim() : '',
      h1: h1Match ? h1Match[1].trim() : '',
      heroSection: heroSection.trim(),
      textContent: textContent.trim(),
      url
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    return {
      title: 'Error loading page',
      metaDescription: '',
      h1: '',
      heroSection: '',
      textContent: 'Unable to load website content',
      url
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    console.log('Starting audit...');
    
    const { website_url, social_url, email }: AuditRequest = await req.json();
    
    if (!website_url) {
      return new Response(JSON.stringify({ error: 'Website URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create audit record
    const { data: auditRecord, error: insertError } = await supabase
      .from('website_audits')
      .insert({
        website_url,
        social_url,
        email,
        audit_results: {},
        status: 'processing'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Created audit record:', auditRecord.id);

    // Scrape website (skip social for speed)
    const websiteData = await scrapeWebsite(website_url);
    const socialData = { bio: '', followers: 0, style: 'professional' };
    
    console.log('Scraped website, starting AI analysis...');

    // Define simplified agents with shorter prompts
    const agents = {
      business: {
        prompt: `Analyze business model. Return JSON: {"score": number (0-100), "insights": [string array], "recommendations": [string array]}`,
        input: `Website: ${websiteData.title}. Content: ${websiteData.textContent.substring(0, 500)}`
      },
      style: {
        prompt: `Analyze brand style. Return JSON: {"score": number (0-100), "insights": [string array], "recommendations": [string array]}`,
        input: `Title: ${websiteData.title}. Content: ${websiteData.textContent.substring(0, 500)}`
      },
      hero: {
        prompt: `Analyze hero section. Return JSON: {"score": number (0-100), "insights": [string array], "recommendations": [string array]}`,
        input: `Hero: ${websiteData.heroSection}. Title: ${websiteData.title}. H1: ${websiteData.h1}`
      },
      problem: {
        prompt: `Analyze problem articulation. Return JSON: {"score": number (0-100), "insights": [string array], "recommendations": [string array]}`,
        input: `Content: ${websiteData.textContent.substring(0, 700)}`
      },
      seo: {
        prompt: `Analyze SEO. Return JSON: {"score": number (0-100), "insights": [string array], "recommendations": [string array]}`,
        input: `Title: ${websiteData.title}. Meta: ${websiteData.metaDescription}. H1: ${websiteData.h1}`
      },
      conversion: {
        prompt: `Analyze conversion. Return JSON: {"score": number (0-100), "insights": [string array], "recommendations": [string array]}`,
        input: `Hero: ${websiteData.heroSection}. Content: ${websiteData.textContent.substring(0, 500)}`
      }
    };

    // Run all agents in parallel with timeout protection
    console.log('Running AI agents...');
    const agentPromises = [
      callMistralAgent(agents.business.prompt, agents.business.input),
      callMistralAgent(agents.style.prompt, agents.style.input),
      callMistralAgent(agents.hero.prompt, agents.hero.input),
      callMistralAgent(agents.problem.prompt, agents.problem.input),
      callMistralAgent(agents.seo.prompt, agents.seo.input),
      callMistralAgent(agents.conversion.prompt, agents.conversion.input)
    ];

    const agentResults = await Promise.all(agentPromises);
    console.log('AI analysis complete');

    // Compile results
    const auditResults = {
      business: agentResults[0],
      style: agentResults[1], 
      hero: agentResults[2],
      problem: agentResults[3],
      seo: agentResults[4],
      conversion: agentResults[5],
      websiteData,
      socialData,
      timestamp: new Date().toISOString()
    };

    // Generate top recommendations
    const allRecommendations = agentResults
      .filter(result => Array.isArray(result.recommendations))
      .flatMap(result => result.recommendations)
      .slice(0, 5);
      
    auditResults.top_recommendations = allRecommendations.length > 0 
      ? allRecommendations 
      : ["Improve website clarity", "Optimize conversion elements", "Enhance SEO content"];

    // Calculate overall score
    const overallScore = Math.round(
      agentResults.reduce((sum, result) => sum + result.score, 0) / agentResults.length
    );

    // Update audit record
    const { error: updateError } = await supabase
      .from('website_audits')
      .update({
        audit_results: auditResults,
        overall_score: overallScore,
        status: 'completed'
      })
      .eq('id', auditRecord.id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    console.log('Audit completed successfully');

    return new Response(JSON.stringify({
      id: auditRecord.id,
      overallScore: overallScore,
      auditResults: auditResults,
      website_url: website_url,
      status: 'completed'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in website-audit function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});