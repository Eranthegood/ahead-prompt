import type { PromptLibraryItem, SystemPromptTemplate } from '@/types/prompt-library';

// System-wide prompts available to all users
export const SYSTEM_PROMPTS: SystemPromptTemplate[] = [
  {
    id: 'system-stripe-integration',
    title: 'Stripe Payment Integration - Scoped & Responsive',
    body: `Integrate Stripe payments with these constraints:

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
5. Mobile-first responsive design`,
    ai_model: 'claude-3.5-sonnet',
    tags: ['stripe', 'payments', 'ui', 'responsive', 'new-project', 'scoped'],
    category: 'Integration',
    is_system: true,
  },
  {
    id: 'system-responsive-ui-only',
    title: 'UI-Only Changes - Responsive & Scoped',
    body: `Make UI-only changes with strict scope limitations:

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
- Test in multiple browsers`,
    ai_model: 'claude-3.5-sonnet',
    tags: ['ui', 'responsive', 'design', 'mobile', 'scoped'],
    category: 'Design',
    is_system: true,
  },
];