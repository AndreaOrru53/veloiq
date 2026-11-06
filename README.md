# VELOIQ — Cycling companion web app

Starter MVP built with Next.js App Router, TypeScript, Tailwind CSS, Supabase-ready schema and MapLibre dependency.

## Run locally
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env.local` and add Supabase project credentials (optional for the current demo UI).
4. `npm run dev`
5. Open http://localhost:3000

## Included in this MVP
- Responsive dashboard and navigation
- Route planning inputs (distance, elevation, road/MTB, level) with estimated ride metrics
- Weather advice simulator (temperature, wind and rain controls)
- Bike component maintenance tracker (demo state)
- Nutrition and hydration estimates
- Training coach configuration screen with a sample weekly structure
- Initial Supabase SQL schema and row-level security policies

## Important: current boundaries
This is a runnable MVP foundation, not yet a production-ready cycling service. The UI clearly marks demo data. It does not yet generate navigable GPX routes, fetch live weather, persist user data, sync GPS/head-unit files, or generate adaptive training plans. Those require provider integration, authentication, data validation and testing.

## Recommended implementation sequence
1. Supabase project: apply `supabase/schema.sql`, configure Auth and environment variables.
2. Weather: call Open-Meteo from a server route using the selected ride location and forecast time.
3. Routing: integrate a routing engine (e.g. GraphHopper or openrouteservice) with cycling profiles; build GPX export and elevation profile.
4. Ride data: manual entry and FIT/GPX/TCX import; later Strava/Garmin integrations subject to their API terms.
5. Coach: implement training zones and load metrics from validated ride data; only then add an AI explanation layer.
6. Billing: Stripe subscriptions, server-side entitlement checks and webhook verification.
7. Production: privacy policy, GDPR consent/export/delete, security review, monitoring and automated tests.

## Safety and accuracy
Nutrition, hydration, weather and maintenance values are estimates, not medical or mechanical guarantees. Training recommendations should be validated against user history and recovery status. Component service intervals must be configurable and follow manufacturer guidance.
