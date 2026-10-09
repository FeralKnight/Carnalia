# Carnalia

Version 0.3.2 restores online rooms using the dedicated Supabase project Carnalia Beta 0.3.0. Recovered from the current production deployment to retain all 102 talents and the existing game engine.

Run `npm run check` and `npm run build`. The build copies only client directories into dist; server modules stay private.

## Server configuration

Set `SUPABASE_URL` to `https://eqnsoogplcrovinhlpvd.supabase.co` and `SUPABASE_SECRET_KEY` to the project's secret API key in Vercel Production and Preview. Do not put the secret key in client code, Git, or a public environment variable. The service-role legacy key is also supported.

The table in `supabase/schema.sql` has RLS enabled and no anonymous or authenticated privileges. Room authentication remains the existing player token, enforced by the server. Updates compare the storage version atomically and return HTTP 409 on conflicts. Expired rooms are removed when a new room is created. Rooms expire six hours after their last saved activity.

Before release verify creation, joining, commands, polling, simultaneous updates and a complete duel against the live backend.
