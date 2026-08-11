# Goalberry: polish pass + accounts and cloud data

Big update in five parts: global look and feel, habit interactions, calendar, analytics, rewards, and finally user accounts with everything saved to the cloud.

## 1. Global look and feel

- New background image (the soft pink/green wave with hearts) becomes the app background everywhere; the new hand-drawn strawberry becomes the app icon everywhere (replaces the pixel icon in sidebar, points badge, empty states, favicon-adjacent uses).
- Page headings: slightly lighter weight, with a solid bottom-left drop shadow in main-light for legibility.
- Italic sub-heading above each title: slightly bolder, sitting on a main-light text background chip.
- One shared shadow style app-wide: solid, bottom-left, no blur. Habit cards use their difficulty colour; calendar/analytics/rewards cards use main-palette-strawberry-2.
- Top-right cluster on every page: streak counter (flame + overall streak) to the left of the points counter.
- Bottom icon navigation bar on mobile/tablet only (sidebar stays for desktop): Today, All Habits, Calendar, Analytics, Rewards, Settings.
- All progress bars and rings: empty portion main-palette-strawberry-1, filled portion main-palette-strawberry-5. Ring fill uses straight (butt) caps, not rounded.
- Fluid transitions and subtle animations: page fade/slide-in, card hover lift, animated bar/ring fills, dialog easing.
- Success-rate percentage text next to bars reverts to Raleway (not serif italic).

## 2. Habits

- Skip is only allowed when the current points balance covers the skip cost; otherwise a popup: "Not enough points to skip!".
- After skipping, the Done button is disabled. After marking done, the Done button is replaced by a check-mark icon in the same colour and Skip is disabled; tapping the check unmarks it and re-enables Skip.
- Habit form gains **description** and **end date (optional)** (in-app calendar picker). Field order and styling: `Name:`, `Desc (optional):`, `Repeat on:`, `Difficulty:`, `End date (optional):` — each label underlined, with a colon, and more spacing above its input.
- Difficulty picker: selected star is rendered larger instead of getting an outline box.
- Habit cards with a description show a "show desc" toggle that expands the text directly under the name.

## 3. Calendar page

- Smaller month grid; sub-heading text becomes "Your month at a glance".
- A habit only appears on days on/after its creation date and on/before its end date.
- Past incomplete habits can be marked Done or Skip from the day card, updating analytics and points.
- Day card heading is centred. Both cards get the strawberry-2 bottom-left shadow.

## 4. Analytics page

- Arrow controls to step to the previous/next week, month, or year on the line graph.
- Line colour main-palette-strawberry-5, thicker stroke.
- Rings: straight edges on the filled arc, strawberry-1 track.
- Every card gets the strawberry-2 bottom-left shadow.

## 5. Rewards page

- Claim button on each reward, enabled only when the balance covers its cost; tapping asks for confirmation.
- On claim: points deducted, reward moves to a "Claimed rewards" section showing the claim date.
- Cards get the strawberry-2 bottom-left shadow.

## 6. Accounts and cloud storage

- Enable the built-in backend and add email/password signup and login plus Sign in with Google.
- Auth page at `/auth`; the app requires sign-in, with habits, completions, skips, rewards, claims and the analytics preference all stored per user in the database (replacing localStorage). Existing local data on the device is offered as a one-time import after first login.
- New `/settings` page: account email, provider, sign-out, and the analytics "include skips" preference.
- Access control: every table has row-level security scoped to the signed-in user for select/insert/update/delete, with no anonymous access and no client-supplied user id (ownership is taken from the session). Points balance and skip/claim affordability are enforced server-side so they cannot be bypassed from the browser, and the policies get a review pass afterwards.

## Technical notes

- Tables: `habits` (with `description`, `end_date`), `habit_events` (date + done/skip), `rewards`, `reward_claims`, `profiles`/settings. Grants for `authenticated` only; RLS policies keyed on `auth.uid() = user_id`.
- Points balance derived from events and claims via a server-side function; skip and claim actions run through authenticated server functions that re-check affordability before writing.
- `src/lib/habits.ts` and `src/lib/rewards.ts` move from localStorage hooks to query-backed hooks; scheduling helpers gain creation/end-date bounds.
- Shared `shadow-solid` utility and design tokens added in `src/styles.css`; new `BottomNav` and `TopStats` components; both uploaded images uploaded as CDN assets (`main-bg-strawberry-3`, `main-icon-strawberry-3`).
