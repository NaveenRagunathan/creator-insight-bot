import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Website scraper function
async function scrapeWebsite(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract basic content using regex (simple parsing)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    
    // Extract hero section (first section or content before fold)
    const heroMatch = html.match(/<(?:section|div)[^>]*class="[^"]*(?:hero|banner|header)[^"]*"[^>]*>([\s\S]*?)<\/(?:section|div)>/i);
    
    // Extract body text (remove tags)
    const bodyText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 3000);
    
    return {
      title: titleMatch?.[1] || '',
      metaDescription: metaDescMatch?.[1] || '',
      h1: h1Match?.[1] || '',
      hero: heroMatch?.[1]?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 500) || '',
      bodyText: bodyText,
      url: url
    };
  } catch (error) {
    console.error('Error scraping website:', error);
    throw new Error('Failed to scrape website');
  }
}

// AI Agent function
async function runAIAgent(prompt: string, context: string) {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: context }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Mistral API:', error);
    throw new Error('Failed to analyze with AI');
  }
}

// Define the 6 AI agents
const agents = {
  business: {
    prompt: `You are a business analyst expert. Analyze the website and social profile data to determine:
1. Business model and positioning
2. Target audience
3. Authority and credibility signals
4. Tone and brand personality
Return a JSON object with: positioning, audience, authority_score (0-100), tone, and key_insights array.`,
    weight: 0.15
  },
  
  style: {
    prompt: `You are a brand style expert. Analyze the website design and content alignment:
1. Visual consistency and brand cohesion
2. Style alignment with target audience
3. Professional appearance
4. Brand differentiation
Return a JSON object with: consistency_score (0-100), alignment_score (0-100), professional_score (0-100), and recommendations array.`,
    weight: 0.15
  },
  
  hero: {
    prompt: `You are a landing page conversion expert. Analyze the hero section for:
1. Headline clarity and impact (5-second rule)
2. Value proposition strength
3. CTA effectiveness
4. First impression quality
Return a JSON object with: clarity_score (0-100), value_prop_score (0-100), cta_score (0-100), and improvements array.`,
    weight: 0.20
  },
  
  problem: {
    prompt: `You are a problem articulation specialist. Analyze how well the website communicates:
1. Target audience pain points
2. Problem-solution fit clarity
3. Jargon vs user-friendly language
4. Emotional connection
Return a JSON object with: problem_clarity_score (0-100), solution_fit_score (0-100), language_score (0-100), and suggestions array.`,
    weight: 0.20
  },
  
  seo: {
    prompt: `You are an SEO and copywriting expert. Analyze the content for:
1. SEO fundamentals (title, meta, headings)
2. Content quality and readability
3. Keyword usage and relevance
4. Copy persuasiveness
Return a JSON object with: seo_score (0-100), readability_score (0-100), persuasion_score (0-100), and optimizations array.`,
    weight: 0.15
  },
  
  conversion: {
    prompt: `You are a conversion rate optimization expert. Identify conversion barriers:
1. Trust signals and social proof
2. CTA placement and design
3. Form friction and user experience
4. Page load and navigation issues
Return a JSON object with: trust_score (0-100), cta_optimization_score (0-100), ux_score (0-100), and barriers array.`,
    weight: 0.15
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website_url, social_url, email } = await req.json();

    if (!website_url) {
      return new Response(JSON.stringify({ error: 'Website URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting audit for:', website_url);

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
      console.error('Database insert error:', insertError);
      throw new Error('Failed to create audit record');
    }

    // Scrape website
    const websiteData = await scrapeWebsite(website_url);
    console.log('Website scraped successfully');

    // Prepare context for AI agents
    const context = `
Website URL: ${website_url}
Title: ${websiteData.title}
Meta Description: ${websiteData.metaDescription}
H1: ${websiteData.h1}
Hero Section: ${websiteData.hero}
Body Content: ${websiteData.bodyText}
Social Profile: ${social_url || 'Not provided'}
    `.trim();

    // Run all agents in parallel
    const agentResults = {};
    const agentPromises = Object.entries(agents).map(async ([agentName, agentConfig]) => {
      try {
        const result = await runAIAgent(agentConfig.prompt, context);
        // Try to parse as JSON, fallback to text if failed
        try {
          agentResults[agentName] = JSON.parse(result);
        } catch {
          agentResults[agentName] = { analysis: result, score: 50 };
        }
      } catch (error) {
        console.error(`Agent ${agentName} failed:`, error);
        agentResults[agentName] = { error: 'Analysis failed', score: 0 };
      }
    });

    await Promise.all(agentPromises);
    console.log('All agents completed');

    // Calculate overall score
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(agents).forEach(([agentName, agentConfig]) => {
      const result = agentResults[agentName];
      if (result && !result.error) {
        // Extract score from various possible field names
        const score = result.clarity_score || result.consistency_score || result.problem_clarity_score || 
                     result.seo_score || result.trust_score || result.score || 50;
        totalScore += score * agentConfig.weight;
        totalWeight += agentConfig.weight;
      }
    });

    const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;

    // Compile final results
    const finalResults = {
      website_url,
      social_url,
      overall_score: overallScore,
      agents: agentResults,
      scraped_data: websiteData,
      timestamp: new Date().toISOString()
    };

    // Update audit record with results
    const { error: updateError } = await supabase
      .from('website_audits')
      .update({
        audit_results: finalResults,
        overall_score: overallScore,
        status: 'completed'
      })
      .eq('id', auditRecord.id);

    if (updateError) {
      console.error('Database update error:', updateError);
    }

    console.log('Audit completed successfully');

    return new Response(JSON.stringify({
      success: true,
      audit_id: auditRecord.id,
      results: finalResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in website-audit function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});