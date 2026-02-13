# 🔍 Code Review Checklist

## General

- [ ] PR is small and focused
- [ ] Clear description provided
- [ ] No unrelated changes
- [ ] Branch is up to date with main

---

## Frontend (React + TS + Tailwind)

- [ ] Components are small and reusable
- [ ] No business logic inside JSX
- [ ] No unnecessary `any` types
- [ ] Proper prop typing
- [ ] No inline API calls (use services/)
- [ ] Tailwind classes are clean
- [ ] No console errors

---

## Backend (Node + TS)

- [ ] Routes are thin
- [ ] Logic is inside services
- [ ] Proper error handling
- [ ] Input validation exists
- [ ] No hardcoded secrets
- [ ] Correct HTTP status codes
- [ ] Proper TypeScript types used

---

## Security

- [ ] No exposed credentials
- [ ] JWT properly handled
- [ ] No sensitive logs

---

## Performance

- [ ] No unnecessary re-renders
- [ ] No blocking operations
