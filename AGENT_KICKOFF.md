# 🚀 Blood Pressure Tracker - Agent Kickoff Brief

**Date**: November 2, 2025
**Lead Architect**: Mark (Coordinating)
**Sprint Goal**: Implement Authentication, Dashboard, and Logging Features
**Timeline**: 3-4 hours parallel development

---

## 📢 Welcome Team!

We're building a production-ready Blood Pressure Tracker with Next.js 15, React 19, and Supabase. This is a healthcare application, so **quality, security, and accessibility are non-negotiable**.

---

## 🎯 Your Mission

### **Agent Alpha** (@agent-alpha) - Authentication Lead
**Your Mission**: Build the authentication system that secures our entire application.

**Key Deliverables**:
- Login, Signup, and Forgot Password pages
- Server Actions for auth operations
- Custom hooks for auth state
- Zod validation schemas

**Why You're Critical**: Beta and Gamma are blocked until you complete auth hooks!

**Read Your Spec**: `AGENT_ALPHA_SPEC.md`

---

### **Agent Beta** (@agent-beta) - Dashboard Lead
**Your Mission**: Build the dashboard that visualizes health data and tracks blood pressure.

**Key Deliverables**:
- Dashboard with statistics and charts
- BP logging functionality
- Navigation components
- Recharts integration

**Dependencies**: Needs `useUser()` hook from Agent Alpha

**Read Your Spec**: `AGENT_BETA_SPEC.md`

---

### **Agent Gamma** (@agent-gamma) - Logging Features Lead
**Your Mission**: Build intuitive diet and exercise logging with excellent UX.

**Key Deliverables**:
- Diet and exercise logging forms
- Tabbed interface
- Server Actions for CRUD
- Recent logs display

**Dependencies**: Needs `useUser()` hook from Agent Alpha

**Read Your Spec**: `AGENT_GAMMA_SPEC.md`

---

## 📚 Required Reading (10 minutes)

**Everyone MUST read:**
1. `.cursorrules` - Our development standards
2. `COORDINATION_PROTOCOL.md` - Quality assurance process
3. Your specific agent spec (AGENT_X_SPEC.md)
4. `PROGRESS.md` - What's already built

---

## 🔧 Setup Instructions

### 1. Verify Your Environment

```bash
# Check Node version (should be 18+)
node --version

# Check npm
npm --version

# Verify dependencies installed
npm install

# Test dev server
npm run dev
```

### 2. Verify MCP Servers

```bash
# Test Context7
@context7 get-library-docs /vercel/next.js/v15.1.8 "server actions"

# Test Supabase
@supabase list-tables ["public"]
@supabase get-advisors security
```

### 3. Verify Database

```bash
# Check migrations
@supabase list-migrations

# Expected: 4 migrations (profiles, bp_readings, diet_logs, exercise_logs)

# Test connection
@supabase execute-sql "SELECT COUNT(*) FROM profiles"
```

---

## 🎬 Getting Started

### **Step 1: Consult Context7** (5-10 minutes)

Before writing ANY code, consult Context7 for best practices:

**Agent Alpha**:
```bash
@context7 get-library-docs /vercel/next.js/v15.1.8 "server actions authentication"
@context7 get-library-docs /reactjs/react.dev "useFormStatus useActionState"
```

**Agent Beta**:
```bash
@context7 get-library-docs /vercel/next.js/v15.1.8 "server components suspense"
@context7 get-library-docs /reactjs/react.dev "use hook"
```

**Agent Gamma**:
```bash
@context7 get-library-docs /reactjs/react.dev "useOptimistic"
@context7 get-library-docs /colinhacks/zod "validation"
```

### **Step 2: Create Your Branch** (1 minute)

```bash
git checkout -b feature/agent-alpha-auth
# or
git checkout -b feature/agent-beta-dashboard
# or
git checkout -b feature/agent-gamma-logging
```

### **Step 3: Start Building** (2-3 hours)

Follow your spec file exactly. The specs include:
- Complete code examples
- File structure
- Implementation details
- Testing checklists

### **Step 4: Test Continuously**

After EVERY major change:
```bash
# Type check
npm run type-check

# Lint check
npm run lint

# Test in browser
npm run dev
```

### **Step 5: Quality Check Before Commit**

```bash
# 1. Type check - MUST be zero errors
npm run type-check

# 2. Lint check - MUST be zero errors
npm run lint

# 3. Build test - MUST succeed
npm run build

# 4. Format code
npm run format

# 5. Manual testing - Follow your checklist
```

---

## ⏰ Timeline & Checkpoints

### **Hour 1: Foundation**
- **Agent Alpha**: Auth pages structure + validation
- **Agent Beta**: Dashboard layout + navigation
- **Agent Gamma**: Form components + validation

