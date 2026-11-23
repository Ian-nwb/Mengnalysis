import { Lesson } from './types';

export const stage1: Lesson[] = [
  {
    id: 's1l1',
    stage: 1,
    title: 'What does a data analyst do?',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'Welcome, future analyst!',
        text: 'A data analyst turns raw numbers into answers. Companies have tons of data, but data alone means nothing until someone asks a good question and finds the story inside it. That someone is you.',
      },
      {
        kind: 'explain',
        title: 'A day in the life',
        text: 'Analysts help people make better decisions. A coffee shop might ask: "Which drink should we put on sale?" An analyst looks at the sales data and says: "Iced lattes sell 3x more on hot days, so promote them in summer."',
        example: {
          kind: 'list',
          title: 'Questions analysts answer',
          items: [
            'Which products sell the most?',
            'Why did sign-ups drop last month?',
            'Which customers are likely to come back?',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'What is the main job of a data analyst?',
        options: [
          'Fix broken computers',
          'Turn data into answers that help people decide',
          'Collect as much data as possible',
        ],
        answer: 1,
        why: 'Analysts are question-answerers. Data is the raw material; the insight is the product.',
      },
      {
        kind: 'explain',
        title: 'Your toolkit',
        text: 'On this journey you will learn spreadsheets, statistics, SQL (the language of databases), charts, Python, and dashboards. One small step a day. No rush.',
      },
      {
        kind: 'blank',
        prompt: 'SQL is the language used to talk to ___.',
        options: ['printers', 'databases', 'phones'],
        answer: 1,
        why: 'SQL lets you ask a database questions like "show me all sales from June".',
      },
    ],
    review: [
      {
        id: 's1l1c1',
        front: 'A data analyst mainly...',
        options: ['Turns data into useful answers', 'Builds websites', 'Repairs servers'],
        answer: 0,
      },
      {
        id: 's1l1c2',
        front: 'SQL is used to talk to...',
        options: ['Spreadsheets only', 'Databases', 'Email'],
        answer: 1,
      },
    ],
  },
  {
    id: 's1l2',
    stage: 1,
    title: 'Rows and columns',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'Data lives in tables',
        text: 'Most data is stored in tables. Each ROW is one thing (one sale, one person, one song). Each COLUMN is one detail about that thing (price, name, date).',
      },
      {
        kind: 'explain',
        title: 'Here is one row',
        text: 'This is a single row from a coffee shop sales table. Each label is a column name.',
        example: {
          kind: 'record',
          title: 'Sale #1042',
          fields: [
            ['Date', 'June 3'],
            ['Drink', 'Iced Latte'],
            ['Size', 'Large'],
            ['Price', '$5.50'],
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'In a table of songs, what is one ROW?',
        options: ['The list of all artist names', 'One single song', 'The "Length" detail'],
        answer: 1,
        why: 'A row is one record: one song with all its details.',
      },
      {
        kind: 'choice',
        prompt: 'In that same song table, what is a COLUMN?',
        options: ['One detail, like "Artist"', 'One song', 'The whole playlist'],
        answer: 0,
        why: 'A column holds the same kind of detail for every row, like every song\'s artist.',
      },
      {
        kind: 'blank',
        prompt: 'A table with 500 sales has 500 ___.',
        options: ['columns', 'rows', 'charts'],
        answer: 1,
        why: 'One sale = one row, so 500 sales = 500 rows.',
      },
    ],
    review: [
      {
        id: 's1l2c1',
        front: 'One record in a table (like one sale) is a...',
        options: ['Column', 'Row', 'Cell'],
        answer: 1,
      },
      {
        id: 's1l2c2',
        front: '"Price" in a sales table is a...',
        options: ['Row', 'Column', 'Database'],
        answer: 1,
      },
    ],
  },
  {
    id: 's1l3',
    stage: 1,
    title: 'Types of data',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Not all data is the same',
        text: 'Every column has a type. Knowing the type tells you what you can do with it. You can add up prices, but you can\'t add up names!',
        example: {
          kind: 'list',
          title: 'Common types',
          items: [
            'Number: 5.50, 42, 1000',
            'Text: "Iced Latte", "Tori"',
            'Date: June 3, 2026',
            'Category: Small / Medium / Large',
            'True/False: Member? Yes or No',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'What type of data is "Size: Medium"?',
        options: ['Number', 'Category', 'Date'],
        answer: 1,
        why: 'Size has a small set of fixed options, so it is a category.',
      },
      {
        kind: 'choice',
        prompt: 'Which column could you take the AVERAGE of?',
        options: ['Customer name', 'Price', 'Drink name'],
        answer: 1,
        why: 'Only numbers can be averaged. Price is a number.',
      },
      {
        kind: 'explain',
        title: 'Sneaky numbers',
        text: 'Some things look like numbers but aren\'t. A phone number or zip code is made of digits, but adding two zip codes together makes no sense. Treat them as text.',
      },
      {
        kind: 'blank',
        prompt: 'A zip code like 90210 should be treated as ___.',
        options: ['a number', 'text', 'a date'],
        answer: 1,
        why: 'You never do math on zip codes, so they are text (and leading zeros stay safe!).',
      },
    ],
    review: [
      {
        id: 's1l3c1',
        front: '"Small / Medium / Large" is what type of data?',
        options: ['Category', 'Number', 'Date'],
        answer: 0,
      },
      {
        id: 's1l3c2',
        front: 'A phone number should be stored as...',
        options: ['A number', 'Text', 'True/False'],
        answer: 1,
      },
    ],
  },
  {
    id: 's1l4',
    stage: 1,
    title: 'Asking good questions',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'The question comes first',
        text: 'Great analysis starts with a great question. A vague question gets a vague answer. A specific question tells you exactly what data to look at.',
        example: {
          kind: 'list',
          title: 'Vague vs. specific',
          items: [
            'Vague: "How is the shop doing?"',
            'Specific: "Did weekend sales grow from May to June?"',
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Which question is the most specific?',
        options: [
          'Are customers happy?',
          'What % of customers rated us 4+ stars this month?',
          'Is the app good?',
        ],
        answer: 1,
        why: 'It names the measure (% rating 4+), and the time (this month). You know exactly what to calculate.',
      },
      {
        kind: 'explain',
        title: 'A handy trick',
        text: 'A good question usually answers: WHAT are we measuring, for WHO, and over WHEN. "What was the average order size for new customers last week?"',
      },
      {
        kind: 'blank',
        prompt: 'A specific question includes what, who, and ___.',
        options: ['why not', 'when', 'how fun'],
        answer: 1,
        why: 'A time frame keeps the question focused and comparable.',
      },
    ],
    review: [
      {
        id: 's1l4c1',
        front: 'A good analysis question should be...',
        options: ['As broad as possible', 'Specific and measurable', 'Secret'],
        answer: 1,
      },
    ],
  },
  {
    id: 's1l5',
    stage: 1,
    title: 'Messy data',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Real data is messy',
        text: 'Analysts spend a lot of time cleaning data. Real data has typos, blanks, duplicates, and things written in different ways. Finding these is a superpower.',
      },
      {
        kind: 'explain',
        title: 'Spot the problem',
        text: 'Look at this row from a customer table.',
        example: {
          kind: 'record',
          title: 'Customer #88',
          fields: [
            ['Name', 'Maria Lopez'],
            ['City', 'new york'],
            ['Age', '250'],
            ['Email', '(blank)'],
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Which value is almost certainly a mistake?',
        options: ['Name: Maria Lopez', 'Age: 250', 'City: new york'],
        answer: 1,
        why: 'Nobody is 250 years old! Impossible values like this are called outliers or errors.',
      },
      {
        kind: 'choice',
        prompt: 'The email is blank. What do we call that?',
        options: ['A missing value', 'A duplicate', 'A category'],
        answer: 0,
        why: 'Blank cells are missing values. You decide whether to fill them, skip them, or flag them.',
      },
      {
        kind: 'explain',
        title: 'Same thing, different spelling',
        text: '"new york", "New York" and "NYC" all mean the same city, but a computer counts them as three different places. Cleaning means making them consistent.',
      },
      {
        kind: 'blank',
        prompt: 'The same sale recorded twice is called a ___.',
        options: ['duplicate', 'column', 'chart'],
        answer: 0,
        why: 'Duplicates make totals too big, so analysts remove them.',
      },
    ],
    review: [
      {
        id: 's1l5c1',
        front: 'A blank cell in your data is a...',
        options: ['Missing value', 'Duplicate', 'Formula'],
        answer: 0,
      },
      {
        id: 's1l5c2',
        front: 'Why are duplicates a problem?',
        options: ['They make totals too big', 'They are too colorful', 'They delete columns'],
        answer: 0,
      },
    ],
  },
  {
    id: 's1l6',
    stage: 1,
    title: 'Count, sum and average',
    minutes: 5,
    steps: [
      {
        kind: 'explain',
        title: 'Your first three tools',
        text: 'COUNT tells you how many. SUM adds them up. AVERAGE is the sum divided by the count. These three answer a surprising number of questions.',
        example: {
          kind: 'list',
          title: 'Today\'s 4 sales',
          items: ['$4', '$6', '$5', '$5'],
        },
      },
      {
        kind: 'choice',
        prompt: 'What is the COUNT of today\'s sales ($4, $6, $5, $5)?',
        options: ['4', '20', '5'],
        answer: 0,
        why: 'There are 4 sales, so the count is 4.',
      },
      {
        kind: 'choice',
        prompt: 'What is the SUM?',
        options: ['$15', '$20', '$4'],
        answer: 1,
        why: '4 + 6 + 5 + 5 = 20.',
      },
      {
        kind: 'choice',
        prompt: 'And the AVERAGE?',
        options: ['$4', '$6', '$5'],
        answer: 2,
        why: 'Sum ÷ count = 20 ÷ 4 = $5.',
      },
      {
        kind: 'blank',
        prompt: 'Average = sum divided by ___.',
        options: ['count', 'price', 'ten'],
        answer: 0,
        why: 'You just did it: 20 ÷ 4 = 5.',
      },
    ],
    review: [
      {
        id: 's1l6c1',
        front: 'Sales: $2, $4, $6. What is the average?',
        options: ['$4', '$12', '$3'],
        answer: 0,
      },
      {
        id: 's1l6c2',
        front: 'COUNT tells you...',
        options: ['How many', 'The total', 'The biggest'],
        answer: 0,
      },
    ],
  },
  {
    id: 's1l7',
    stage: 1,
    title: 'The analysis process',
    minutes: 4,
    steps: [
      {
        kind: 'explain',
        title: 'Six steps, every time',
        text: 'Almost every analysis follows the same path: Ask a question, Prepare the data, Process (clean) it, Analyze it, Share what you found, and help people Act on it.',
        example: {
          kind: 'list',
          items: ['1. Ask', '2. Prepare', '3. Process', '4. Analyze', '5. Share', '6. Act'],
        },
      },
      {
        kind: 'order',
        prompt: 'Put the steps in order. Tap them one by one.',
        items: ['Ask', 'Prepare', 'Process', 'Analyze', 'Share', 'Act'],
        why: 'Ask → Prepare → Process → Analyze → Share → Act. You\'ll use this forever.',
      },
      {
        kind: 'choice',
        prompt: 'Fixing typos and removing duplicates happens in which step?',
        options: ['Share', 'Process', 'Ask'],
        answer: 1,
        why: 'Process is the cleaning step.',
      },
    ],
    review: [
      {
        id: 's1l7c1',
        front: 'Which step comes FIRST in an analysis?',
        options: ['Analyze', 'Ask', 'Share'],
        answer: 1,
      },
      {
        id: 's1l7c2',
        front: 'Cleaning the data happens in...',
        options: ['Process', 'Act', 'Share'],
        answer: 0,
      },
    ],
  },
  {
    id: 's1l8',
    stage: 1,
    title: 'Boss level: the coffee shop',
    minutes: 6,
    steps: [
      {
        kind: 'explain',
        title: 'Your first case!',
        text: 'The owner of Bean There Coffee says: "Our afternoons feel slow. Should we close at 3pm?" Let\'s plan how an analyst would handle this.',
      },
      {
        kind: 'choice',
        prompt: 'What is the best question to investigate?',
        options: [
          'Is coffee popular?',
          'How do sales after 3pm compare to before 3pm, over the last 3 months?',
          'What color should the cups be?',
        ],
        answer: 1,
        why: 'It\'s specific: what (sales), when (before vs. after 3pm), and over a clear time frame.',
      },
      {
        kind: 'explain',
        title: 'Look at a row',
        text: 'Here is one row of the sales data.',
        example: {
          kind: 'record',
          title: 'Sale #2210',
          fields: [
            ['Date', 'Aug 14'],
            ['Time', '4:35 PM'],
            ['Drink', 'Cold Brew'],
            ['Price', '$4.75'],
          ],
        },
      },
      {
        kind: 'choice',
        prompt: 'Which column is most important for this question?',
        options: ['Drink', 'Time', 'Cup color'],
        answer: 1,
        why: 'We\'re comparing before and after 3pm, so Time is the key column.',
      },
      {
        kind: 'choice',
        prompt: 'You find the same sale listed twice. What should you do?',
        options: ['Keep both, more sales is good!', 'Remove the duplicate', 'Delete the whole table'],
        answer: 1,
        why: 'Duplicates inflate totals and would give the owner wrong answers.',
      },
      {
        kind: 'choice',
        prompt: 'After 3pm has fewer sales, but they\'re mostly large cold drinks. What should you share?',
        options: [
          'Just "close at 3pm"',
          'Afternoon sales are fewer but bigger; compare the money earned, not just the count',
          'Nothing, it\'s confusing',
        ],
        answer: 1,
        why: 'Count and sum can tell different stories. Great analysts show the full picture. You just thought like one!',
      },
    ],
    review: [
      {
        id: 's1l8c1',
        front: 'Fewer sales can still mean more money if...',
        options: ['Each sale is bigger', 'The shop is closed', 'There are duplicates'],
        answer: 0,
      },
    ],
  },
];
