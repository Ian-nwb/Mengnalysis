import { Lesson } from './types';

// Stage 7: Dashboards & BI tools (Power BI with Excel, Looker Studio with Google Sheets, Tableau).

export const stage7: Lesson[] = [
  {
    id: 's7l1',
    stage: 8,
    title: 'What is a dashboard?',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'A live report',
        text: 'A dashboard is one screen of the most important numbers and charts, updated automatically. Instead of building the same report every Monday, you build a dashboard once and people check it anytime.',
      },
      {
        kind: 'explain',
        title: 'The big three tools',
        text: 'BI (business intelligence) tools build dashboards.',
        example: {
          kind: 'list',
          items: [
            'Power BI (Microsoft): pairs naturally with Excel. Very common at companies',
            'Looker Studio (Google): free, pairs naturally with Google Sheets',
            'Tableau: famous for beautiful, flexible charts',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Your team\'s data lives in Google Sheets. Which free tool connects easily?',
        options: ['Looker Studio', 'Photoshop', 'Notepad'],
        answer: 0,
        why: 'Looker Studio connects to Google Sheets in a couple of clicks.',
      },
      {
        kind: 'choice',
        prompt: 'Which BI tool comes from Microsoft and works great with Excel?',
        options: ['Power BI', 'Looker Studio', 'Colab'],
        answer: 0,
        why: 'Power BI even shares Power Query with Excel, so your cleaning skills carry over!',
      },
    ],
    review: [{ id: 's7l1c1', front: 'Microsoft\'s BI tool is...', options: ['Power BI', 'Looker Studio', 'Tableau'], answer: 0 }],
  },
  {
    id: 's7l2',
    stage: 8,
    title: 'KPIs',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'Key Performance Indicators',
        text: 'A KPI is a number that shows if the business is on track. Good dashboards lead with 3–5 KPIs, shown big at the top.',
        example: {
          kind: 'record',
          title: 'Bean There KPIs (this month)',
          fields: [
            ['Revenue', '$24,300 (▲ 8%)'],
            ['Orders', '5,120 (▲ 3%)'],
            ['Average order', '$4.75 (▲ 5%)'],
            ['Returning customers', '62% (▼ 2%)'],
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Which is the best KPI for "Are customers coming back?"',
        options: ['% of returning customers', 'Number of menu items', 'Store color'],
        answer: 0,
        why: 'It directly measures the question.',
      },
      {
        kind: 'explain',
        title: 'Always compare',
        text: 'A number alone means little. "$24,300" is good or bad only compared to something: last month, last year, or a target. That\'s why KPIs show ▲ or ▼ with a %.',
      },
      {
        kind: 'blank',
        prompt: 'A KPI is most useful when ___ to a target or past period.',
        options: ['compared', 'hidden', 'rounded'],
        answer: 0,
        why: 'Context turns a number into an insight.',
      },
    ],
    review: [{ id: 's7l2c1', front: 'KPI stands for...', options: ['Key Performance Indicator', 'Key Pivot Index', 'Known Price Item'], answer: 0 }],
  },
  {
    id: 's7l3',
    stage: 8,
    title: 'Data models',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Facts and dimensions',
        text: 'BI tools work best with a simple model. A fact table holds events (each sale). Dimension tables describe things (products, customers, dates). They link with IDs, like JOINs.',
        example: {
          kind: 'list',
          items: ['Fact: sales (date, product_id, customer_id, amount)', 'Dimension: products (id, name, category)', 'Dimension: customers (id, name, city)'],
        },
      },
      {
        kind: 'choice',
        prompt: 'Which is a FACT table?',
        options: ['orders, one row per order', 'products, one row per product', 'cities'],
        answer: 0,
        why: 'Facts are events that happen (orders, clicks, payments).',
      },
      {
        kind: 'explain',
        title: 'Star schema',
        text: 'Draw the fact table in the middle with dimensions around it and it looks like a star. That\'s literally called a star schema, and Power BI loves it.',
      },
    ],
    review: [{ id: 's7l3c1', front: 'A table of events (like sales) is a...', options: ['Fact table', 'Dimension table', 'Pivot'], answer: 0 }],
  },
  {
    id: 's7l4',
    stage: 8,
    title: 'Measures and DAX',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Calculations in BI tools',
        text: 'A measure is a calculation that updates with every filter, like total revenue. In Power BI, measures are written in DAX, which looks a lot like Excel formulas.',
        example: { kind: 'formula', formula: 'Revenue = SUM(Sales[Amount])', result: 'Total revenue, for whatever filter is selected' },
      },
      {
        kind: 'choice',
        prompt: 'DAX looks most like...',
        options: ['Excel formulas', 'Python loops', 'Chart colors'],
        answer: 0,
        why: 'SUM, AVERAGE, IF... your spreadsheet skills transfer directly.',
      },
      {
        kind: 'explain',
        title: 'In Looker Studio',
        text: 'Looker Studio calls them calculated fields, with formulas like SUM(Amount) or CASE WHEN, which is the SQL style!',
      },
    ],
    review: [{ id: 's7l4c1', front: 'Power BI\'s formula language:', options: ['DAX', 'SQL+', 'PyBI'], answer: 0 }],
  },
  {
    id: 's7l5',
    stage: 8,
    title: 'Filters and interactivity',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'Let people explore',
        text: 'Dashboards have slicers (Power BI) or controls (Looker Studio), like date pickers and dropdowns. Click "June" and every chart updates to June.',
      },
      {
        kind: 'choice',
        prompt: 'A manager wants to see their own store only. What do you add?',
        options: ['A store filter (slicer)', 'A new dashboard per store', 'A pie chart'],
        answer: 0,
        why: 'One dashboard, filtered by each person. Much easier to maintain.',
      },
      {
        kind: 'explain',
        title: 'Drill down',
        text: 'Drill-down lets people click a bar (say, "2026") to see the months inside it. Start broad, explore into details.',
      },
    ],
    review: [{ id: 's7l5c1', front: 'Power BI calls on-screen filters...', options: ['Slicers', 'Cutters', 'Choppers'], answer: 0 }],
  },
  {
    id: 's7l6',
    stage: 8,
    title: 'Dashboard design',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'The layout rules',
        text: 'People read top-left first. Put the most important things there.',
        example: {
          kind: 'list',
          items: [
            'Top: 3–5 KPI cards',
            'Middle: main trend (line chart)',
            'Bottom: breakdowns (bar charts) and details',
            'Few colors: one highlight color, the rest neutral',
            'Every chart has a clear title',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'What goes at the very top of a dashboard?',
        options: ['The key KPIs', 'A detailed data table', 'The logo, really big'],
        answer: 0,
        why: 'The most important numbers get the best spot.',
      },
      {
        kind: 'choice',
        prompt: 'A dashboard has 20 charts on one page. Problem?',
        options: ['Too crowded: keep only what answers the key questions', 'No, more is better', 'It needs 3D'],
        answer: 0,
        why: 'A dashboard should answer a few key questions fast. Move details to a second page.',
      },
    ],
    review: [{ id: 's7l6c1', front: 'Dashboard top section should show...', options: ['KPIs', 'Raw data', 'Footnotes'], answer: 0 }],
  },
  {
    id: 's7l7',
    stage: 8,
    title: 'Boss level: design a dashboard',
    minutes: 6,
    steps: [
      {
        kind: 'explain',
        title: 'Your case',
        text: 'The plant shop owner wants a weekly dashboard. Their data is in Google Sheets. Let\'s plan it.',
      },
      {
        kind: 'choice',
        prompt: 'Which tool?',
        options: ['Looker Studio (free, connects to Sheets)', 'Print the sheet weekly', 'Word document'],
        answer: 0,
        why: 'Sheets + Looker Studio = a free, auto-updating dashboard.',
      },
      {
        kind: 'choice',
        prompt: 'Which 3 KPIs make the best top row?',
        options: ['Revenue, orders, average order value', 'Font, color, logo', 'Every customer\'s name'],
        answer: 0,
        why: 'They answer "how is the shop doing?" at a glance.',
      },
      {
        kind: 'order',
        prompt: 'Order the dashboard from top to bottom.',
        items: ['KPI cards', 'Revenue trend line', 'Sales by plant (bars)', 'Detail table'],
        why: 'Summary first, details last. You designed a real dashboard! Stage 8 conquered! 📊',
      },
    ],
    review: [{ id: 's7l7c1', front: 'Free Google dashboard tool:', options: ['Looker Studio', 'Power BI Pro', 'Access'], answer: 0 }],
  },
];
