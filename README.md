<p align="center">
  <img src="assets/icon.png" alt="Meng the calico cat" width="140" />
</p>

<h1 align="center">Tori</h1>

<p align="center">
  A daily habit app that takes you from <b>zero to job-ready data analyst</b>, a few minutes at a time,<br/>
  guided by <b>Meng</b>, a calico cat with a love for clean data and Trisha. Currently in development will add better design and new features 
</p>

<p align="center">
  <a href="https://github.com/Ian-nwb/Mengnalysis/releases/latest"><b>⬇ Download the latest APK</b></a>
</p>

---

## What it is

Tori is an offline Android app built around one idea: **a small dose of data skills every day beats cramming**. Each visit takes 5–10 minutes. There's a quick warm-up from earlier lessons, then one new lesson, then a reward. Over several months it covers everything from "what is a row?" to SQL window functions, dashboards and job interviews.

## Features

**Learning**
- **309 lessons in 15 stages**: short, friendly, one concept per lesson
- **Duolingo-style games:** match the pairs, build answers from word tiles, true/false, sort into groups, find the bug, odd one out and tap the chart, plus a **Game arcade** and a glossary term-match game
- **Real practice, not just quizzes**
  - **SQL sandbox:** write real queries against built-in datasets, checked by comparing results
  - **Spreadsheet sandbox:** type real formulas (SUM, IF, SUMIFS, XLOOKUP, …) into a practice sheet, checked by a built-in formula engine
- **Mastery gate:** miss too many questions and you practice the tricky ones again before moving on
- **Bug Book:** every mistake is saved and comes back about a week later until it's squashed
- **Adaptive review:** weak topics show up more often, and Home suggests a *Focus topic*
- **Boss levels** end every stage with a real-world case, plus an *"Explain it like I'm your boss"* summary
- **Learn tab:** re-read every finished lesson as notes, study guides for each stage, quick reference (Excel/Sheets, SQL, pandas, DAX, shortcuts), a 220-term glossary and free resources
- **Cheat sheets:** a one-page summary unlocks for each stage, and you can save it as a PDF

**Habit & fun**
- A winding, game-style **path** with lesson nodes, practice stars, boss crowns and cheat-sheet chests
- **Notes from Meng:** daily reminders in Meng's voice, an optional second reminder and evening streak saver, days off, and tap-to-open
- Bottom tabs: **Today · Path · Learn · Meng · Cats · Me**
- **Study music:** three original background tracks that soften while lessons are read aloud, plus a cozy loading screen
- Daily streaks with a weekly streak freeze, and **Lite days** (2-minute review) for busy days
- Max two new lessons a day, so the journey stays a steady habit
- XP and level titles (*Data Curious → Spreadsheet Sorcerer → … → Analyst*)
- **Meng's home:** a little virtual pet with a Living room, Kitchen and Bedroom. Rub Meng to pet her, slide snacks up to her, play with toys (fling the yarn ball, wave the feather, chase the mouse, watch her scratch the box), tuck her in for naps. Unlock more cats (Tuxedo, Orangina, Whitey and Dost) as you learn and pick who keeps you company. She watches your snack, opens her mouth, squishes, yawns, stretches, gets dizzy and giggles. Treats come from learning
- A game-style first launch, a replayable tour, help guides and one-time tips
- Gentle animations, sound effects and haptics

**Comfort**
- Big text with an in-app size control; dark, light or follow-your-phone themes; bolder outlines
- A full settings page: name, daily goal (1–3 lessons), reminder at any time, sounds, meows, vibration, animations, backups, export and reset
- **Listen mode:** every lesson, question and chart can be read aloud, with a choice of voices
- One clear column per screen, large buttons, and nothing that disappears on a timer

## Curriculum

