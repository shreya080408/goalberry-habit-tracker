# Goalberry: finish the missed changes + premium refresh

## Why things were missed last time

The last turn was spent on foundations: the strawberry palette/shadow/animation tokens, the new icon and background assets, moving all data from device storage to the cloud database (tables, access rules, points/skip/claim logic), and building accounts (`/auth`, the signed-in gate, `/settings`, the one-time device import). That used up the whole turn, so the page-level work — Today, Calendar, Analytics, Rewards behaviour — never got rewritten to use the new pieces. Nothing was intentionally dropped; the pages simply still contain the older versions. Confirmed by reading them: Today still has plain Done/Skip buttons with no point gate, no check-mark toggle and no description toggle; Rewards has no claim flow; Analytics rings still use rounded arc ends and the graph has no prev/next arrows; the streak counter component was built but never placed in the header.

## 1. Visual direction: modern and premium, still cute

- Remove the bouncy/overshoot motion everywhere (`bouncy`, `bouncy-press`, `bounce-pop`, `pop-in`). Replace with restrained Dailybean-style motion: short opacity/translate fades (150-200ms, ease-out), gentle press feedback (subtle opacity/scale 0.99), no springs.
- Soften surfaces: rounded cards, generous padding, thin borders, a soft layered shadow for general cards. Keep the solid bottom-left colour shadow only where it was explicitly asked for (habit cards by difficulty; calendar/analytics/rewards cards in strawberry-2).
- Tighter, calmer type scale and more whitespace; keep LEMON MILK headings, Manrope/Raleway body, Lora serif italic sub-headings.
- Strawberry icon: regenerate the asset with a genuinely transparent background (the current PNG carries a dark matte) and swap it in everywhere.
- Backgrounds: the three uploaded images become mobile / tablet / desktop backgrounds, selected by breakpoint, fixed and cover-fitted, used on every page including `/auth`.

## 2. Today's Habits (still outstanding)

- Skip only when the balance covers the cost; otherwise a "Not enough points to skip!" popup.
- After a skip, Done is disabled. After Done, the button becomes a check-mark icon in the same colour and Skip is disabled; tapping the check unmarks and re-enables Skip.
- "show desc" toggle on cards that have a description, expanding under the name.
- One shadow per card: solid, bottom-left, in the habit's difficulty colour.
- Success-rate percentage next to the bar in Raleway (not serif italic).
- Streak counter (flame + overall streak) placed left of the points counter, fixed top-right on every page.

## 3. Habit form

Verify and finish: `Name:`, `Desc (optional):`, `Repeat on:`, `Difficulty:`, `End date (optional):` — underlined labels with colons, extra spacing above each input, in-app date picker, selected difficulty star rendered larger with no outline box.

## 4. Calendar

Smaller month grid; "Your month at a glance"; habits shown only between start and end date; past incomplete habits markable Done/Skip with analytics and points updating; centred day-card heading; strawberry-2 solid shadow on both cards.

## 5. Analytics

Prev/next arrows for week, month and year graphs; line in strawberry-5 and thicker; rings with straight (butt) arc ends, strawberry-1 track and strawberry-5 fill; strawberry-2 solid shadow on every card; overall + per-habit streaks; include-skips preference surfaced on Settings.

## 6. Rewards

Claim button per reward, enabled only when affordable, with a confirmation popup; on claim the points deduct and the reward moves to a "Claimed rewards" section showing the claim date; strawberry-2 shadow on cards.

## 7. Accounts

- **Continue without an account** on the sign-in screen: guest mode stores habits, rewards and preferences on the device and the whole app is usable. Settings shows a "Sign in to sync" panel.
- When a guest later signs in, their device data is uploaded into the new account automatically (no prompt).
- Sessions persist across app closes, so a signed-in user is not asked to sign in again.
- **Email sign-in fix:** the cause is that email sign-up sends a confirmation link and the account cannot sign in until it is clicked — so attempts fail with "Email not confirmed" while Google (already verified) works. Keeping confirmation, the sign-up screen will show an explicit "Check your inbox to confirm" state with a resend button, and sign-in will surface the unconfirmed-email error with a resend action instead of a generic failure. Branded confirmation emails are set up if an email domain is available.

## Technical notes

- Data layer (`src/lib/habits.ts`, `rewards.ts`, `profile.ts`) gains a guest adapter: when there is no session, read/write device storage through the same hooks; points/skip/claim affordability computed locally in that mode and still enforced server-side when signed in.
- Signed-in gate allows a guest flag, so pages render without a session; server calls are only made when a session exists.
- Motion utilities in `src/styles.css` replaced with `fade-in`/`press` equivalents; `shadow-soft` added alongside the existing `shadow-solid`.
- Three background images uploaded as CDN assets and wired into a responsive background utility.
