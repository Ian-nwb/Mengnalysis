import { IconName } from './components/Icon';

// "How to use Tori" topic guides (Settings → Help).
export const GUIDES: { id: string; icon: IconName; title: string; body: string[] }[] = [
  {
    id: 'dose',
    icon: 'coffee',
    title: 'How daily doses work',
    body: [
      'Each day, tap Start on Home. You get a quick warm-up from earlier lessons, then one new lesson.',
      'You can do up to 2 new lessons a day. After that, Practice rounds keep things fresh while the next lesson waits for tomorrow.',
      'If you miss too many questions in a lesson, we practice the tricky ones again before moving on. That way everything sticks.',
    ],
  },
  {
    id: 'streak',
    icon: 'flame',
    title: 'Streaks and freezes',
    body: [
      'Finish any lesson or review each day to grow your streak.',
      'You get one free streak freeze every week. If you miss a single day, the freeze saves your streak automatically.',
    ],
  },
  {
    id: 'lite',
    icon: 'bolt',
    title: 'Lite days',
    body: ['Tired or busy? Tap Lite day on Home. It\'s a 2-minute review that still counts for your streak, with no new lesson.'],
  },
  {
    id: 'sql',
    icon: 'database',
    title: 'The SQL editor',
    body: [
      'Type your query in the big box, or tap the word buttons to insert keywords, table names and column names.',
      'Press Run to see your results, one row at a time. Use "Delete last word" to fix slips.',
      'Hint gives you a nudge. If you\'re stuck, "Show me the answer" appears after a try.',
    ],
  },
  {
    id: 'listen',
    icon: 'speaker',
    title: 'Listen mode and charts',
    body: [
      'Tap Listen on any screen to hear it read aloud. Charts have their own Listen button that reads every value.',
      'In Settings you can turn on auto-reading, change the voice, and change the reading speed.',
    ],
  },
  {
    id: 'bugs',
    icon: 'bug',
    title: 'The Bug Book',
    body: [
      'Every question you get wrong is saved in your Bug Book.',
      'About a week later it comes back in your warm-up. Get it right and it\'s squashed. You can also practice them any time.',
    ],
  },
  {
    id: 'sheets',
    icon: 'sheet',
    title: 'Cheat sheets',
    body: ['Beat a stage\'s boss level to unlock its one-page cheat sheet. Open it any time, listen to it, or save it as a PDF.'],
  },
  {
    id: 'meng',
    icon: 'fish',
    title: "Meng's corner",
    body: [
      'Lessons earn treats: +2 for a new lesson, +1 for a replay or review, +5 for a boss level, +3 for a level-up, and +5 at streak milestones.',
      "Spend them on food and toys in Meng's corner. Petting Meng is always free. Meng gets a little peckish over time, but never sad. Visit whenever you like.",
    ],
  },
  {
    id: 'focus',
    icon: 'bulb',
    title: 'Focus topics',
    body: [
      'Tori notices which lessons are trickiest for you. Those topics show up a little more often in warm-ups.',
      'When one is ready for extra practice, a Focus topic card appears on Home with a quick practice round.',
    ],
  },
  {
    id: 'formulas',
    icon: 'sheet',
    title: 'Spreadsheet practice',
    body: [
      'Some lessons show a small spreadsheet, one row per card. Type a formula in the box, or tap buttons to insert functions, ranges and symbols.',
      'Press Check formula to see the result. Not right yet? Adjust and check again. Hints are always there.',
    ],
  },
  {
    id: 'backup',
    icon: 'shield',
    title: 'Backups',
    body: [
      'In Settings, tap "Save a backup" and store the code somewhere safe, like Google Drive or an email to yourself.',
      'On a new phone, paste the code into Settings to get all your progress back.',
    ],
  },
];