**Checkpoint**: Report progress to @mark

### **Hour 2: Core Implementation**
- **Agent Alpha**: Server Actions + hooks (COMPLETE & EXPORT)
- **Agent Beta**: Dashboard data fetching + charts
- **Agent Gamma**: Server Actions + forms

**Checkpoint**: Agent Alpha exports hooks for Beta/Gamma

### **Hour 3: Integration & Polish**
- **Agent Alpha**: Testing + bug fixes
- **Agent Beta**: Integrate auth + BP logging
- **Agent Gamma**: Integrate auth + recent logs

**Checkpoint**: Integration testing begins

### **Hour 4: Quality Assurance**
- **All Agents**: Fix TypeScript/lint errors
- **All Agents**: Accessibility testing
- **All Agents**: Mobile testing
- **All Agents**: Documentation

**Final Checkpoint**: Code review with @mark

---

## 🚨 Important Rules

### **DO:**
✅ Consult Context7 before implementing
✅ Test with Supabase MCP during development
✅ Run type-check frequently
✅ Follow .cursorrules strictly
✅ Write accessible code
✅ Test on mobile as you build
✅ Ask questions early
✅ Communicate progress
✅ Fix errors immediately
✅ Document complex logic

### **DON'T:**
❌ Skip Context7 consultation
❌ Commit code with TypeScript errors
❌ Commit code with linting errors
❌ Use `any` types
❌ Skip accessibility testing
❌ Ignore mobile responsive design
❌ Wait until blocked to ask questions
❌ Skip manual testing
❌ Forget to export hooks/types for other agents
❌ Push broken code

---

## 🔍 Quality Standards

**Zero Tolerance For:**
- TypeScript errors
- Linting errors
- Build failures
- Accessibility violations (WCAG AA)
- Security vulnerabilities
- Broken mobile layouts

**Required Scores:**
- TypeScript: 0 errors
- ESLint: 0 errors
- Lighthouse Accessibility: >95
- Mobile Responsive: 100%

---

## 💬 Communication Protocol

### **Quick Questions**
Ping @mark in coordination channel

### **Blockers**
Direct message @mark immediately

### **Progress Updates**
Post in coordination channel every hour

### **Code Review**
Tag @mark when ready for review

### **Integration Issues**
Ping affected agent + @mark

---

## 📦 File Ownership

To avoid conflicts:

**Agent Alpha Owns:**
- `app/(auth)/*`
- `app/actions/auth.ts`
- `lib/validations/auth.ts`
- `components/forms/*-form.tsx` (auth forms)
- `hooks/use-user.ts`
- `hooks/use-auth.ts`

**Agent Beta Owns:**
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/*`
- `app/(dashboard)/log-bp/*`
- `app/actions/bp-readings.ts`
- `lib/validations/bp-readings.ts`
- `components/charts/*`
- `components/layout/*`
- `hooks/use-bp-readings.ts`

**Agent Gamma Owns:**
- `app/(dashboard)/log-diet-exercise/*`
- `app/actions/diet-logs.ts`
- `app/actions/exercise-logs.ts`
- `lib/validations/diet-logs.ts`
- `lib/validations/exercise-logs.ts`
- `components/forms/diet-log-form.tsx`
- `components/forms/exercise-log-form.tsx`
- `components/ui/tabs.tsx`
- `components/ui/select.tsx`
- `components/ui/textarea.tsx`
- `hooks/use-diet-logs.ts`
- `hooks/use-exercise-logs.ts`

**Shared Files (Coordinate Before Editing):**
- `lib/utils.ts` - Agent Beta manages
- `types/index.ts` - Agent Beta manages
- `middleware.ts` - Already complete, don't touch

---

## 🎯 Success Metrics

**Individual Success:**
- All your features work
- Zero TypeScript errors
- Zero linting errors
- All tests passing
- Accessible (WCAG AA)
- Mobile responsive
- Documented

**Team Success:**
- All features integrated
- End-to-end flows work
- Production ready
- Code reviewed
- Ready to deploy

---

## 🏆 Let's Build Something Amazing!

You're all senior developers. You know what to do. Follow the specs, use the MCP servers, maintain quality standards, and communicate.

**Remember**: This is a healthcare app. People will use this to manage their health. Quality and accessibility aren't optional.

**Questions?** Ping @mark anytime!

**Ready?** Read your spec and start building! 🚀

---

## 📞 Quick Reference

- **Specs**: `AGENT_[ALPHA|BETA|GAMMA]_SPEC.md`
- **Coordination**: `COORDINATION_PROTOCOL.md`
- **Progress**: `PROGRESS.md`
- **Standards**: `.cursorrules`
- **Lead**: @mark

**Let's ship this! 💪**

