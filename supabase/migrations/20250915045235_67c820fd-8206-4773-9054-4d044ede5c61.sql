-- Insert system prompts into the prompt_library table
INSERT INTO public.prompt_library (
  id,
  title,
  body,
  ai_model,
  tags,
  category,
  is_system_prompt,
  is_favorite,
  usage_count,
  workspace_id,
  user_id
) VALUES 
-- Stripe Payment Integration prompt
(
  'system-stripe-integration',
  'Stripe Payment Integration - Scoped & Responsive',
  'Integrate Stripe payments with these constraints:

**SCOPE LIMITATIONS:**
- Only modify UI components and forms
- Do not change backend/server code
- Keep database schema changes minimal

**REQUIREMENTS:**
- Full responsive design (mobile-first)
- Clean, modern payment forms
- Proper error handling for payment failures
- Loading states during payment processing
- Success/failure feedback to users

**NEW PROJECT SETUP:**
- Set up Stripe Elements components
- Create payment form with validation
- Implement responsive checkout flow
- Add payment status indicators
- Include proper accessibility features

**UI FOCUS:**
- Consistent with existing design system
- Smooth animations and transitions
- Clear pricing display
- Trust indicators (security badges, testimonials)
- Mobile-optimized checkout experience

**TECHNICAL CONSTRAINTS:**
- Use existing CSS framework
- Maintain current routing structure
- Follow established component patterns
- Ensure cross-browser compatibility

**DELIVERABLES:**
1. Responsive payment form component
2. Checkout flow with proper validation
3. Success/error state handling
4. Loading indicators during processing
5. Mobile-first responsive design',
  'claude-3.5-sonnet',
  ARRAY['stripe', 'payments', 'ui', 'responsive', 'new-project', 'scoped'],
  'Integration',
  true,
  false,
  0,
  NULL,
  NULL
),
-- UI-Only Changes prompt
(
  'system-responsive-ui-only',
  'UI-Only Changes - Responsive & Scoped',
  'Make UI-only changes with strict scope limitations:

**SCOPE LIMITATIONS:**
- Only modify visual components and styling
- No backend or API changes
- No database modifications
- No business logic alterations

**RESPONSIVE REQUIREMENTS:**
- Mobile-first approach (320px and up)
- Tablet optimization (768px and up)
- Desktop enhancement (1024px and up)
- Touch-friendly interactions
- Proper spacing for different screen sizes

**UI BEST PRACTICES:**
- Use existing design system tokens
- Maintain consistent spacing and typography
- Ensure proper contrast ratios
- Add smooth transitions and animations
- Test across different viewports

**WHAT TO FOCUS ON:**
- Layout adjustments for different screens
- Button and form element sizing
- Navigation menu adaptations
- Image and media responsiveness
- Content hierarchy for mobile

**TECHNICAL CONSTRAINTS:**
- Use semantic HTML elements
- Follow WCAG accessibility guidelines
- Optimize for performance
- Maintain existing functionality
- Test in multiple browsers',
  'claude-3.5-sonnet',
  ARRAY['ui', 'responsive', 'design', 'mobile', 'scoped'],
  'Design',
  true,
  false,
  0,
  NULL,
  NULL
),
-- Multi-User Workspace System prompt
(
  'system-workspace-invitations',
  'Multi-User Workspace System - Complete Implementation',
  'Build a complete multi-user workspace system with secure invitation flow:

**DATABASE STRUCTURE:**
Create these tables with proper relationships:
- workspaces (id, name, created_by, subscription_tier, settings)
- workspace_members (workspace_id, user_id, role, status, joined_at)
- workspace_invitations (id, workspace_id, email, token, expires_at, status)

**AUTHENTICATION & SECURITY:**
- Row Level Security (RLS) on all workspace tables
- Secure invitation acceptance via SECURITY DEFINER function
- Email-based invitation validation
- Automatic cleanup of expired invitations
- Role-based access control (admin, member, viewer)

**INVITATION WORKFLOW:**
1. Admin creates invitation with unique token
2. System sends invitation email with join link
3. Recipient clicks link, validates token
4. Auto-creates user account if needed
5. Adds user to workspace with specified role
6. Redirects to workspace dashboard

**CORE FEATURES:**
- Workspace creation and management
- Member invitation and removal
- Role management and permissions
- Real-time member status updates
- Invitation link generation and tracking
- Automatic workspace switching

**UI COMPONENTS:**
- Workspace selector dropdown
- Member management modal
- Invitation creation form
- Join workspace page
- Member list with role badges
- Invitation status indicators

**TECHNICAL REQUIREMENTS:**
- React hooks for workspace management
- Supabase integration with RPC functions
- Real-time subscriptions for member updates
- Error handling for invitation failures
- Loading states and user feedback
- Mobile-responsive design

**SECURITY CONSIDERATIONS:**
- Token expiration (24-48 hours)
- Single-use invitation tokens
- Email domain validation
- Rate limiting for invitations
- Audit logging for workspace changes
- Secure member removal process

**DATABASE FUNCTIONS:**
Create RPC functions for:
- accept_workspace_invitation(token, user_id)
- get_user_workspaces(user_id)
- validate_invitation_token(token)
- cleanup_expired_invitations()

**REAL-TIME FEATURES:**
- Live member status updates
- Instant invitation acceptance
- Real-time workspace activity
- Collaborative workspace management

This system ensures secure, scalable multi-user collaboration with proper access control and user experience.',
  'claude-3.5-sonnet',
  ARRAY['workspace', 'invitations', 'authentication', 'supabase', 'rls', 'collaboration', 'multi-user'],
  'Integration',
  true,
  false,
  0,
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;