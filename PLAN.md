# Tori: Plan

## Where we are (v2, built 2026-11-23)
An Android app (`Tori.apk`) that teaches data analysis from zero to job-ready as a 5–10 minute daily habit, guided by **Meng**, a calico cat drawn after the real Meng.

- **Curriculum:** 232 lessons in 13 stages (0 Data Foundations → 12 Career). Each stage ends in a boss level with an "Explain it like I'm your boss" box, and beating it unlocks a cheat sheet (PDF).
- **Daily loop:** warm-up review → one new lesson (max 2 a day) → reward. Lite days, weekly streak freeze, XP and levels.
- **Learning:** mastery gate (more than 30% missed → retry the missed ones), Bug Book (mistakes return after 7 days), spaced review, real SQL sandbox + playground.
- **Feel:** animations, sound effects, male Listen voice, Meng reactions, game-style first launch and replayable tour, help guides.
- **Style rules:** magnifier-friendly, large text, `#E5A2F2` + plum.

---

## Phase 3: Verify & harden (do first)
Nothing new matters until the current build feels great on her phone.

1. **On-device pass:** every screen at the largest font, with the magnifier on, in dark and light themes. Fix clipping, overlaps and anything that needs side-panning.
2. **TalkBack pass:** labels and order on every screen, the SQL editor and charts.
3. **Release signing key:** create a real keystore and **back it up** (Drive + USB). Without it, future updates can't install over the old app, and she'd have to uninstall and lose progress.
4. **Over-the-air updates (EAS Update):** push new lessons and fixes without reinstalling an APK. This is the biggest quality-of-life upgrade for future expansion.
5. **Automatic backup:** save progress to a file in her Google Drive (or local Downloads) weekly, on top of the manual backup code.
6. **Crash safety:** an error screen with Meng ("Oops, let's go home") instead of a blank screen, plus a hidden "copy error details" button for debugging.
7. **Content checker in the repo:** move the lesson validator into `scripts/check-content.ts` + `npm run check`. It checks duplicate ids and options, that each stage has one boss, reflect steps and cheat sheets, and runs every SQL answer against the datasets.

## Phase 4: Hands-on practice (the biggest learning win)
Today most practice is multiple choice. Real skill comes from doing.

1. **Spreadsheet sandbox:** a small grid (one row card at a time on a phone) where she types real formulas (SUM, IF, XLOOKUP, SUMIFS) and they are evaluated and checked. (Pick a formula engine with a license that allows this; avoid GPL/commercial-only ones.)
2. **Python sandbox:** run real pandas in the app with Pyodide in a WebView (offline after the first load), with "write the line" exercises checked by output.
3. **Fill-in-the-query steps:** SQL with blanks (`SELECT ___ FROM sales`) as a gentler step between multiple choice and a blank editor.
4. **Weekly mini-projects:** a Saturday "case file" of 3–5 connected tasks on one dataset, ending in a reflect summary.
5. **More datasets:** pets adoption, movies, weather, a small e-commerce store with real dates, a support-ticket set for text classification.
6. **Adaptive review:** track mastery per topic (SQL joins, IF formulas, charts…). Weak topics show up more often in warm-ups, and Home shows a "focus topic" card.

## Phase 5: Motivation & delight
1. **Meng's closet:** unlockable accessories for milestones (stage badges, 30/100-day streaks): bow, glasses, graduation cap, headphones. Equip in Settings.
2. **Weekly recap screen** (Sunday): lessons done, XP, streak, the Bug Book squashed, Meng's note.
3. **Android home-screen widget:** streak flame + "today's dose done?" with Meng's face.
4. **Puzzle of the Day:** one optional data riddle (chart reading, spot the error, quick SQL).
5. **Achievements page:** collectible badges (first JOIN, 10 Bug Book squashes, first PDF cheat sheet…).
6. **Seasonal themes:** small Meng outfits and holiday puzzle sets.
7. **More Meng animation:** blink, tail swish on tap, happy hop on level-up (all respecting "Remove animations").

## Phase 6: Career bridge
1. **Portfolio builder:** the boss reflections + mini-projects become a portfolio checklist with ready-to-adapt project write-ups (question → method → finding → recommendation).
2. **Guided real projects:** 3 step-by-step projects on public datasets (Google Sheets, SQL in BigQuery sandbox, Looker Studio/Tableau Public dashboard), with checklists she ticks off outside the app.
3. **Interview practice mode:** spaced practice of SQL, stats, Excel and behavioral (STAR) questions; record answers by voice and compare with a model answer.
4. **Resume bullet helper:** turns completed projects into "action + tool + result" bullets.
5. **Job search tracker:** simple list of applications and stages, with Meng cheering every application.
6. **Certificate prep tracks:** optional paths aligned with Google Data Analytics and Microsoft PL-300 topics.

