

# AI Practice Plan Feature

## Overview
Add a "Get My Practice Plan" button below the stat tiles on the Stats page. On tap, it fetches the user's last 5 rounds' hole-level stats from the database, computes averages for FIR%, GIR%, avg putts, and scramble%, then sends them to an AI model via a new edge function. The response is displayed in a styled card with a "TRACKD Caddy 🏌️" header.

**Note on Sand Saves**: The database schema does not track sand saves, so this stat will be omitted from the prompt. The four available stats (FIR%, GIR%, Avg Putts, Scramble%) provide strong coaching signal.

**Note on AI model**: This project has Lovable AI pre-configured (no extra API key needed). I'll use it instead of Anthropic Claude — same quality output, zero setup required.

## Changes

| File | Change |
|------|--------|
| `supabase/functions/practice-plan/index.ts` | **New** — Edge function that receives the computed stats, builds the system/user prompt, calls Lovable AI gateway, and returns the AI response |
| `src/components/PracticePlan.tsx` | **New** — Component with the button, loading state, error handling, and response card with markdown rendering. Fetches last 5 rounds' stats from Supabase on tap, sends to edge function |
| `src/pages/Stats.tsx` | Import and render `<PracticePlan />` below the stat tiles grid |

## How it works

1. User taps "Get My Practice Plan"
2. Component queries the last 5 rounds + their hole_stats directly from Supabase client
3. Computes: FIR% (holes with fir=true / holes with fir not null), GIR%, scramble%, avg putts per round
4. Sends computed averages to the `practice-plan` edge function
5. Edge function calls Lovable AI with the specified system prompt and user message
6. Response streamed back and rendered in a card with "TRACKD Caddy 🏌️" header
7. Error state shows friendly fallback message

The button and card will use the existing `bg-primary`, `bg-card`, and typography styles to match the app's design.

