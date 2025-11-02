# 🧪 Agent Alpha - Authentication Testing Guide

**For**: Senior Agent Review & Manual Testing  
**Agent**: Agent Alpha  
**Date**: November 2, 2025

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# 1. Ensure dev server is running
npm run dev

# 2. Open browser to http://localhost:3000
```

---

## 📋 Testing Checklist

### Test 1: Sign Up Flow (5 minutes)

#### Happy Path
1. Navigate to http://localhost:3000/signup
2. Fill in the form:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test1234`
   - Confirm Password: `Test1234`
3. Click "Create Account"
4. ✅ **Expected**: Green success message appears
5. ✅ **Expected**: Message says "check your email to verify"

#### Error Cases
1. **Invalid Email**
   - Enter: `notanemail`
   - ✅ **Expected**: "Invalid email address" error

2. **Weak Password**
   - Enter: `weak`
   - ✅ **Expected**: "Password must be at least 8 characters" error

3. **Missing Uppercase**
   - Enter: `test1234`
   - ✅ **Expected**: "Password must contain at least one uppercase letter"

4. **Passwords Don't Match**
   - Password: `Test1234`
   - Confirm: `Test5678`
   - ✅ **Expected**: "Passwords don't match" error

5. **Existing Email**
   - Use an email that's already registered
   - ✅ **Expected**: User-friendly error message

---

### Test 2: Login Flow (3 minutes)

#### Happy Path
1. Navigate to http://localhost:3000/login
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test1234`
3. Click "Sign In"
4. ✅ **Expected**: Redirect to `/dashboard`

#### Error Cases
1. **Wrong Password**
   - Email: `test@example.com`
   - Password: `WrongPassword123`
   - ✅ **Expected**: "Invalid email or password" error

2. **Non-existent Email**
   - Email: `nonexistent@example.com`
   - Password: `Test1234`
   - ✅ **Expected**: "Invalid email or password" error

3. **Empty Fields**
   - Leave fields empty and try to submit
   - ✅ **Expected**: Browser validation prevents submission

---

### Test 3: Forgot Password Flow (2 minutes)

1. Navigate to http://localhost:3000/forgot-password
2. Enter valid email: `test@example.com`
3. Click "Send Reset Link"
4. ✅ **Expected**: Green success message
5. ✅ **Expected**: "Please check your email" message
6. Check email for reset link
7. ✅ **Expected**: Email received with reset link

---

### Test 4: Keyboard Navigation (5 minutes)

#### Login Page
1. Navigate to http://localhost:3000/login
2. Press `Tab` key repeatedly
3. ✅ **Expected**: Focus moves through:
   - Email input
   - Password input
   - Sign In button
   - Forgot password link
   - Sign up link
4. ✅ **Expected**: Focus indicator visible on all elements
5. Fill in email and password using keyboard only
6. Press `Enter` to submit
7. ✅ **Expected**: Form submits successfully

#### Signup Page
1. Navigate to http://localhost:3000/signup
2. Use `Tab` to navigate through all fields
3. ✅ **Expected**: All fields accessible via keyboard
4. ✅ **Expected**: Can submit with `Enter` key

---

### Test 5: Loading States (2 minutes)

1. Navigate to http://localhost:3000/login
2. Fill in valid credentials
3. Click "Sign In"
4. ✅ **Expected**: Button shows "Signing in..."
5. ✅ **Expected**: Button is disabled during submission
6. ✅ **Expected**: No double-submission possible

---

### Test 6: Mobile Responsive (3 minutes)

1. Open http://localhost:3000/login
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test on different screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
5. ✅ **Expected**: Form looks good on all sizes
6. ✅ **Expected**: Touch targets are 44x44px minimum
7. ✅ **Expected**: No horizontal scrolling

---

### Test 7: Dark Mode (2 minutes)

1. Navigate to any auth page
2. Toggle dark mode (if theme switcher exists)
3. ✅ **Expected**: All text is readable
4. ✅ **Expected**: Contrast is sufficient
5. ✅ **Expected**: Gradient background adapts

---

### Test 8: Screen Reader (5 minutes)

**Windows**: Use NVDA or Narrator  
**Mac**: Use VoiceOver (Cmd+F5)

1. Navigate to http://localhost:3000/login
2. Turn on screen reader
3. Tab through the form
4. ✅ **Expected**: All labels are announced
5. ✅ **Expected**: Error messages are announced
6. ✅ **Expected**: Button state changes are announced
7. Submit form with error
8. ✅ **Expected**: Error alert is announced immediately

---

## 🎨 Visual Testing Checklist

### Login Page
- [ ] Heart icon displays correctly
- [ ] "Welcome back" heading is prominent
- [ ] Card is centered on screen
- [ ] Gradient background looks good
- [ ] Form fields are properly aligned
- [ ] Links are styled correctly
- [ ] Error alerts are visible and styled

### Signup Page
- [ ] All form fields display correctly
- [ ] Password hint text is visible
- [ ] Success message is green and prominent
- [ ] Terms and Privacy links are present
- [ ] "Already have an account?" link works

### Forgot Password Page
- [ ] Single email field displays
- [ ] Helper text is visible
- [ ] "Back to sign in" link works
- [ ] Success message displays correctly

---

## 🔍 Integration Testing (For Senior Agent)

### Test with Agent Beta (Dashboard)
```typescript
// In dashboard component
import { useUser } from '@/hooks/use-user'