## Phase 7: Content expansion (ongoing, via OTA updates)
- **Deeper existing stages:** Excel Power Query & Power Pivot, Sheets Apps Script projects, advanced SQL (recursive CTEs, gaps & islands, sessionization), statistics (regression, A/B test sample sizes), Python (seaborn/matplotlib charts, functions & modules), Power BI DAX patterns.
- **New tracks:** data storytelling with real presentations, data ethics & bias case studies, domain packs (marketing, finance, healthcare ops, e-commerce, SaaS), Looker/LookML basics, dbt hands-on.
- **Refresh yearly:** tools and AI features change fast. Review Stages 7, 9 and 11 every 6–12 months.
- Keep the rules: lesson ids never change, one boss per stage, every boss has a reflect step and a cheat sheet, and the content check passes.

## Done in v3 (2026-11-23)
- Phase 4.1 spreadsheet sandbox (own formula engine, Formula Lab lessons) · Phase 4.6 adaptive review (focus topic + weak-topic warm-up cards)
- Phase 7 content: deeper Excel (Power Query, Data Model, LET/LAMBDA, Goal Seek, pivot power-ups), SQL++ (LAG/LEAD, % of total, NTILE, UNION, EXISTS, gaps & islands, recursive CTEs), deeper Power BI (relationships, DAX patterns, visuals, Service), Stage 12 Industry Packs (marketing, finance, e-commerce, SaaS, people, operations, healthcare). Career is now Stage 13
- Meng's corner: earn treats by learning, feed food and toys, pet Meng
- Content checker: `npm run check` (Phase 3.7)

## v4 (built 2026-11-23): Meng notifications, full settings, journey path, loading screen
**Done:** A1–A5 (Meng-branded notes with her icon, 30+ messages, second reminder, streak saver, unlocked/Bug Book/comeback wording, tap-to-open, days off, test button), B (all sections except avatar picker & auto weekly backup & lesson-length), C1–C7 (winding trail, node types, states, stage banners, inline node card, jump-to-current, bottom tabs) except C8 milestone markers, D (loading screen + error screen). Plus a Library tab: lesson notes for every finished lesson + a 200-term glossary. Version 1.1.0.

### Original v4 notes

### A. Notifications from Meng
Today: one daily reminder at a chosen time (4 presets), titled "Tori", with 7 rotating messages, scheduled 14 days ahead. It works, but it's generic.
1. **Meng is the sender:** title "Meng 🐾", Meng's face as the notification icon (white silhouette for the status bar, color image in the notification), and a lavender accent color.
2. **Messages in Meng's voice** (30+, rotating, never guilt-tripping): "Mrrp! Your daily dose is ready ☕", "I saved you a spot on the path 🐾", "Your streak is purring. One lesson keeps it warm 🔥", "My tummy says treat time… and lessons earn treats 🐟".
3. **Smart reminders:**
   - Skip today's reminder once the dose is done (already done)
   - Evening "streak saver" (optional) if today isn't done by 8pm
   - "Lesson unlocked" morning note after a day she hit the daily limit
   - Celebration notes: streak milestones, new level, new stage unlocked, Bug Book items ready
   - Weekly recap ping on Sunday
   - Gentle comeback note after 2+ days away ("No pressure! I'll be here whenever you're ready")
4. **Tap to open the right screen:** reminder → Today's dose; Bug Book note → Bug Book; Meng note → Meng's corner.
5. **Quiet hours** and **days off** (e.g. no reminders on Sundays).

### B. Settings like a real app
Grouped sections, each a large card, with a search-free, scroll-friendly layout:
- **Profile:** name shown in greetings (default Tori), Meng's name, avatar (pick a Meng pose)
- **Learning:** daily goal (1, 2 or 3 new lessons), lesson length preference, auto-advance after correct answers (off by default), show hints automatically, retry threshold (gentle / standard)
- **Notifications:** master on/off, custom time picker (any hour and minute), second reminder, streak saver, celebrations, weekly recap, quiet hours, days off, test notification button
- **Sound & voice:** sound effects on/off + volume, Meng meows on/off, voice picker, reading speed, read lessons aloud automatically
- **Display:** text size, theme (dark / light / follow phone), bolder outlines, animations (full / reduced / off), haptics on/off
- **Data:** back up now, restore, automatic weekly backup, export my reflections (text file), reset Bug Book, reset all progress (double-confirm)
- **Help & about:** replay tour, guides, what's new (changelog), app version, "Made for Tori 💜", send feedback

