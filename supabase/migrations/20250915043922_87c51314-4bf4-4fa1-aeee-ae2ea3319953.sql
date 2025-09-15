-- Insert a generic SaaS landing page prompt into the prompt library
INSERT INTO public.prompt_library (
  title,
  body,
  category,
  tags,
  ai_model,
  user_id,
  workspace_id,
  is_favorite
) VALUES (
  'Modern SaaS Landing Page Generator',
  'Create a high-converting SaaS landing page with this complete structure:

## 1. Header/Navigation
- Sticky navbar with company logo
- Menu items: Features, Pricing, Blog, About
- Primary CTA button (prominent positioning)

## 2. Hero Section
- **Main headline**: Clear value proposition (max 60 chars for SEO)
- **Subheadline**: Explain the problem you solve (2-3 lines)
- **Primary CTA**: Action-oriented button text
- **Secondary CTA**: "Watch Demo" or "Learn More"
- Social proof badge (e.g., "Trusted by 10,000+ companies")

## 3. Product Preview
- Screenshot/mockup of your product interface
- Annotated callouts highlighting key features
- "Dashboard preview" or "Product in action"

## 4. Social Proof Bar
- "Trusted by companies like:" + customer logos
- Use recognizable brand names if applicable

## 5. Features/Benefits Section (3-5 key features)
For each feature:
- **Feature name** (benefit-focused)
- Brief description (focus on user outcomes)
- Icon or visual representation
- "Why this matters" explanation

## 6. How It Works (3 simple steps)
1. **Step 1**: "Sign up" or initial action
2. **Step 2**: "Setup" or configuration  
3. **Step 3**: "Results" or outcome
Make it feel effortless and quick.

## 7. Pricing Section (3 tiers with decoy effect)
- **Basic**: Entry-level features
- **Pro**: (Highlighted as "Most Popular") - your main target
- **Enterprise**: Premium features
Include "Start Free Trial" CTAs

## 8. Social Proof/Testimonials
- 3-4 customer quotes with:
  - Customer name and title
  - Company name (if notable)
  - Specific results/benefits achieved
  - Profile photos (if available)

## 9. FAQ Section
Address common objections:
- How does it work?
- Is it secure?
- What integrations do you support?
- Can I cancel anytime?
- Do you offer support?

## 10. Final CTA Section
- Compelling headline: "Ready to [achieve desired outcome]?"
- Supporting text reinforcing main value
- Primary action button
- Risk-reducer: "No credit card required" or "30-day money-back guarantee"

## 11. Footer
- Company logo and brief description
- Navigation links (organized in columns)
- Legal links: Privacy, Terms, etc.
- Contact information
- Social media links

## Design Guidelines:
- **Mobile-first responsive design**
- **Fast loading**: Optimize images, minimize scripts
- **Clear visual hierarchy**: Use whitespace effectively
- **Consistent branding**: Colors, fonts, tone
- **Accessibility**: Alt texts, proper contrast ratios
- **SEO optimized**: H1 tag, meta description, semantic HTML

## Content Strategy:
- Focus on benefits, not just features
- Use customer language, not internal jargon
- Include specific numbers and results where possible
- Address pain points directly
- Create urgency without being pushy

Replace placeholders with your specific:
- Product name and value proposition
- Target customer pain points
- Key features and benefits
- Customer testimonials
- Pricing structure
- Brand colors and assets

This structure is proven to convert visitors into customers. Customize each section with your specific product details.',
  'Landing Pages',
  ARRAY['saas', 'landing-page', 'conversion', 'marketing', 'web-design'],
  'openai-gpt-4',
  (SELECT id FROM profiles WHERE email = 'system@ahead.love' LIMIT 1),
  (SELECT id FROM workspaces WHERE name = 'System' LIMIT 1),
  true
);