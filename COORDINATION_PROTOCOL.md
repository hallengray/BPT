# 🎯 Blood Pressure Tracker - Agent Coordination Protocol

**Lead Architect**: Mark (Coordinating All Agents)
**Sprint Duration**: 3-4 hours
**Quality Standard**: Zero TypeScript errors, Zero linting errors, 100% accessibility

---

## 📋 Agent Assignments Summary

| Agent | Focus Area | Priority | Estimated Time | Blocking Others |
|-------|-----------|----------|----------------|-----------------|
| **Agent Alpha** | Authentication & User Management | CRITICAL | 2-3 hours | YES - Blocks Beta & Gamma |
| **Agent Beta** | Dashboard & BP Tracking | HIGH | 3-4 hours | NO - Depends on Alpha |
| **Agent Gamma** | Diet & Exercise Logging | MEDIUM | 2-3 hours | NO - Depends on Alpha |

---

## 🔧 MCP Server Integration Protocol

### **Context7 MCP - Best Practices Consultation**

All agents MUST consult Context7 BEFORE implementing major features:

#### Agent Alpha - Authentication Patterns
```bash
# Before implementing auth
@context7 get-library-docs /vercel/next.js/v15.1.8 "server actions authentication middleware"
@context7 get-library-docs /reactjs/react.dev "useFormStatus useActionState forms"
@context7 get-library-docs /supabase/supabase "authentication ssr nextjs"
```

#### Agent Beta - Dashboard & Charts
```bash
# Before implementing dashboard
@context7 get-library-docs /vercel/next.js/v15.1.8 "server components suspense streaming"
@context7 get-library-docs /reactjs/react.dev "use hook suspense"
@context7 resolve-library-id recharts
@context7 get-library-docs /recharts/recharts "line chart responsive"
```

#### Agent Gamma - Forms & Validation
```bash
# Before implementing forms
@context7 get-library-docs /reactjs/react.dev "useOptimistic optimistic updates"
@context7 resolve-library-id zod
@context7 get-library-docs /colinhacks/zod "form validation schemas"
@context7 resolve-library-id react-hook-form
```

### **Supabase MCP - Database Operations**

All agents MUST verify database operations using Supabase MCP:

#### Pre-Implementation Checks
```bash
# Verify table schemas
@supabase list-tables ["public"]

# Check RLS policies are enabled
@supabase get-advisors security

# Verify migrations applied
@supabase list-migrations
```

#### During Development - Test Queries
```bash
# Agent Alpha - Test auth flow
@supabase execute-sql "SELECT id, email FROM auth.users LIMIT 1"

# Agent Beta - Test BP readings
@supabase execute-sql "SELECT * FROM blood_pressure_readings ORDER BY measured_at DESC LIMIT 5"

# Agent Gamma - Test diet/exercise logs
@supabase execute-sql "SELECT * FROM diet_logs ORDER BY logged_at DESC LIMIT 5"
@supabase execute-sql "SELECT * FROM exercise_logs ORDER BY logged_at DESC LIMIT 5"
```

#### Post-Implementation - Security Audit
```bash
# Check for security issues
@supabase get-advisors security

# Check for performance issues
@supabase get-advisors performance

# Verify RLS policies
@supabase execute-sql "SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE schemaname = 'public'"
```

---

## ✅ Quality Assurance Protocol

### **Phase 1: Pre-Commit Checks** (Each Agent)

Before committing ANY code, run these commands:

```bash
# 1. TypeScript Type Checking
npm run type-check

# Expected output: No errors
# If errors: Fix ALL TypeScript errors before proceeding
```

```bash
# 2. ESLint Check
npm run lint

# Expected output: No errors or warnings
# If errors: Fix ALL linting errors before proceeding
```

```bash
# 3. Build Test
npm run build

# Expected output: Build completed successfully
# If errors: Fix build errors before proceeding
```

```bash
# 4. Format Code
npm run format

# This will auto-format all code with Prettier
```

### **Phase 2: Runtime Testing** (Each Agent)

After code passes pre-commit checks:

```bash
# 1. Start dev server
npm run dev

# 2. Open browser to http://localhost:3000
# 3. Test your features manually
```

#### Agent Alpha - Auth Testing Checklist
- [ ] Navigate to `/signup`
- [ ] Fill out signup form with valid data
- [ ] Submit and verify success message
- [ ] Check email for verification (if applicable)
- [ ] Navigate to `/login`
- [ ] Login with created credentials
- [ ] Verify redirect to `/dashboard`
- [ ] Test logout functionality
- [ ] Navigate to `/forgot-password`
- [ ] Test password reset flow
- [ ] Test invalid inputs (wrong email, weak password)
- [ ] Verify error messages are user-friendly
- [ ] Test keyboard navigation (Tab through all fields)
- [ ] Test with screen reader (if available)

