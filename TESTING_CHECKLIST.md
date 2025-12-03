# Manual Testing Checklist

## Medication Adherence
- [ ] Create medication with once_daily frequency
- [ ] Verify 30 doses generated automatically
- [ ] Check doses appear in pending doses widget
- [ ] Mark dose as "Taken" - verify optimistic UI
- [ ] Mark dose as "Skip" - verify it's recorded
- [ ] Create medication with end date - verify doses stop
- [ ] Create weekly medication - verify correct schedule
- [ ] Test as_needed medication - verify no scheduled doses

## Data Quality
- [ ] Log BP ≥140/90 without notes - verify error message
- [ ] Log BP ≥140/90 with notes - verify success
- [ ] Check data completeness widget shows correct scores
- [ ] Verify contextual prompt appears after BP logging
- [ ] Dismiss contextual prompt - verify it doesn't reappear immediately
- [ ] Test data quality score calculation with various data
- [ ] Verify improvement suggestions are relevant

## Analytics
- [ ] View analytics page with 14+ days of data
- [ ] Verify trend analysis shows direction (improving/stable/worsening)
- [ ] Check correlation insights display
- [ ] Verify week-over-week comparison
- [ ] Test with insufficient data - verify graceful handling
- [ ] Check exercise-BP correlation insights
- [ ] Verify medication adherence correlation

## Dashboard
- [ ] Pending doses widget shows today's medications
- [ ] Data completeness card displays scores
- [ ] All widgets load without errors
- [ ] Loading states display correctly
- [ ] Quick log prompt appears appropriately
- [ ] Recent readings display correctly

## Quick Log Feature
- [ ] Quick log button accessible from dashboard
- [ ] BP logging works correctly
- [ ] Contextual prompts appear after logging
- [ ] Navigation back to dashboard works
- [ ] Form validation works properly

## Forms & Validation
- [ ] BP form validates systolic/diastolic ranges
- [ ] High BP readings require notes
- [ ] Medication form validates all required fields
- [ ] Time picker works correctly
- [ ] Date picker works correctly
- [ ] Form submission shows loading states
- [ ] Success/error messages display correctly

## Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Database errors are caught and handled
- [ ] Invalid data shows validation errors
- [ ] 404 pages display correctly
- [ ] Error boundaries catch component errors

## Accessibility
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Check color contrast (use DevTools)
- [ ] Verify ARIA labels present
- [ ] Keyboard shortcuts work
- [ ] Skip to content link works

## Performance
- [ ] Dashboard loads in <2 seconds
- [ ] Analytics page loads in <3 seconds
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Images load optimally
- [ ] Smooth scrolling and transitions

## Mobile Responsiveness
- [ ] Test on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Touch targets are 44x44px minimum
- [ ] Mobile navigation works correctly
- [ ] Forms are usable on mobile
- [ ] Charts render correctly on mobile

## Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Security
- [ ] Protected routes require authentication
- [ ] User can only access their own data
- [ ] XSS protection works
- [ ] CSRF protection works (Server Actions)
- [ ] Environment variables not exposed

## Data Integrity
- [ ] BP readings save correctly
- [ ] Medication doses update correctly
- [ ] Diet/exercise logs save correctly
- [ ] Data doesn't leak between users
- [ ] Timestamps are accurate

## Edge Cases
- [ ] Test with no data (empty states)
- [ ] Test with maximum data (performance)
- [ ] Test with special characters in inputs
- [ ] Test with very long text inputs
- [ ] Test with dates in different timezones
- [ ] Test with slow network (throttling)

---

## Testing Notes

**Date Tested:** _________________

**Tester:** _________________

**Environment:** _________________

**Issues Found:** _________________

---

## Test Results Summary

- **Total Tests:** ___
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___

**Overall Status:** ☐ Pass ☐ Fail ☐ Needs Review