const { user, loading } = useUser()

// Test cases:
// 1. User is null when not logged in
// 2. User object exists after login
// 3. user.email is accessible
// 4. loading is true initially, then false
```

### Test with Agent Gamma (Logging)
```typescript
// In logging form
import { useUser } from '@/hooks/use-user'

const { user } = useUser()

// Test cases:
// 1. user.id is available for server actions
// 2. Can associate logs with user
```

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid email or password" on correct credentials
**Solution**: Check Supabase email verification. User might need to verify email first.

### Issue: Redirect not working after login
**Solution**: Ensure Agent Beta has created `/dashboard` page.

### Issue: Form submission does nothing
**Solution**: Check browser console for errors. Ensure dev server is running.

### Issue: Styles not loading
**Solution**: Clear `.next` cache and restart dev server.

---

## ✅ Sign-Off Checklist

After completing all tests, verify:

- [ ] All happy paths work correctly
- [ ] All error cases show appropriate messages
- [ ] Keyboard navigation works perfectly
- [ ] Mobile responsive on all screen sizes
- [ ] Dark mode works (if applicable)
- [ ] Screen reader announces everything
- [ ] Loading states display correctly
- [ ] No console errors
- [ ] TypeScript: 0 errors
- [ ] Linting: 0 errors

---

## 📊 Test Results Template

```markdown
## Test Results

**Tester**: [Your Name]
**Date**: [Date]
**Browser**: [Chrome/Firefox/Safari/Edge]
**OS**: [Windows/Mac/Linux]

### Results
- Sign Up Flow: ✅ / ❌
- Login Flow: ✅ / ❌
- Forgot Password: ✅ / ❌
- Keyboard Navigation: ✅ / ❌
- Loading States: ✅ / ❌
- Mobile Responsive: ✅ / ❌
- Dark Mode: ✅ / ❌
- Screen Reader: ✅ / ❌

### Issues Found
1. [Issue description]
2. [Issue description]

### Notes
[Any additional observations]
```

---

## 🎯 Success Criteria

**All tests must pass** before marking Agent Alpha as complete:
- ✅ All functional tests pass
- ✅ All accessibility tests pass
- ✅ All visual tests pass
- ✅ Zero TypeScript errors
- ✅ Zero linting errors
- ✅ Hooks work for Agent Beta & Gamma

---

## 📞 Questions?

**Agent Alpha** is available for:
- Bug fixes
- Integration support
- Testing assistance
- Documentation clarification

**Contact**: @agent-alpha in coordination channel

---

**Happy Testing! 🚀**

