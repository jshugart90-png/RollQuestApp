# RollQuest

RollQuest is a premium dark-theme BJJ training app with:
- student progress + spaced repetition review
- gym owner tools (assignments, announcements, requests)
- onboarding, role foundation, and sync queue reliability
- Supabase-ready authentication and backend schema

## Local development

1) Install dependencies

```bash
npm install
```

2) Start app

```bash
npx expo start
```

## Supabase setup

1) Create a Supabase project.
2) Apply SQL migration:
   - `supabase/migrations/20260426_initial_rollquest.sql`
3) Set environment variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Optional legacy/fallback sync endpoint:

```bash
EXPO_PUBLIC_ROLLQUEST_SYNC_URL=...
EXPO_PUBLIC_ROLLQUEST_SYNC_KEY=...
```

Detailed setup notes are in:
- `supabase/README.md`

## Auth behavior

- If Supabase env vars are configured, sign-in uses Supabase email/password.
- If not configured, local sign-in fallback is used for development continuity.

## Verification

```bash
npx tsc --noEmit
npx expo lint
```