### C. Journey path (Duolingo-style)
Replace the list with a playful winding path, but keep it comfortable to read up close:
1. **Winding trail:** big round lesson nodes (72dp+) that sway gently left and right along a single centered column (small offsets only, so there's no sideways panning), joined by a dotted trail.
2. **Node types with distinct shapes and icons**, not just color: lesson (circle), practice/review (star), boss (crown, larger), cheat-sheet chest (treasure box), Meng's treat stop (fish bowl).
3. **States:** done (filled lavender + check), current (pulsing ring + "START" bubble + Meng sitting next to it), unlocks tomorrow (moon), locked (padlock). Each has a text label.
4. **Stage banners:** a colorful header card per stage (stage number, title, progress, "Cheat sheet" button), with a different illustration tint per stage.
5. **Tap a node** → a bottom card (not a tiny popup) with the lesson title, minutes, accuracy so far and big Start / Replay buttons.
6. **Jump to current** floating button. The path opens scrolled to her current lesson.
7. **Path becomes the main tab:** bottom navigation with 4 big tabs: Path · Practice (Bug Book, focus, lite day) · Meng · Profile/Settings.
8. **Milestone markers along the trail:** "Halfway through SQL!", level-up flags, streak trophies.
9. Respect "Remove animations" (no pulse or sway), with every node reachable by TalkBack in order.

### D. A proper loading screen
Today the native splash shows Meng's face, then a blank plum screen while fonts and progress load.
1. **Seamless splash → loader:** the native splash (Meng on plum) hands off to an in-app loading screen that looks identical, so there's no flash or jump.
2. **Animated Meng:** Meng blinks, flicks her tail and pads in place (gentle, centered), with the "Tori" wordmark underneath in Nunito.
3. **Progress feedback:** a lavender paw-print progress bar that fills while fonts, saved progress, sounds and the SQL sandbox warm up.
4. **Rotating tips and fun facts** in big text ("Tip: tap Meng to say hi", "Fun fact: SQL was invented in the 1970s"), with Listen support.
5. **Greeting by time of day** ("Good morning, Tori!") once loading finishes, then a soft fade into Home.
6. **Smart timing:** shows at least ~0.8s (no flicker) and moves on as soon as everything is ready. Static version when "Remove animations" is on.
7. **Friendly error state:** if loading ever fails, Meng says "Oops, let's try that again" with a big Retry button. Progress is never lost.

### Suggested order
1. A1–A4 (Meng notifications) + D (loading screen)
2. C1–C6 (journey path) + C7 bottom tabs
3. B (settings), built on top of the new tabs
4. A5, C8, then polish

## v1.2.0 (2026-11-23)
- Learn tab: lesson notes, 14 study guides, quick reference (5 groups), 200-term glossary, free resources
- Background music: 3 original tracks (Cozy study, Rainy café, Sunny morning), volume, ducking during Listen

## v1.3.0 (2026-11-24)
- Meng's corner rebuilt as a virtual pet: rub to pet, drag-to-feed pantry, toy box, shop; new moods (purr, eat, love, hungry), blinking, breathing, hops, wiggles, floating hearts; purr/chomp/boing sounds
- Rainy café music regenerated (warm brown-noise rain + soft drips instead of hiss); music generator kept in `scripts/make-music.py`

## v1.5.0 (2026-11-27)
- Meng animations: layered, native-driven tail/ears/paws/extras; greets, leans toward food, happy dance, hunger rumble, butterfly chase, dozes off and wakes, love burst after long petting, toy drop-and-pounce
- Meng's home design fixes: solid status band (meters can no longer overlap the help button), room art only below the band, window/shelf moved below the speech bubble, curtains on a rod
- Games: sort, find the bug, odd one out, tap the chart (+ ~23 new rounds in existing lessons) and a Game arcade on Today
- 24 new lessons (stages 0, 7, 9, 10, 11, 12, 13, 14) and 11 glossary terms: 309 lessons, 220 terms

## v1.4.0 (2026-11-27)
- Games: match the pairs, build from word tiles, true/false (mixed into ~35 lessons) + glossary term-match in warm-ups, practice and Learn
- New content: Stage 13 Real-World Projects (5 case studies, Career is now 14), cleaning chapter, Formula Lab 2, sample size & forecasting, SQL practice sets (self joins, GROUP_CONCAT, OFFSET), chart critique, pandas practice. 285 lessons, 209 glossary terms
- Meng's home redesigned Pou-style: one screen, three rooms, top status bar, bottom item bar with drag-or-tap, Shop/Pantry/Help sheets, illustrated rooms
- Meng behaves like a pet: idle routine, eye tracking, anticipation, squish, dizzy, giggle, yawn, walk-in

## Recommended order
1. Phase 3 items 1–4 (test on her phone, signing key, OTA updates)
2. Phase 4 items 1 & 6 (spreadsheet sandbox, adaptive review)
3. Phase 5 items 1 & 2 (Meng's closet, weekly recap)
4. Phase 6 item 1 (portfolio builder)
5. Then alternate: one feature, one content pack per update

## Open questions for the owner
- Does she have a Google account on the phone (for Drive auto-backup and Sheets projects)?
- How many minutes a day does she realistically have? (Tunes the daily limit and lesson length.)
- Any specific industry she wants to work in? (Decides which domain pack to build first.)
