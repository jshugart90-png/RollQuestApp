# RollQuest Supabase Setup

## 1) Create project
- Create a Supabase project in the dashboard.
- Copy:
  - `Project URL`
  - `anon public key`

## 2) Apply schema
Run the SQL in:
- `supabase/migrations/20260426_initial_rollquest.sql`

You can paste into Supabase SQL editor, or use Supabase CLI migrations.

## 3) App env vars
Set these in your Expo environment:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Optional legacy/fallback:
- `EXPO_PUBLIC_ROLLQUEST_SYNC_URL`
- `EXPO_PUBLIC_ROLLQUEST_SYNC_KEY`

## 4) Auth providers
Enable Email + Password in Supabase Auth.

## 5) First roles
By default, new users are inserted into `public.user_profiles` as `student`.
Promote coaches/owners by updating `role` in that table.

## Notes
- Existing local stores continue to work.
- Sync queue will write to `public.sync_events` when Supabase is configured.
- RLS policies enforce gym-scoped reads/writes based on membership in `public.user_gym_memberships`.
