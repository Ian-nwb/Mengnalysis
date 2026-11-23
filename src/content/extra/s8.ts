import { bl, ex, L, list, mc, ord, rc } from '../build';

// Extra Stage 8 lessons: Career
export const stage8x = [
  L('s8x1', 13, 'Job titles to search', 4, [
    ex('Same job, many names', 'Analyst jobs hide under lots of titles. Search for all of them!', list([
      'Data Analyst, Junior Data Analyst',
      'Business Analyst, Business Intelligence (BI) Analyst',
      'Reporting Analyst, Operations Analyst',
      'Marketing Analyst, Financial Analyst, Product Analyst',
    ])),
    mc('A "Reporting Analyst" job builds weekly dashboards in Power BI. Is it a data analyst job?', ['Yes', 'No'], 'The title doesn\'t matter as much as the work.'),
    mc('Best first job search strategy?', ['Search several titles and read the duties', 'Only search "Data Scientist"', 'Wait for a recruiter'], 'Cast a wide net.'),
  ], [rc('A BI Analyst mainly works with...', ['Dashboards and reports', 'Servers', 'Graphic design'])]),

  L('s8x2', 13, 'Reading job posts', 5, [
    ex('Must-haves vs. nice-to-haves', 'Job posts list a wish list. If you match about 60–70% of the requirements, apply! Many people (especially women) only apply at 100%. Don\'t be one of them.'),
    mc('A post asks for SQL, Excel, Tableau and Python. You know SQL, Excel and Power BI. Apply?', ['Yes! Power BI skills transfer to Tableau', 'No, not 100%', 'Only after learning everything'], 'You match most of it. Apply and mention you\'re learning Tableau.'),
    bl('Apply if you match around ___ of the requirements.', ['60–70%', '100%', '10%'], 'Requirements are wishes, not walls.'),
  ], [rc('Apply to jobs when you match about...', ['60–70%', '100%', '20%'])]),

  L('s8x3', 13, 'Your LinkedIn profile', 5, [
    ex('Your online storefront', 'Recruiters search LinkedIn every day. Make yours easy to find.', list([
      'Headline: "Data Analyst | SQL · Excel · Power BI"',
      'About: 3–4 sentences on what you do and love',
      'Featured: links to your portfolio projects',
      'Skills: SQL, Google Sheets, Excel, Tableau, Python...',
      'Open to work: turn it on (can be visible to recruiters only)',
    ])),
    mc('Best headline?', ['Data Analyst | SQL · Excel · Power BI', 'Looking for a job', 'Student'], 'Keywords recruiters search for.'),
    mc('Where should portfolio links go?', ['The Featured section', 'Nowhere', 'Only in messages'], 'Make them one tap away.'),
  ], [rc('Put portfolio projects in LinkedIn\'s...', ['Featured section', 'Settings', 'Notifications'])]),

  L('s8x4', 13, 'Networking without the cringe', 5, [
    ex('Informational chats', 'Most jobs come through people. Message an analyst: "Hi! I\'m learning data analysis and loved your post on dashboards. Could I ask you 3 quick questions about your job?" Most people are happy to help.'),
    mc('Best networking message?', ['Short, specific, and asks for advice', 'A long life story', '"Give me a job"'], 'Ask for advice, not a job. Jobs often follow.'),
    mc('After someone helps you, you should...', ['Thank them and share how it went', 'Disappear', 'Ask for money'], 'Gratitude keeps the connection warm.'),
  ], [rc('Networking messages should ask for...', ['Advice', 'A job immediately', 'Money'])]),

  L('s8x5', 13, 'Certificates', 4, [
    ex('Helpful, not magic', 'Certificates show commitment and give structure. Popular ones:', list([
      'Google Data Analytics Professional Certificate (Coursera)',
      'Microsoft PL-300: Power BI Data Analyst',
      'Tableau Certified Data Analyst',
    ])),
    mc('Certificate or portfolio: which matters more to hiring managers?', ['Portfolio (ideally both)', 'Certificate only', 'Neither'], 'Proof of work beats proof of study.'),
    mc('Which certificate focuses on Power BI?', ['Microsoft PL-300', 'Google Data Analytics', 'Tableau Certified'], 'PL-300 is Microsoft\'s Power BI exam.'),
  ], [rc('Microsoft\'s Power BI certificate exam:', ['PL-300', 'AZ-900', 'CS50'])]),

  L('s8x6', 13, 'Excel interview tasks', 5, [
    ex('Common live tests', 'Many interviews include a quick spreadsheet task. Practice these until they\'re easy.', list([
      'Clean a messy column (TRIM, PROPER, remove duplicates)',
      'Look up values from another table (XLOOKUP / VLOOKUP)',
      'Summarize with a pivot table',
      'Calculate with SUMIFS / COUNTIFS',
      'Make one clear chart',
    ])),
    mc('"Total sales per region" in 2 minutes. Fastest?', ['Pivot table', 'Calculator', 'Typing totals by hand'], 'Pivot tables are interview gold.'),
    mc('Interviewer asks VLOOKUP vs. XLOOKUP. Key difference?', ['XLOOKUP can look left and is simpler', 'VLOOKUP is newer', 'They\'re identical'], 'XLOOKUP is the modern, flexible version.'),
  ], [rc('Fastest way to total sales per region:', ['Pivot table', 'Manual typing', 'Pie chart'])]),

  L('s8x7', 13, 'Stats interview questions', 5, [
    ex('They love these', 'Expect questions like: "Mean vs. median?", "What is a p-value?", "Correlation vs. causation?", "How would you design an A/B test?" You learned all of these in Stage 3!'),
    mc('"When would you use median instead of mean?"', ['When there are outliers or skewed data', 'Never', 'Only for text'], 'Income, house prices, order sizes...'),
    mc('"How would you test a new checkout button?"', ['A/B test with random groups and a clear metric', 'Ask the CEO', 'Launch it and hope'], 'Random groups + one metric + enough users.'),
  ], [rc('Use median when data has...', ['Outliers', 'No numbers', 'Two rows'])]),

  L('s8x8', 13, 'Salary and offers', 5, [
    ex('Know your worth', 'Research salaries for your city and title (Glassdoor, LinkedIn, Levels.fyi). When an offer comes, it\'s normal and expected to negotiate politely.'),
    mc('You get an offer. Best first reply?', ['"Thank you! Can I have a couple of days to review it?"', '"Yes!" immediately', 'Ignore it'], 'Taking time to review is completely normal.'),
    mc('A polite negotiation sounds like...', ['"Based on my research, I was hoping for closer to $X. Is there flexibility?"', '"Pay me more or I quit"', 'Saying nothing'], 'Research + kindness + a specific number.'),
    bl('Negotiating an offer is ___.', ['normal and expected', 'rude', 'illegal'], 'Companies expect it. You deserve it!'),
  ], [rc('Before negotiating, research...', ['Salaries for the role and city', 'The CEO\'s hobbies', 'Nothing'])]),

  L('s8x9', 13, 'Your first 90 days', 5, [
    ex('Starting strong', 'New analysts shine by learning the business before the data.', list([
      'Learn what the company sells and how it makes money',
      'Find where the data lives and who owns it',
      'Ask "What decisions will this help you make?"',
      'Deliver one small, useful win early',
      'Write down everything you learn',
    ])),
    ord('Put these first-month steps in order.', ['Learn the business', 'Find the data', 'Deliver a small win', 'Take on bigger projects'], 'Context first, then quick wins, then big projects.'),
    mc('You don\'t understand a metric everyone uses. You should...', ['Ask! New people are expected to ask', 'Pretend to understand', 'Google it secretly forever'], 'Questions are a strength, especially in data.'),
  ], [rc('In a new analyst job, first learn...', ['How the business works', 'Every SQL function', 'The office layout'])]),

  L('s8x10', 13, 'Never stop learning', 4, [
    ex('Keep growing', 'Data tools change, and curious analysts grow fastest. Ideas for after this course:', list([
      'Do one public dataset project per month',
      'Join a community (r/dataanalysis, local meetups)',
      'Try Kaggle competitions for practice',
      'Learn a new tool: dbt, BigQuery, or advanced Power BI',
      'Keep your Tori streak alive with practice rounds 💜',
    ])),
    mc('Best way to stay sharp after landing a job?', ['Small regular projects and practice', 'Stop learning', 'Only read about it'], 'A little every day. You already know how to do that!'),
  ], [rc('The habit that got you here:', ['A little practice every day', 'Cramming', 'Luck'])]),
];