| # | Stage | Highlights |
|---|---|---|
| 0 | Data Foundations | File types, CSV pitfalls, granularity, primary & foreign keys, PII |
| 1 | Thinking in Data | The analysis process, good questions, metric trees, vanity vs. actionable metrics |
| 2 | Google Sheets & Excel | Formulas, lookups, pivots, Formula Lab, QUERY, Power Query, Apps Script |
| 3 | Statistics | Mean/median, spread, distributions, A/B tests, bias, significance |
| 4 | SQL | SELECT → JOINs → window functions, messy real-world SQL, cohorts, SQL++ |
| 5 | Charts & Stories | Choosing charts, honest design, SCQA storytelling |
| 6 | Python | pandas, cleaning, groupby, reshaping, APIs & JSON |
| 7 | Modern Data Stack | ELT, cloud warehouses, dbt, data tests, semantic layers |
| 8 | Dashboards & BI | KPIs, data models, Power BI & DAX, Looker Studio, Tableau |
| 9 | AI-Assisted Analytics | Prompting for SQL/Python, catching hallucinations, data privacy |
| 10 | Business Analytics | Funnels, CAC & LTV, churn, RFM, forecasting, root-cause analysis |
| 11 | Industry Workflows | Parquet, DuckDB/Polars, Git & PRs, observability, lineage, GA4 & UTMs |
| 12 | Industry Packs | Marketing, finance, e-commerce, SaaS, people analytics, operations |
| 13 | Real-World Projects | Café review, subscription health, marketing budget, music insights, your portfolio piece |
| 14 | Career | Portfolio, resume, LinkedIn, interviews, offers, first 90 days |

## Install

1. Download `Tori.apk` from the [latest release](https://github.com/Ian-nwb/Mengnalysis/releases/latest) on an Android phone.
2. Open it and allow installs from that source when Android asks.

Everything runs offline. There are no accounts and no tracking. Progress stays on the phone, and you can back it up with a code from Settings.

## Development

**Stack:** Expo (React Native) + TypeScript · `expo-sqlite` (SQL sandbox) · `react-native-svg` (charts, icons, Meng) · `expo-speech` · `expo-audio` · `expo-notifications`

```bash
npm install
npx expo start          # run on a phone with Expo Go or a dev build
npm run check           # type check + validate all lesson content
```

### Build an APK locally

Requires the Android SDK and JDK 17.

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

Or in the cloud: `eas build -p android --profile preview`.

### Project structure

```
src/
  App.tsx            routes, fonts, lesson completion (XP, streaks, treats)
  engine.ts          streaks, levels, spaced review, mastery, Bug Book, adaptive review
  state.tsx          saved progress and settings
  components/        UI kit, Meng, questions, SQL and spreadsheet sandboxes
  screens/           Home, lessons, path, rewards, Meng's corner, Bug Book, cheat sheets, settings
  content/           all lessons (stageN.ts + extra/), cheat sheets, stage list
  sheet/formula.ts   the spreadsheet formula engine
  sql/               sandbox datasets and query runner
scripts/
  check-content.ts   content validator (`npm run check`)
assets/              icon, splash, sound effects
```

### Adding lessons

Lessons are plain TypeScript data. The helpers in `src/content/build.ts` keep them short:

```ts
L('s2w1', 2, 'Formula lab: your first formulas', 5, [
  ex('Hands on!', 'Time to type real formulas…'),
  sheet('Find the total of all prices.', SALES, '=SUM(C2:C6)', 'Use SUM.', 'SUM adds up the range.'),
  mc('Which shows the biggest value?', ['=MAX(C2:C6)', '=MIN(C2:C6)', '=TOP(C2:C6)'], 'MAX finds the largest.'),
], [rc('Total a range with…', ['=SUM(C2:C6)', '=ADD(C2:C6)'])]);
```

- Write the correct option **first**; the app shuffles options.
- **Never change an existing lesson id**, because progress is saved by id.
- Each stage has exactly one lesson with "Boss" in its title, ending in a `reflect` step, plus a cheat sheet in `cheatsheets.ts`.
- Run `npm run check` afterwards. It validates ids, stages, options, every spreadsheet formula and every SQL answer.

## Roadmap

See [PLAN.md](PLAN.md): over-the-air lesson updates, a Python sandbox, Meng's closet, weekly recaps, a home-screen widget, a portfolio builder and more.

---

<p align="center">Made with love for Tori 💜🐾</p>
