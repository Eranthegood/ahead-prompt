import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutrankArticle {
  id: string;
  title: string;
  content_markdown: string;
  content_html: string;
  meta_description: string;
  created_at: string;
  image_url: string;
  slug: string;
  tags: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`Sync Outrank articles: ${req.method} ${req.url}`);

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the first workspace and its owner for blog posts
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id, owner_id')
      .limit(1)
      .single();

    if (!workspace) {
      console.error('No workspace found - cannot create blog posts');
      return new Response(
        JSON.stringify({ error: 'No workspace available for blog posts' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Using workspace: ${workspace.id} with owner: ${workspace.owner_id}`);

    // Mock articles data - complete version
    const mockArticles: OutrankArticle[] = [
      {
        id: "65bb72af-1eb7-423d-98aa-8c3dbb27f423",
        title: "Create an Effective Design Document Template",
        content_markdown: "A design document template is your secret weapon for a successful project. Think of it as a standardized, reusable framework that your team fills out before a single line of code gets written. This establishes a single source of truth that aligns the entire team.",
        content_html: `<article>
          <h1>Create an Effective Design Document Template</h1>
          
          <p>A design document template is your secret weapon for a successful project. Think of it as a standardized, reusable framework that your team fills out before a single line of code gets written. This establishes a single source of truth that aligns the entire team.</p>

          <h2>Why You Need a Design Document Template</h2>
          <p>Without proper documentation, projects often suffer from scope creep, miscommunication, and technical debt. A well-structured design document template ensures everyone understands the project goals, technical requirements, and implementation details from day one.</p>

          <h2>Essential Components of a Design Document</h2>
          <h3>1. Project Overview</h3>
          <p>Start with a clear problem statement and proposed solution. This section should answer why this project exists and what success looks like.</p>

          <h3>2. Technical Requirements</h3>
          <p>Detail the functional and non-functional requirements, including performance metrics, security considerations, and scalability needs.</p>

          <h3>3. System Architecture</h3>
          <p>Include high-level architecture diagrams, data flow charts, and integration points with existing systems.</p>

          <h3>4. Implementation Timeline</h3>
          <p>Break down the project into phases with clear milestones, dependencies, and resource allocation.</p>

          <h2>Best Practices for Design Documents</h2>
          <ul>
            <li>Keep it concise but comprehensive</li>
            <li>Use visual diagrams whenever possible</li>
            <li>Include decision rationale for future reference</li>
            <li>Make it collaborative and reviewable</li>
            <li>Update it as the project evolves</li>
          </ul>

          <h2>Template Structure</h2>
          <p>A good design document template should include sections for executive summary, problem definition, proposed solution, technical specifications, timeline, and risks. Each section serves a specific purpose in communicating the project vision.</p>

          <h2>Conclusion</h2>
          <p>Investing time in creating and maintaining design documents pays dividends throughout the project lifecycle. It reduces confusion, accelerates onboarding, and creates a valuable knowledge base for future projects.</p>
        </article>`,
        meta_description: "Learn how to create an effective design document template that streamlines projects and prevents scope creep.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/design-document-template.jpg",
        slug: "create-effective-design-document-template",
        tags: ["project-management", "documentation", "team-collaboration"]
      },
      {
        id: "77654073-e79c-424e-b2df-fc17607c9a79",
        title: "Build a Powerful AI Prompt Library for Your Team",
        content_markdown: "Building an AI prompt library is one of the smartest investments your team can make in 2024. With AI tools becoming essential for everything from content creation to code generation, having a centralized collection of proven prompts can dramatically improve consistency, quality, and productivity.",
        content_html: `<article>
          <h1>Build a Powerful AI Prompt Library for Your Team</h1>
          
          <p>Building an AI prompt library is one of the smartest investments your team can make in 2024. With AI tools becoming essential for everything from content creation to code generation, having a centralized collection of proven prompts can dramatically improve consistency, quality, and productivity.</p>

          <h2>What is an AI Prompt Library?</h2>
          <p>An AI prompt library is a curated collection of tested and optimized prompts designed for specific tasks and use cases. Think of it as a knowledge base that captures your team's collective AI expertise and makes it accessible to everyone.</p>

          <h2>Benefits of a Centralized Prompt Library</h2>
          <h3>Consistency Across Team</h3>
          <p>When everyone uses the same proven prompts, your outputs become more predictable and maintain a consistent quality standard.</p>

          <h3>Faster Onboarding</h3>
          <p>New team members can immediately access battle-tested prompts instead of starting from scratch or reinventing the wheel.</p>

          <h3>Continuous Improvement</h3>
          <p>As prompts are refined and optimized, the entire team benefits from these improvements automatically.</p>

          <h2>Essential Categories for Your Prompt Library</h2>
          <ul>
            <li><strong>Content Creation:</strong> Blog posts, social media, marketing copy</li>
            <li><strong>Code Generation:</strong> Functions, documentation, debugging</li>
            <li><strong>Analysis:</strong> Data interpretation, competitive research</li>
            <li><strong>Communication:</strong> Emails, proposals, presentations</li>
            <li><strong>Creative Tasks:</strong> Brainstorming, concept development</li>
          </ul>

          <h2>Best Practices for Prompt Management</h2>
          <h3>Version Control</h3>
          <p>Track changes to prompts over time. What works today might be improved tomorrow, and you want to maintain that history.</p>

          <h3>Performance Metrics</h3>
          <p>Measure prompt effectiveness using metrics like output quality, user satisfaction, and task completion time.</p>

          <h3>Documentation</h3>
          <p>Include context about when and how to use each prompt, along with examples of successful outputs.</p>

          <h2>Tools and Platforms</h2>
          <p>Consider using dedicated prompt management tools, internal wikis, or custom databases to organize your library. The key is making it easily searchable and accessible to your team.</p>

          <h2>Getting Started</h2>
          <p>Start small with your most common use cases. Identify the prompts your team uses most frequently and begin documenting and refining them. As you see the benefits, expand to cover more scenarios.</p>

          <h2>Conclusion</h2>
          <p>A well-maintained AI prompt library becomes a competitive advantage, enabling your team to work more efficiently and produce higher-quality results. The initial investment in building this resource pays dividends in improved productivity and consistency.</p>
        </article>`,
        meta_description: "Learn how to build and manage a powerful AI prompt library that improves team consistency and productivity.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/ai-prompt-library.jpg",
        slug: "build-powerful-ai-prompt-library-team",
        tags: ["artificial-intelligence", "prompt-engineering", "team-productivity"]
      },
      {
        id: "b357bbe6-d806-434c-80a7-6cb071d36c8b",
        title: "12 Best AI Workflow Automation Tools for 2025",
        content_markdown: "The AI workflow automation landscape is evolving rapidly, and 2025 brings unprecedented opportunities to streamline your business processes. Whether you're looking to automate repetitive tasks, enhance decision-making, or create sophisticated multi-step workflows, the right AI tools can transform how your team operates.",
        content_html: `<article>
          <h1>12 Best AI Workflow Automation Tools for 2025</h1>
          
          <p>The AI workflow automation landscape is evolving rapidly, and 2025 brings unprecedented opportunities to streamline your business processes. Whether you're looking to automate repetitive tasks, enhance decision-making, or create sophisticated multi-step workflows, the right AI tools can transform how your team operates.</p>

          <h2>Why AI Workflow Automation Matters</h2>
          <p>Traditional automation tools follow rigid rules, but AI-powered automation adapts to context, handles exceptions, and learns from patterns. This makes it perfect for complex business processes that require decision-making capabilities.</p>

          <h2>Top 12 AI Workflow Automation Tools</h2>

          <h3>1. Zapier with AI Features</h3>
          <p>Zapier has integrated AI capabilities that can parse unstructured data, make smart routing decisions, and even generate content as part of automated workflows.</p>
          <ul>
            <li><strong>Best for:</strong> Small to medium businesses</li>
            <li><strong>Pricing:</strong> Free tier available, paid plans start at $19.99/month</li>
            <li><strong>Key Features:</strong> 5000+ app integrations, AI-powered data extraction</li>
          </ul>

          <h3>2. Microsoft Power Automate</h3>
          <p>Microsoft's enterprise-grade automation platform with built-in AI Builder for creating custom AI models without coding.</p>
          <ul>
            <li><strong>Best for:</strong> Enterprise organizations using Microsoft ecosystem</li>
            <li><strong>Pricing:</strong> $15/user/month</li>
            <li><strong>Key Features:</strong> AI Builder, deep Office 365 integration</li>
          </ul>

          <h3>3. UiPath</h3>
          <p>Leading RPA platform with advanced AI capabilities for document processing, computer vision, and natural language understanding.</p>
          <ul>
            <li><strong>Best for:</strong> Large enterprises with complex automation needs</li>
            <li><strong>Pricing:</strong> Custom enterprise pricing</li>
            <li><strong>Key Features:</strong> Computer vision, ML models, process mining</li>
          </ul>

          <h3>4. Automation Anywhere</h3>
          <p>Cloud-native automation platform with built-in AI that can handle unstructured data and make intelligent decisions.</p>

          <h3>5. WorkFusion</h3>
          <p>Intelligent automation platform that combines RPA with AI to handle complex business processes.</p>

          <h3>6. Blue Prism</h3>
          <p>Enterprise RPA with AI capabilities for cognitive automation and intelligent document processing.</p>

          <h3>7. Nintex</h3>
          <p>Process automation platform with AI-powered workflow optimization and analytics.</p>

          <h3>8. Appian</h3>
          <p>Low-code automation platform with integrated AI and machine learning capabilities.</p>

          <h3>9. Pipefy</h3>
          <p>Workflow management tool with AI features for process optimization and decision automation.</p>

          <h3>10. Monday.com</h3>
          <p>Project management platform with AI-powered automation and workflow intelligence.</p>

          <h3>11. Kissflow</h3>
          <p>Digital workplace platform with AI-enhanced workflow automation capabilities.</p>

          <h3>12. ProcessMaker</h3>
          <p>Open-source workflow automation with AI integration for intelligent process management.</p>

          <h2>Choosing the Right Tool</h2>
          <p>Consider factors like your team size, technical expertise, integration requirements, and budget. Start with a pilot project to test the tool's effectiveness before full deployment.</p>

          <h2>Implementation Best Practices</h2>
          <ul>
            <li>Start with simple, high-impact processes</li>
            <li>Ensure data quality for AI components</li>
            <li>Plan for change management and training</li>
            <li>Monitor and optimize continuously</li>
          </ul>

          <h2>Future Trends</h2>
          <p>Expect to see more intelligent automation, better integration between tools, and increased focus on human-AI collaboration in workflow automation.</p>

          <h2>Conclusion</h2>
          <p>AI workflow automation tools are becoming essential for competitive businesses. The key is choosing the right tool for your specific needs and implementing it thoughtfully to maximize ROI.</p>
        </article>`,
        meta_description: "Discover the 12 best AI workflow automation tools for 2025. Compare features, pricing, and use cases.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/ai-workflow-automation.jpg",
        slug: "best-ai-workflow-automation-tools-2025",
        tags: ["workflow-automation", "artificial-intelligence", "productivity-tools"]
      },
      {
        id: "e3d790cf-d8a2-4793-b77d-07736cfb430f",
        title: "Your Guide to a Product Requirements Document Template",
        content_markdown: "A Product Requirements Document (PRD) template is the foundation of successful product development. It transforms abstract ideas into concrete specifications that engineers, designers, and stakeholders can rally behind. Without a solid PRD, even the most innovative product concepts can derail into confusion, scope creep, and missed deadlines.",
        content_html: `<article>
          <h1>Your Guide to a Product Requirements Document Template</h1>
          
          <p>A Product Requirements Document (PRD) template is the foundation of successful product development. It transforms abstract ideas into concrete specifications that engineers, designers, and stakeholders can rally behind. Without a solid PRD, even the most innovative product concepts can derail into confusion, scope creep, and missed deadlines.</p>

          <h2>What is a Product Requirements Document?</h2>
          <p>A PRD is a comprehensive document that outlines what a product should do, who it's for, and how success will be measured. It serves as the single source of truth for product development teams throughout the project lifecycle.</p>

          <h2>Essential Components of a PRD Template</h2>

          <h3>1. Executive Summary</h3>
          <p>A high-level overview that answers the fundamental questions: What are we building, why, and for whom?</p>

          <h3>2. Problem Statement</h3>
          <p>Clearly articulate the user problem you're solving. Include market research, user pain points, and the opportunity size.</p>

          <h3>3. Product Vision and Goals</h3>
          <p>Define your product vision and specific, measurable goals. What does success look like?</p>

          <h3>4. User Personas and Stories</h3>
          <p>Detail your target users with personas and user stories that describe how they'll interact with your product.</p>

          <h3>5. Feature Requirements</h3>
          <p>Break down functionality into detailed features with acceptance criteria, priorities, and dependencies.</p>

          <h3>6. Technical Requirements</h3>
          <p>Outline technical constraints, integrations, performance requirements, and scalability considerations.</p>

          <h3>7. Design and User Experience</h3>
          <p>Include wireframes, mockups, and UX guidelines that inform the development process.</p>

          <h3>8. Success Metrics</h3>
          <p>Define KPIs and metrics that will measure product success and inform future iterations.</p>

          <h2>PRD Best Practices</h2>
          <ul>
            <li><strong>Keep it collaborative:</strong> Involve engineering, design, and business stakeholders</li>
            <li><strong>Stay user-focused:</strong> Every requirement should tie back to user needs</li>
            <li><strong>Be specific:</strong> Avoid ambiguous language and provide clear acceptance criteria</li>
            <li><strong>Prioritize ruthlessly:</strong> Not every feature is equally important</li>
            <li><strong>Version control:</strong> Track changes and maintain document history</li>
          </ul>

          <h2>Common PRD Mistakes to Avoid</h2>
          <ul>
            <li>Making it too technical or too high-level</li>
            <li>Not involving key stakeholders in the creation process</li>
            <li>Failing to update the document as requirements evolve</li>
            <li>Missing clear success criteria and metrics</li>
            <li>Not considering technical feasibility early enough</li>
          </ul>

          <h2>PRD Templates for Different Product Types</h2>
          <p>Different types of products require different PRD approaches. Mobile apps might emphasize user experience and platform considerations, while B2B software might focus more on integration requirements and user permissions.</p>

          <h2>Maintaining Your PRD</h2>
          <p>A PRD is a living document that should evolve with your product. Regular reviews, stakeholder feedback, and updates based on user research keep it relevant and useful.</p>

          <h2>Tools and Platforms</h2>
          <p>Popular tools for creating and maintaining PRDs include Notion, Confluence, Google Docs, and specialized product management platforms like ProductPlan or Aha!</p>

          <h2>Conclusion</h2>
          <p>A well-crafted PRD template is your roadmap to successful product development. It aligns teams, reduces miscommunication, and ensures everyone is working toward the same goals. Invest time in creating a comprehensive PRD, and your entire product development process will benefit.</p>
        </article>`,
        meta_description: "Master product requirements documentation with our comprehensive PRD template guide and best practices.",
        created_at: new Date().toISOString(),
        image_url: "https://cdn.outrank.so/product-requirements-document.jpg",
        slug: "product-requirements-document-template-guide",
        tags: ["product-management", "requirements-documentation", "project-planning"]
      }
    ];

    const processedArticles = [];
    const errors = [];

    // Process each mock article
    for (const article of mockArticles) {
      try {
        console.log(`Processing article: ${article.title} (ID: ${article.id})`);

        // Store article in seo_articles table
        const { data: seoArticle, error: seoError } = await supabase
          .from('seo_articles')
          .upsert({
            external_id: article.id,
            title: article.title,
            content: article.content_markdown,
            content_html: article.content_html,
            meta_description: article.meta_description,
            image_url: article.image_url,
            slug: article.slug,
            tags: article.tags || [],
            source: 'outrank',
            created_at: article.created_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'external_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (seoError) {
          console.error('Error storing SEO article:', seoError);
          errors.push({
            article_id: article.id,
            error: `SEO article error: ${seoError.message}`
          });
          continue;
        }

        console.log(`SEO article stored successfully: ${seoArticle.id}`);

        // Generate unique slug for blog post
        const { data: uniqueSlug, error: slugError } = await supabase
          .rpc('generate_unique_blog_slug', {
            base_title: article.title,
            workspace_uuid: workspace.id
          });

        if (slugError || !uniqueSlug) {
          console.error('Error generating unique slug:', slugError);
          errors.push({
            article_id: article.id,
            error: `Slug generation error: ${slugError?.message || 'Unknown error'}`
          });
          continue;
        }

        console.log(`Generated unique slug: ${uniqueSlug}`);

        // Create blog post and auto-publish it
        const { data: blogPost, error: blogError } = await supabase
          .from('blog_posts')
          .upsert({
            title: article.title,
            slug: uniqueSlug,
            content: article.content_html,
            excerpt: article.meta_description || article.content_markdown?.substring(0, 160) || '',
            featured_image_url: article.image_url,
            status: 'published',
            published_at: new Date().toISOString(),
            author_id: workspace.owner_id,
            workspace_id: workspace.id,
            seo_article_id: seoArticle.id,
            meta_description: article.meta_description,
            keywords: article.tags || [],
            created_at: article.created_at,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'slug',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (blogError) {
          console.error('Error creating blog post:', blogError);
          errors.push({
            article_id: article.id,
            error: `Blog post error: ${blogError.message}`
          });
        } else {
          console.log(`Blog post published successfully: ${blogPost.title} (${blogPost.slug})`);
          
          // Assign SEO category to the blog post
          const { data: seoCategory } = await supabase
            .from('blog_categories')
            .select('id')
            .eq('slug', 'seo')
            .eq('workspace_id', workspace.id)
            .maybeSingle();

          if (seoCategory) {
            await supabase
              .from('blog_post_categories')
              .upsert({
                post_id: blogPost.id,
                category_id: seoCategory.id
              }, {
                onConflict: 'post_id,category_id',
                ignoreDuplicates: true
              });
          }
        }

        processedArticles.push({
          external_id: article.id,
          title: article.title,
          status: 'processed'
        });

        console.log(`Successfully processed article: ${article.title}`);

      } catch (articleError) {
        console.error(`Error processing article ${article.id}:`, articleError);
        errors.push({
          article_id: article.id,
          error: articleError.message
        });
      }
    }

    console.log(`Sync complete. Processed: ${processedArticles.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: 'Articles synced successfully',
        processed_articles: processedArticles.length,
        errors: errors.length,
        articles: processedArticles,
        details: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Sync processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});