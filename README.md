# Leg Block — Training Tracker

Personal tracker for the current lower-body program: set-by-set lift logging
(with bar velocity on back squat), CMJ force-plate metrics, body measurements,
session ratings, Olympic lift technical scores, deload AMRAP tests, and a
computed readiness flag.

## 1. Create a fresh Supabase project

1. Go to supabase.com → New project. Pick any name/region, set a database password (you won't need it day-to-day).
2. Once it's up, open the **SQL Editor** and paste in the contents of `schema.sql` from this folder. Run it. This creates five tables (`lift_entries`, `cmj_entries`, `body_entries`, `session_ratings`, `technical_ratings`) with row-level security policies open for a single-user personal app.
3. Go to **Project Settings → API**. Copy the **Project URL** and the **anon public key**.

## 2. Configure the app

1. Copy `config.example.js` to `config.js`.
2. Paste your Project URL and anon key into `config.js`.
3. `config.js` is in `.gitignore` so your keys don't get committed by habit — though for this anon-key/RLS-open setup there's nothing secret in it beyond "don't want it publicly indexed." If you want the repo fully public with no fuss, you can remove it from `.gitignore` and commit it.

## 3. Deploy to GitHub Pages

1. Create a new GitHub repo, push this folder to it (including `config.js`).
2. Repo → **Settings → Pages** → Source: deploy from branch → `main` / root.
3. Your app will be live at `https://<username>.github.io/<repo>/` within a minute or two.

## Add it to your iOS home screen

Once it's deployed on GitHub Pages (step 3 above — this only works over https, not from a local file):

1. Open the site in **Safari** on your iPhone (has to be Safari, not Chrome — Chrome on iOS can't add fullscreen home-screen apps).
2. Tap the **Share** icon → **Add to Home Screen**.
3. It'll sit on your home screen with the "LB" icon and open fullscreen, no address bar — logging a set mid-session is then a normal app tap away rather than digging up a browser tab.

If you update the code later, changes show up next time you open it — no reinstall needed, since it's just loading the same URL.

## Using it

- **Log** tab: log each set as you go (day → exercise → set details). Two checkboxes only appear for Back Squat:
  - **Velocity check single (pre-sets)** — tick this for your GymAware reference-load single before your working sets. Defaults to Set # 0, 120kg, 1 rep on tick (all editable) — this is what feeds both the velocity chart and the readiness flag, kept deliberately separate from your working sets so the trend reflects fatigue, not just the fact that your working load is climbing week to week.
  - **Deload AMRAP test set** — for the max-effort test at the end of each deload week.

  Same-day extras (Olympic lift technical score, session soreness/difficulty) are logged once per session, separately from individual sets.
- **CMJ** tab: enter whatever your force plate gives you for that test — only concentric impulse is required, everything else is optional. Start this from week 3 as planned.
- **Body** tab: weight/waist/thigh, log as often as you like.
- **Dashboard** tab: working-load trend, a separate velocity-check trend (velocity + reference load), CMJ metrics, body metrics, session ratings, technical scores, and a history of deload AMRAP tests with an estimated 1RM (Epley) for each. The readiness banner at the top surfaces a green/amber/red flag — see below.

## How the readiness flag works

It only evaluates on dates where you have both a **velocity-check reading** and (from week 3 on) a **CMJ** entry — which, by the program's own structure, is Sunday and Thursday. Three signals are checked, each against your own rolling baseline (last 6 sessions), not a fixed population number:

1. Velocity-check reading down more than 10% from your rolling average
2. CMJ jump height down more than 10% from your rolling average
3. Same-day soreness or difficulty rating at 7/10 or higher

**Green** — fewer than 2 signals triggered.
**Amber** — 2+ signals triggered on a session.
**Red** — either all available signals triggered at once, or an amber flag persists for 3 consecutive Sun/Thu sessions.

It needs at least 4 prior data points before it starts flagging on velocity or CMJ (so no false alarms in week 1), and shows "gathering baseline" until then.

You can retune the 10%/7-out-of-10/consecutive-session thresholds directly in `app.js` (`renderReadiness` function) once you've seen how it behaves against your own noise.

## Notes

- Estimated 1RM in the deload test table uses the Epley formula (`load × (1 + reps/30)`) — a rough guide, not gospel, especially past ~8 reps.
- Nothing here is authenticated. Anyone with the URL and anon key could write to your tables. Fine for a personal tool; add Supabase Auth later if that ever matters to you.
