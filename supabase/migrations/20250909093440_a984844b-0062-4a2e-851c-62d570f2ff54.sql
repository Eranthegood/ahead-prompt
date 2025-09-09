-- Create the blog post from String.com article that failed to process
INSERT INTO public.blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  meta_description, 
  keywords, 
  status, 
  author_id, 
  workspace_id
) VALUES (
  'Harnessing Vibe Coding: Elevating Developer Experience with Flow-Based Techniques',
  'vibe-coding-developer-experience-flow-techniques',
  'Discover vibe coding techniques to boost developer experience, creativity, and sustainable productivity through optimal environments and mindful workflows.',
  '<article><header><h1>Harnessing Vibe Coding: Elevating Developer Experience with Flow-Based Techniques</h1></header><section><h2>Introduction: The Rise of Vibe Coding in Modern Development</h2><p>Coding is evolving. Gone are the days where productivity was measured only by lines of code or hours spent at the keyboard. Today, developers—and the organizations backing them—are recognizing that <em>how</em> code is created matters just as much as <em>what</em> is built. Enter <strong>Vibe Coding</strong>: a burgeoning philosophy and methodology aimed squarely at maximizing developer experience, creativity, and sustainable productivity.</p><p>So, what is vibe coding? How can it transform your daily workflow and foster a happier, more productive engineering team? In this article, we dive deep into the techniques, tools, and best practices that enable vibe coding—and how you can start implementing them today.</p></section></article>',
  'Discover vibe coding techniques to boost developer experience, creativity, and sustainable productivity through optimal environments and mindful workflows.',
  ARRAY['vibe coding', 'developer experience', 'productivity', 'flow state', 'developer tools'],
  'draft',
  'c6626a43-6d65-4ad4-bc80-ab41680854c4',
  '57b8c8f2-bc73-4472-a2e1-3b85e27ee973'
);