#### Agent Beta - Dashboard Testing Checklist
- [ ] Login and navigate to `/dashboard`
- [ ] Verify statistics cards display correctly
- [ ] Check chart renders with data
- [ ] Test empty state for new users
- [ ] Navigate to `/log-bp`
- [ ] Fill out BP form with valid data
- [ ] Submit and verify success message
- [ ] Return to dashboard and verify new reading appears
- [ ] Test chart updates with new data
- [ ] Test mobile navigation (resize browser)
- [ ] Test desktop navigation
- [ ] Verify sign out button works
- [ ] Test loading states (slow network simulation)
- [ ] Test dark mode toggle

#### Agent Gamma - Diet/Exercise Testing Checklist
- [ ] Navigate to `/log-diet-exercise`
- [ ] Test Diet tab
  - [ ] Select each meal type
  - [ ] Fill description (test min/max length)
  - [ ] Add optional notes
  - [ ] Submit and verify success
  - [ ] Check recent logs update
- [ ] Test Exercise tab
  - [ ] Enter activity name
  - [ ] Enter duration (test min/max)
  - [ ] Select intensity (optional)
  - [ ] Add optional notes
  - [ ] Submit and verify success
  - [ ] Check recent logs update
- [ ] Test tab switching
- [ ] Test form validation errors
- [ ] Test keyboard navigation
- [ ] Test mobile responsive design

### **Phase 3: Accessibility Testing** (All Agents)

```bash
# Run Lighthouse audit in Chrome DevTools
# Target scores:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
# - SEO: >90
```

**Manual Accessibility Checks:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text)
- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] Error messages are announced by screen readers
- [ ] Loading states are announced
- [ ] Success messages are announced

### **Phase 4: Cross-Browser Testing** (All Agents)

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Test on devices:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 🔍 Linting & Error Resolution Protocol

### **TypeScript Errors**

If you encounter TypeScript errors:

```bash
# 1. Read the error carefully
npm run type-check

# 2. Common fixes:
# - Missing type definitions: Add proper interfaces
# - Any types: Replace with proper types
# - Null/undefined: Add proper null checks
# - Import errors: Check import paths

# 3. Use Cursor's read_lints tool
@cursor read_lints ["path/to/file.ts"]

# 4. Fix errors one by one
# 5. Re-run type-check until clean
```

### **ESLint Errors**

If you encounter linting errors:

```bash
# 1. Run lint to see all errors
npm run lint

# 2. Auto-fix what's possible
npm run lint -- --fix

# 3. Manually fix remaining errors
# 4. Common issues:
# - Unused variables: Remove or prefix with _
# - Missing dependencies in useEffect: Add to dependency array
# - Console.log statements: Remove or use proper logging
```

### **Build Errors**

If build fails:

```bash
# 1. Check the error message
npm run build

# 2. Common issues:
# - Import errors: Check file paths
# - Missing dependencies: npm install
# - Environment variables: Check .env.local
# - Type errors: Run type-check first
```

---

## 🔄 Integration & Coordination Points

### **Checkpoint 1: After 1 Hour**

**All Agents Report:**
- Current progress (% complete)
- Any blockers encountered
- Questions for other agents
- TypeScript/lint status

**Lead (Mark) Actions:**
- Review progress
- Resolve blockers
- Adjust timeline if needed

### **Checkpoint 2: After 2 Hours**

**Agent Alpha Status:**
- [ ] Auth pages complete
- [ ] Server Actions working
- [ ] Hooks exported for other agents
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors

**If Alpha Complete:**
- Agent Beta can integrate auth hooks
- Agent Gamma can integrate auth hooks

**If Alpha Blocked:**
- Lead provides assistance
- Beta/Gamma continue with mock data

### **Checkpoint 3: After 3 Hours**

**All Agents Report:**
- Features complete (%)
- Integration status
- Testing results
- Known issues

**Lead Actions:**
- Code review
- Integration testing
- Identify remaining work

### **Final Checkpoint: Before Completion**

**All Agents Must:**
- [ ] Run full test suite
- [ ] Fix all TypeScript errors
- [ ] Fix all linting errors
- [ ] Test all features manually
- [ ] Verify accessibility
- [ ] Test on mobile
- [ ] Document any known issues

---

## 📊 Quality Metrics Dashboard

Each agent tracks:

