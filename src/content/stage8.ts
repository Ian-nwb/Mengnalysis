import { Lesson } from './types';

// Stage 8: Career: portfolio, resume, interviews.

export const stage8: Lesson[] = [
  {
    id: 's8l1',
    stage: 14,
    title: 'Your portfolio',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Show, don\'t tell',
        text: 'Employers want proof you can do the work. A portfolio of 3 projects beats any list of skills. Each project should answer a real question with real data.',
        example: {
          kind: 'list',
          title: 'A great starter portfolio',
          items: [
            '1. A spreadsheet project: cleaning + pivot tables + charts (Sheets or Excel)',
            '2. A SQL project: questions answered with queries on a public dataset',
            '3. A dashboard: Power BI, Looker Studio or Tableau',
          ],
        },
      },
      {
        kind: 'explain',
        title: 'Where to find data',
        text: 'Free datasets are everywhere: Kaggle, Google Dataset Search, data.gov, and your city\'s open data portal. Pick topics you love, because your excitement shows!',
      },
      {
        kind: 'choice',
        prompt: 'What makes a portfolio project stand out?',
        options: ['A clear question, clean analysis, and a clear recommendation', 'Using as many tools as possible', 'Being very long'],
        answer: 0,
        why: 'Hiring managers look for clear thinking, not complexity.',
      },
      {
        kind: 'explain',
        title: 'Where to post it',
        text: 'GitHub for code and SQL, Tableau Public for dashboards, or a simple free website. Add the link to your resume and LinkedIn.',
      },
    ],
    review: [{ id: 's8l1c1', front: 'A strong starter portfolio has about...', options: ['3 projects', '30 projects', '1 certificate'], answer: 0 }],
  },
  {
    id: 's8l2',
    stage: 14,
    title: 'Writing your resume',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Results, not duties',
        text: 'Resume bullets should show what you achieved, with numbers. Use the pattern: action verb + what you did + the result.',
        example: {
          kind: 'list',
          items: [
            'Weak: "Responsible for reports"',
            'Strong: "Built a Looker Studio dashboard that cut weekly reporting time from 3 hours to 10 minutes"',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Which bullet is strongest?',
        options: [
          'Analyzed 50,000 sales rows in SQL and found a pricing issue worth $12K/year',
          'Used SQL',
          'Good with computers',
        ],
        answer: 0,
        why: 'Specific action, specific tool, specific result.',
      },
      {
        kind: 'explain',
        title: 'Transferable skills count',
        text: 'Past jobs in any field count! Tracked inventory? That\'s data. Handled customer complaints? That\'s stakeholder communication. Frame what you\'ve done in analyst language.',
      },
      {
        kind: 'blank',
        prompt: 'Great resume bullets include a measurable ___.',
        options: ['result', 'hobby', 'color'],
        answer: 0,
        why: 'Numbers make your impact real.',
      },
    ],
    review: [{ id: 's8l2c1', front: 'Resume bullet pattern:', options: ['Action + task + result', 'Title + date', 'Skill list'], answer: 0 }],
  },
  {
    id: 's8l3',
    stage: 14,
    title: 'Behavioral interviews',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'The STAR method',
        text: 'For "Tell me about a time when..." questions, answer with STAR: Situation, Task, Action, Result. It keeps your story short and clear.',
      },
      {
        kind: 'order',
        prompt: 'Put STAR in order.',
        items: ['Situation', 'Task', 'Action', 'Result'],
        why: 'Set the scene, say your goal, what YOU did, and how it turned out.',
      },
      {
        kind: 'choice',
        prompt: 'Which part should be the longest?',
        options: ['Action: what you did', 'Situation', 'Thanking them'],
        answer: 0,
        why: 'They\'re hiring YOU, so spend the most time on your actions.',
      },
      {
        kind: 'explain',
        title: 'Prepare 5 stories',
        text: 'Write 5 short STAR stories: a problem you solved, a mistake you learned from, working with a difficult person, explaining something complex simply, and a project you\'re proud of. They fit almost any question.',
      },
    ],
    review: [{ id: 's8l3c1', front: 'STAR stands for Situation, Task, Action and...', options: ['Result', 'Review', 'Reason'], answer: 0 }],
  },
  {
    id: 's8l4',
    stage: 14,
    title: 'SQL interview questions',
    minutes: 6,
    steps: [
      {
        kind: 'explain',
        title: 'The classics',
        text: 'Analyst interviews almost always include SQL. You already know the core! Here are the most common question types.',
        example: {
          kind: 'list',
          items: [
            'Top N: "Top 3 products by revenue" → GROUP BY + ORDER BY + LIMIT',
            'Filtering groups: "Customers with more than 5 orders" → HAVING',
            'Joining: "Orders with customer names" → JOIN',
            'Ranking: "Best seller in each category" → window functions',
          ],
        },
      },
      {
        kind: 'sql',
        prompt: 'Interview question: which customers spent more than $50 in total? Show name and total.',
        dataset: 'shop',
        answer: 'SELECT customers.name, SUM(orders.total) FROM orders JOIN customers ON orders.customer_id = customers.id GROUP BY customers.name HAVING SUM(orders.total) > 50',
        hint: 'JOIN the tables, GROUP BY customers.name, then HAVING SUM(orders.total) > 50',
        why: 'JOIN + GROUP BY + HAVING in one query. That\'s a real interview question, and you nailed it!',
      },
      {
        kind: 'choice',
        prompt: 'You\'re stuck in a live SQL interview. Best move?',
        options: ['Think out loud and explain your approach', 'Stay silent', 'Give up'],
        answer: 0,
        why: 'Interviewers grade your thinking, not just the final query.',
      },
    ],
    review: [{ id: 's8l4c1', front: '"Top 3 by revenue" needs ORDER BY ... DESC and...', options: ['LIMIT 3', 'HAVING 3', 'TOP'], answer: 0 }],
  },
  {
    id: 's8l5',
    stage: 14,
    title: 'Case interviews',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: '"Sales dropped 20%. Why?"',
        text: 'Case questions test how you think. Don\'t jump to an answer. Ask clarifying questions, then break the problem into pieces.',
        example: {
          kind: 'list',
          items: [
            'Clarify: which product? Which region? Since when?',
            'Check the data: is it real or a tracking error?',
            'Break it down: fewer customers? Or smaller orders?',
            'Look outside: season, competitors, price changes',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Best FIRST response to "Sales dropped 20%, why?"',
        options: ['"Can I ask a few clarifying questions first?"', '"Because of the economy."', '"I don\'t know."'],
        answer: 0,
        why: 'Clarifying first shows structured thinking, which is exactly what they\'re testing.',
      },
      {
        kind: 'choice',
        prompt: 'Revenue = customers × average order. Revenue fell, customers didn\'t. So...',
        options: ['Average order size fell', 'More customers came', 'Nothing changed'],
        answer: 0,
        why: 'Breaking a metric into its parts finds the cause fast.',
      },
    ],
    review: [{ id: 's8l5c1', front: 'In a case interview, first...', options: ['Ask clarifying questions', 'Guess', 'Write code'], answer: 0 }],
  },
  {
    id: 's8l6',
    stage: 14,
    title: 'Take-home tests',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'Homework for the job',
        text: 'Many companies send a dataset and a few questions. They want to see clean work, clear thinking, and a clear summary.',
        example: {
          kind: 'list',
          items: [
            'Start with a 3-sentence summary of your findings',
            'State your assumptions ("I removed 12 duplicate rows")',
            'Use clear charts with takeaway titles',
            'End with recommendations and next steps',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'What should come FIRST in your take-home write-up?',
        options: ['A short summary of the key findings', 'Every query you ran', 'Your life story'],
        answer: 0,
        why: 'Busy reviewers read the top first. Lead with the answer.',
      },
    ],
    review: [{ id: 's8l6c1', front: 'Take-home reports should start with...', options: ['A key-findings summary', 'Raw data', 'Code'], answer: 0 }],
  },
  {
    id: 's8l7',
    stage: 14,
    title: 'Final boss: you\'re an analyst',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Look how far you\'ve come',
        text: 'You started with "what is a row?" Now you can clean data in Sheets and Excel, run statistics, write SQL with JOINs, tell stories with charts, read pandas, and design dashboards.',
      },
      {
        kind: 'order',
        prompt: 'One last time: the analysis process.',
        items: ['Ask', 'Prepare', 'Process', 'Analyze', 'Share', 'Act'],
        why: 'The very first thing you learned, and still the most important.',
      },
      {
        kind: 'choice',
        prompt: 'What\'s your next step?',
        options: ['Build 3 portfolio projects and start applying', 'Wait until you know everything', 'Stop learning'],
        answer: 0,
        why: 'Nobody knows everything. Analysts learn on the job every day. You are ready. 🎓',
      },
      {
        kind: 'explain',
        title: 'Congratulations, Analyst!',
        text: 'You did this one day at a time. Keep your streak going with practice rounds, and go get that job. 💜',
      },
    ],
    review: [{ id: 's8l7c1', front: 'First step of every analysis:', options: ['Ask', 'Share', 'Act'], answer: 0 }],
  },
];
