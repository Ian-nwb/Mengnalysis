import { bar, bl, ex, L, list, mc, ord, rc, rec } from '../build';

// Extra Stage 1 lessons: Thinking in Data
export const stage1x = [
  L('s1x1', 1, 'Analyst, scientist, engineer?', 4, [
    ex('Three data jobs', 'People mix these up all the time. They work together, but each has a different focus.', list([
      'Data analyst: answers business questions with data (Sheets, SQL, dashboards)',
      'Data scientist: builds predictions and models (lots of statistics and Python)',
      'Data engineer: builds the pipes that move and store data',
    ])),
    mc('Who builds a dashboard showing last month\'s sales?', ['Data analyst', 'Data engineer', 'Network admin'], 'Answering "what happened and why" is the analyst\'s home turf.'),
    mc('Who builds the system that copies app data into the database every night?', ['Data engineer', 'Data analyst', 'Graphic designer'], 'Engineers build the pipelines; analysts use what comes out.'),
    ex('A great starting point', 'Many data scientists and engineers started as analysts. It\'s the perfect first data job, and that\'s the path you\'re on.'),
  ], [rc('Who answers business questions with data?', ['Data analyst', 'Data engineer', 'Web designer'])]),

  L('s1x2', 1, 'Where does data come from?', 4, [
    ex('Data is everywhere', 'Every tap, purchase and sign-up can become a row in a table somewhere.', list([
      'Transactions: every sale at a register',
      'Apps & websites: clicks, visits, time on page',
      'Surveys: answers people give',
      'Sensors: temperature, steps, GPS',
      'Public data: government, research, open data portals',
    ])),
    mc('Your phone counts your steps. What kind of data source is that?', ['A sensor', 'A survey', 'A transaction'], 'The phone\'s motion sensor records it automatically.'),
    mc('A customer fills in "How did you hear about us?" That\'s...', ['Survey data', 'Sensor data', 'Website logs'], 'People answering questions = survey data.'),
    bl('Each sale at a register is a ___.', ['transaction', 'sensor', 'chart'], 'Transactions are one of the richest data sources a business has.'),
  ], [rc('Step counts from a phone are what type of source?', ['Sensor', 'Survey', 'Transaction'])]),

  L('s1x3', 1, 'Numbers vs. words', 4, [
    ex('Quantitative and qualitative', 'Quantitative data is numbers you can measure (price, age, visits). Qualitative data describes qualities in words (reviews, colors, opinions).'),
    mc('"The coffee was too bitter" is...', ['Qualitative', 'Quantitative', 'A date'], 'It\'s a description in words.'),
    mc('"4 out of 5 stars" is...', ['Quantitative', 'Qualitative', 'Neither'], 'It\'s a number you can average and compare.'),
    ex('Use both', 'Numbers tell you WHAT is happening ("ratings dropped"). Words often tell you WHY ("the new cups leak"). Great analysts look at both.'),
    bl('Customer reviews written in words are ___ data.', ['qualitative', 'quantitative', 'sensor'], 'Qualitative = qualities, in words.'),
  ], [rc('Numbers you can measure are...', ['Quantitative', 'Qualitative', 'Categorical'])]),

  L('s1x4', 1, 'Tidy tables', 4, [
    ex('Structured data', 'Structured data fits neatly in rows and columns. Unstructured data doesn\'t: emails, photos, voice notes. Analysts mostly work with structured data, or turn messy data into structure.'),
    ex('The tidy rules', 'A "tidy" table follows three simple rules.', list([
      'Each row is one thing (one sale)',
      'Each column is one detail (price)',
      'Each cell holds one value (not "Latte, Mocha")',
    ])),
    mc('A cell says "Latte, Mocha, Tea". Which rule does it break?', ['One value per cell', 'One thing per row', 'Nothing'], 'Split it so each drink gets its own row.'),
    mc('Which is unstructured data?', ['A folder of customer emails', 'A sales table', 'A list of prices'], 'Emails are free text, with no rows and columns.'),
  ], [rc('A tidy table has how many values per cell?', ['One', 'Two', 'As many as you like'])]),

  L('s1x5', 1, 'Metrics and dimensions', 5, [
    ex('Two kinds of columns', 'Metrics are numbers you calculate (sales, count, average). Dimensions are how you slice them (by drink, by day, by city).', rec('Example question', [
      ['Question', 'Sales per city'],
      ['Metric', 'Sales'],
      ['Dimension', 'City'],
    ])),
    mc('"Average order size by month". What is the metric?', ['Average order size', 'Month', 'Order'], 'The number you calculate is the metric.'),
    mc('In that same question, what is the dimension?', ['Month', 'Average order size', 'Sales'], 'Month is how you split the metric.'),
    bl('"Visits by country": country is a ___.', ['dimension', 'metric', 'formula'], 'You\'ll use these words constantly in dashboards (Stage 8).'),
  ], [rc('"Revenue by region": region is the...', ['Dimension', 'Metric', 'Formula']), rc('"Revenue by region": revenue is the...', ['Metric', 'Dimension', 'Row'])]),

  L('s1x6', 1, 'Fair questions', 4, [
    ex('Leading questions', 'How you ask changes the answer. "Don\'t you love our new menu?" pushes people toward yes. "How do you feel about our new menu?" is neutral.'),
    mc('Which survey question is neutral?', ['How would you rate our service?', 'How amazing was our service?', 'Wasn\'t our service great?'], 'It doesn\'t hint at the "right" answer.'),
    mc('Only asking loyal members about prices will probably make prices look...', ['Better liked than they really are', 'Worse', 'Exactly right'], 'Loyal customers are happier than average. Ask a mix of people.'),
    bl('A question that pushes people toward an answer is ___.', ['leading', 'neutral', 'tidy'], 'Neutral questions give honest data.'),
  ], [rc('"Don\'t you agree prices are fair?" is a...', ['Leading question', 'Neutral question', 'Metric'])]),

  L('s1x7', 1, 'Data with care', 5, [
    ex('Privacy matters', 'Data is often about real people. Analysts protect it: only use what you need, keep it secure, and never share personal details like names, emails or addresses without permission.'),
    ex('Anonymize', 'Before analyzing, analysts often remove or replace personal details. "Maria Lopez, maria@email.com" becomes "Customer #88". The analysis still works!'),
    mc('A friend asks for the customer email list "just to look". You...', ['Politely say no, it\'s private data', 'Send it', 'Post it online'], 'Protecting data is part of the job, and of trust.'),
    mc('Which is personal information?', ['A phone number', 'Total sales for June', 'Average price'], 'It identifies a specific person.'),
    bl('Replacing names with IDs is called ___.', ['anonymizing', 'sorting', 'charting'], 'You keep the insight and protect the person.'),
  ], [rc('Before sharing data, remove...', ['Personal details', 'Column names', 'Numbers'])]),

  L('s1x8', 1, 'Be a data detective', 5, [
    ex('Data in everyday life', 'Analysts notice patterns everywhere. Here are how many coffees one café sold each day last week.', bar('Coffees sold per day', [['Mon', 120], ['Tue', 95], ['Wed', 98], ['Thu', 102], ['Fri', 140], ['Sat', 210], ['Sun', 180]], 'Sat')),
    mc('Which day was busiest?', ['Saturday', 'Monday', 'Wednesday'], 'Saturday had 210, the longest bar.'),
    mc('What might explain the weekend jump?', ['People have free time on weekends', 'The chart is wrong', 'Coffee is cheaper on weekends'], 'A good guess to check with more data!'),
    ord('Detective steps: put them in order.', ['Notice a pattern', 'Guess a reason', 'Check with more data', 'Share what you found'], 'Notice → guess → check → share. That\'s analysis in a nutshell.'),
  ], [rc('After guessing a reason for a pattern, you should...', ['Check it with more data', 'Announce it as fact', 'Forget it'])]),
];