| Metric | Target | Agent Alpha | Agent Beta | Agent Gamma |
|--------|--------|-------------|------------|-------------|
| TypeScript Errors | 0 | ⏳ | ⏳ | ⏳ |
| Linting Errors | 0 | ⏳ | ⏳ | ⏳ |
| Build Status | ✅ | ⏳ | ⏳ | ⏳ |
| Tests Passing | 100% | ⏳ | ⏳ | ⏳ |
| Accessibility Score | >95 | ⏳ | ⏳ | ⏳ |
| Mobile Responsive | ✅ | ⏳ | ⏳ | ⏳ |

---

## 🚨 Escalation Protocol

### **Blocker Severity Levels**

**Level 1 - Minor** (Self-resolve within 15 min)
- Styling issues
- Minor bugs
- Documentation questions

**Level 2 - Moderate** (Ping @mark within 30 min)
- TypeScript errors you can't resolve
- Integration issues with other agents
- Unexpected API behavior

**Level 3 - Critical** (Immediate escalation)
- Build completely broken
- Database connection issues
- Security vulnerabilities discovered
- Blocking other agents

### **Communication Channels**

- **Quick Questions**: Ping @mark in coordination channel
- **Code Review**: Tag @mark in pull request
- **Blockers**: Direct message @mark immediately
- **Status Updates**: Post in coordination channel

---

## 📝 Deliverables Checklist

### **Agent Alpha Deliverables**
- [ ] Login page (`app/(auth)/login/page.tsx`)
- [ ] Signup page (`app/(auth)/signup/page.tsx`)
- [ ] Forgot password page (`app/(auth)/forgot-password/page.tsx`)
- [ ] Auth Server Actions (`app/actions/auth.ts`)
- [ ] Validation schemas (`lib/validations/auth.ts`)
- [ ] Auth forms (`components/forms/`)
- [ ] Custom hooks (`hooks/use-user.ts`, `hooks/use-auth.ts`)
- [ ] All TypeScript errors fixed
- [ ] All linting errors fixed
- [ ] All tests passing
- [ ] Documentation updated

### **Agent Beta Deliverables**
- [ ] Dashboard layout (`app/(dashboard)/layout.tsx`)
- [ ] Dashboard page (`app/(dashboard)/dashboard/page.tsx`)
- [ ] BP logging page (`app/(dashboard)/log-bp/page.tsx`)
- [ ] BP Server Actions (`app/actions/bp-readings.ts`)
- [ ] Validation schemas (`lib/validations/bp-readings.ts`)
- [ ] Chart components (`components/charts/`)
- [ ] Navigation components (`components/layout/`)
- [ ] BP form (`components/forms/bp-reading-form.tsx`)
- [ ] All TypeScript errors fixed
- [ ] All linting errors fixed
- [ ] All tests passing
- [ ] Documentation updated

### **Agent Gamma Deliverables**
- [ ] Diet/Exercise page (`app/(dashboard)/log-diet-exercise/page.tsx`)
- [ ] Diet Server Actions (`app/actions/diet-logs.ts`)
- [ ] Exercise Server Actions (`app/actions/exercise-logs.ts`)
- [ ] Validation schemas (`lib/validations/`)
- [ ] Diet form (`components/forms/diet-log-form.tsx`)
- [ ] Exercise form (`components/forms/exercise-log-form.tsx`)
- [ ] shadcn/ui components added (tabs, select, textarea)
- [ ] All TypeScript errors fixed
- [ ] All linting errors fixed
- [ ] All tests passing
- [ ] Documentation updated

---

## 🎯 Success Criteria

**Sprint is complete when:**
- ✅ All features implemented
- ✅ Zero TypeScript errors
- ✅ Zero linting errors
- ✅ All manual tests passing
- ✅ Accessibility score >95
- ✅ Mobile responsive verified
- ✅ Cross-browser tested
- ✅ Documentation complete
- ✅ Code reviewed by Lead
- ✅ Integration tested
- ✅ Ready for production

---

## 📞 Contact Information

**Lead Architect**: @mark
**Agent Alpha**: @agent-alpha
**Agent Beta**: @agent-beta  
**Agent Gamma**: @agent-gamma

**Office Hours**: Available for questions 24/7
**Response Time**: <15 minutes for critical issues

---

## 🎓 Best Practices Reminders

1. **Consult Context7 BEFORE implementing**
2. **Test with Supabase MCP during development**
3. **Run type-check after every major change**
4. **Commit frequently with descriptive messages**
5. **Ask questions early, don't wait until blocked**
6. **Follow .cursorrules strictly**
7. **Write accessible code from the start**
8. **Test on mobile as you build**
9. **Document complex logic**
10. **Communicate progress regularly**

---

**Let's build something amazing! 🚀**

**Questions? Ping @mark anytime!**

