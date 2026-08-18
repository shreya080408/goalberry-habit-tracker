# Goalberry — Habit Tracker App

## Project overview
Goalberry is a habit tracking app built with React 19, TanStack Start/Router/Query, Tailwind CSS 4, shadcn/Radix UI components, and Supabase for backend + auth. Originally built in Lovable (an AI app builder), now developed independently in Claude Code. The app has gone through a full visual redesign (colors, fonts, icons, backgrounds, navigation) since the original Lovable build — this file reflects the current, real state of that redesign, not the original Lovable-era design.

## Design system (current, as of the redesign)

**Colors — alt-palette-strawberry:**
- `alt-palette-strawberry-1` (brown): `#AA6F5D`
- `alt-palette-strawberry-2` (red): `#D25A56`
- `alt-palette-strawberry-3` (rose/coral): `#F58480`
- `alt-palette-strawberry-4` (light green): `#91CE92`
- `alt-palette-strawberry-5` (dark green): `#6C9668`
- `main-dark` (neutral text/dark surfaces, replaces black): `#4B3630`
- `main-light` (neutral base surfaces, replaces white): `#F8ECD3` — went through several iterations (too pink -> too grey -> too brown -> too dull) before landing here; if it's still not confirmed applied, check for stale intermediate values (`#F1D6B6` or `#F5E6CC`) still in the code.
- The original `main-palette-strawberry` colors (from the pre-Phase-7 Lovable build) are fully retired — nothing should reference them anymore.

**Fonts:**
- Headings: **Chivo**, weight 900 (Black), uppercase.
- Body text and stat/progress numbers: **Space Grotesk**.
- Subheadings (small text above main headings, e.g. "everything you track"): **Space Mono**, regular (not italic — italic styling was explicitly removed).
- All three are Google Fonts.

**Icons:**
Heroicons-based, custom-adjusted. Page/nav icons use the solid style; checkmark and plus use the outline style with `strokeWidth={3.5}` and sharp (`strokeLinecap="square"`, `strokeLinejoin="miter"`) rather than rounded ends, to match the app's square-corner visual language.
- Today's Habits: puzzle piece
- All Habits: layers
- Calendar: calendar-days
- Analytics: bar chart
- Settings: gear
- Streaks: fire
- Forward navigation arrow: double chevron
- Checkmark: thick outline, sharp corners
- Plus mark: thick outline, sharp corners

**Shape language:** square/rounded-square corners throughout (not circular) — this predates the redesign and still applies. It's also part of why sharp-edged icons and geometric fonts (rather than rounded ones) were chosen — visual consistency with the boxy card/button shapes.

**Backgrounds:** The background is a two-layer system, not a single image:
1. Base layer: solid `main-dark` fill, covers the full viewport at all times regardless of window size.
2. Content layer: the colorful wavy pattern (green/pink, brown hearts) rendered as an inset panel on top of the base — centered with margin and rounded corners, built with real CSS so it scales correctly at any screen size.
This replaced an earlier static-image approach (pre-composited "framed" background images) that broke on window resize — don't reintroduce flat pre-framed background images as a technique.

**Sidebar:** Full-height panel (not a floating/inset card), `main-dark` background, `main-light` text and icons, uppercase nav labels, slides in as an overlay on top of content rather than pushing/resizing it. Both expanded and collapsed states should have proper internal padding (a past bug had elements sitting flush against edges) and a correctly-anchored collapse/expand toggle (a past bug had it drifting and overlapping the first nav item's label).

**Status note:** the color, font, icon, and background/sidebar changes above have all been sent to Claude Code and implemented, but the most recent rounds (background restructuring, sidebar padding/toggle fixes, final `main-light` value) haven't been visually re-confirmed in the live app yet. Worth a fresh look before treating this section as fully verified.

## Features already built
- **Habit CRUD**: create, edit, delete. Fields: name, optional description (expandable via a "show desc" toggle on the card), days repeated, difficulty (1-5, maps to points), optional end date.
- **Done/Skip**: skipping costs 5x the habit's point value and is blocked if the user doesn't have enough points. Marking done replaces the buttons with a checkmark (tappable to undo).
- **Streaks**: reset if a habit isn't completed by midnight in the user's timezone.
- **Points system**: difficulty level maps to points (level 1 = 10 pts, level 2 = 20 pts, etc., not shown during habit creation).
- **Rewards page**: create custom rewards with a point cost, per-reward progress bar, a "claim" button that enables once affordable, and a "claimed rewards" section showing claim date.
- **Calendar page**: monthly view; tap any day to mark habits done/skip retroactively; mini progress bars per day.
- **Analytics page**: overall + per-habit success rate (ring charts), streaks, weekly/monthly/yearly trend line graphs (togglable, with prev/next navigation), and a setting to include/exclude skips from success rate (default: include).
- **Accounts**: Google sign-in (working), email/password sign-in (was broken, needs investigation or removal), guest mode with the option to sign in later from Settings.
- **Settings page**: view/manage login.

**None of this has been re-verified feature-by-feature since the redesign** — the redesign only touched visuals, not logic, so nothing here should have broken, but it hasn't been explicitly re-tested either.

## Known issues / recurring pain points
- The spacing between form labels and their input fields on the **Create Habit** form was requested multiple times during the original Lovable build and its fix status is unconfirmed — worth checking directly.
- The project has both an npm lockfile and a Bun lockfile. Bun is what the project is actually run with — the npm one is likely a leftover and should probably be removed.

## Outstanding from the original Phase 7 spec (never actually sent to Claude Code)
These were part of the original Lovable-era Phase 7 plan but were superseded by the broader redesign in this file and never actually implemented:
- Copy/text changes: remove "sweet little wins" from the sign-in popup; Calendar subheading -> "Your monthly wins"; Analytics subheading -> "Your progress at a glance"; Rewards subheading -> "Your own source of motivation".
- Calendar page: wider mini progress bars reflecting actual daily completion (solid color); sort habits within a day as completed / incomplete / skipped.
- Analytics page: ring chart filled portion using the same alternating two-color style as the bar charts.
Decide whether these still matter given the redesign, or should be dropped/reconsidered.

## Goal: full independence from Lovable
Still outstanding — this was planned but not yet sent to Claude Code (design work took priority):
- Disconnect the GitHub repo sync in Lovable's project settings.
- Remove the "Edit with Lovable" badge (a DOM element with id `lovable-badge`) — remove the actual injecting code, not just hide with CSS.
- Remove the Lovable-branded loading/preview screen shown before the app loads.
- Migrate Google sign-in off the `@lovable.dev/cloud-auth-js` package onto direct Supabase auth (the project already uses `@supabase/supabase-js` elsewhere). Investigate how the package is actually used before changing anything — plan the migration, don't rip it out abruptly, since it affects real user login.

## Pre-launch checklist (current priorities, in rough order)
1. **RLS security check** — test with two separate accounts and confirm one cannot see or edit the other's data. Highest priority; not just a visual/polish item.
2. **Feature verification pass** — walk through every item in "Features already built" above and confirm each actually works.
3. Finish the Lovable-independence work above.
4. Responsive pass — test mobile/tablet/desktop widths deliberately, given the background system has already broken once on resize.
5. Cleanup — remove the stale npm lockfile, dead code, stray console logs.
6. Edge cases — zero habits, all habits completed, very long habit names/descriptions.
7. Real deployment (Vercel/Netlify) — not urgent, but needed eventually; currently only reachable via temporary `cloudflared` tunnels.
