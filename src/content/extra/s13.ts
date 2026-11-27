import { bar, code, ex, L, list, mc, ord, rc, reflect, sheet, sql } from '../build';

// More skills across stages + Stage 13: Real-World Projects. SQL answers verified with sqlite3.

const REPS: (string | number)[][] = [
  ['Rep', 'Region', 'Q1', 'Q2'],
  ['Ava', 'North', 120, 150],
  ['Ben', 'South', 90, 80],
  ['Cleo', 'North', 200, 210],
  ['Dev', 'East', 60, 95],
  ['Eli', 'South', 140, 130],
];
const MONTHS: (string | number)[][] = [
  ['Month', 'Sales'],
  ['Jan', 100],
  ['Feb', 120],
  ['Mar', 110],
  ['Apr', 130],
  ['May', 140],
  ['Jun', 150],
];

// ---------- Stage 1: cleaning chapter ----------
export const stage1z = [
  L('s1z1', 1, 'Your data-cleaning checklist', 5, [
    ex('Clean in the same order every time', 'Analysts spend a big part of their time cleaning. A checklist makes it fast and calm.', list([
      '1. Keep a copy of the raw data',
      '2. Remove exact duplicates',
      '3. Fix data types (dates as dates, IDs as text)',
      '4. Tidy text (spaces, capitals, spelling)',
      '5. Decide what to do with missing values',
      '6. Check outliers and impossible values',
      '7. Write down every change you made',
    ])),
    ord('Put the first four cleaning steps in order.', ['Copy the raw data', 'Remove duplicates', 'Fix data types', 'Tidy text'], 'Protect the original first, then clean from the biggest problems down.'),
    mc('Why write down every change?', ['So others can trust and repeat your work', 'It is required by Excel', 'To make the file bigger'], 'A short "cleaning log" turns your work into something others can check.'),
  ], [rc('First step of any cleaning job:', ['Keep a copy of the raw data', 'Delete outliers', 'Make a chart'])]),

  L('s1z2', 1, 'Handling missing data', 5, [
    ex('Three choices', 'When values are missing, you can drop the rows, fill them in, or flag them. The right choice depends on why they are missing and how many there are.', list([
      'Drop: a few rows, missing at random',
      'Fill: a sensible default (0 sales on a closed day) or a typical value (median)',
      'Flag: keep the row and mark it "unknown" so nothing is hidden',
    ])),
    mc('3 of 10,000 orders have no city. Simplest good choice?', ['Drop or label them "unknown"', 'Delete the whole column', 'Guess a city'], 'A tiny, random gap barely changes the answer. Just be transparent.'),
    mc('Half of all survey answers skipped the income question. You should...', ['Report it, and avoid conclusions about income', 'Fill them with the average', 'Pretend it is complete'], 'Filling half the data with one number would invent an answer.'),
  ], [rc('Missing values can be dropped, filled or...', ['Flagged', 'Hidden', 'Doubled'])]),
];

// ---------- Stage 2: Formula Lab 2 ----------
export const stage2v = [
  L('s2v1', 2, 'Formula lab 2: conditional averages', 6, [
    ex('A sales team sheet', 'Five sales reps, their region, and sales in Q1 and Q2.'),
    sheet('Average Q1 sales for the North region.', REPS, '=AVERAGEIF(B2:B6,"North",C2:C6)', 'AVERAGEIF(region range, "North", Q1 range).', '(120 + 200) ÷ 2 = 160.', ['AVERAGEIF']),
    sheet('How many South reps sold more than 100 in Q2?', REPS, '=COUNTIFS(B2:B6,"South",D2:D6,">100")', 'COUNTIFS with two pairs: region = "South", Q2 > 100.', 'Only Eli (130).', ['COUNTIFS']),
  ], [rc('Average only rows that match a rule:', ['AVERAGEIF', 'AVERAGE', 'MEDIAN'])]),

  L('s2v2', 2, 'Formula lab 2: growth and change', 6, [
    sheet("Ava's growth from Q1 to Q2 as a decimal: (Q2 − Q1) ÷ Q1.", REPS, '=(D2-C2)/C2', 'Brackets first: (D2-C2)/C2.', '0.25 means 25% growth. Format the cell as % to show it.'),
    sheet('Did Ben go "Up" or "Down" from Q1 to Q2?', REPS, '=IF(D3>C3,"Up","Down")', 'IF(D3>C3, "Up", "Down").', 'Ben dropped from 90 to 80.', ['IF']),
    sheet('What is the median Q2 sale?', REPS, '=MEDIAN(D2:D6)', 'MEDIAN over the Q2 column.', 'Sorted: 80, 95, 130, 150, 210, so the middle is 130.', ['MEDIAN']),
  ], [rc('Percent change formula:', ['(new − old) ÷ old', 'new ÷ old', 'old − new'])]),

  L('s2v3', 2, 'Formula lab 2: tiers and labels', 6, [
    sheet('Label Cleo (row 4) by Q2: "Star" if 200+, "Solid" if 100+, otherwise "Growing".', REPS, '=IFS(D4>=200,"Star",D4>=100,"Solid",TRUE,"Growing")', 'IFS checks in order. End with TRUE, "Growing" as the catch-all.', 'Cleo sold 210: Star!', ['IFS']),
    sheet('List the first two reps\' names in one cell, separated by ", ".', REPS, '=TEXTJOIN(", ",TRUE,A2:A3)', 'TEXTJOIN(separator, skip blanks, range).', '"Ava, Ben". Handy for labels and summaries.', ['TEXTJOIN']),
    sheet('Average Q1 sales, rounded to a whole number.', REPS, '=ROUND(AVERAGE(C2:C6),0)', 'Wrap AVERAGE in ROUND(…, 0).', '(120+90+200+60+140) ÷ 5 = 122.', ['ROUND']),
  ], [rc('Join several cells into one text with...', ['TEXTJOIN', 'MERGE', 'SUM'])]),
];

// ---------- Stage 3: more statistics ----------
export const stage3z = [
  L('s3z1', 3, 'How big a sample do I need?', 5, [
    ex('Small effects need big samples', 'If version B is hugely better, a few hundred users can show it. If it is only slightly better, you may need tens of thousands. Decide the smallest change worth detecting before you start a test.'),
    mc('You expect a tiny improvement (0.5%). What do you need?', ['A much larger sample', 'A smaller sample', 'No test at all'], 'Tiny effects hide in noise unless you have lots of data.'),
    mc('Why decide the sample size BEFORE starting a test?', ['So you don\'t stop early just because it looks good', 'It\'s faster to type', 'Tests can\'t be stopped'], 'Peeking and stopping early is a classic way to fool yourself.'),
  ], [rc('Smaller expected effects need...', ['Bigger samples', 'Smaller samples', 'No samples'])]),

  L('s3z2', 3, 'Simple forecasting', 6, [
    ex('Three baseline forecasts', 'Before fancy models, analysts try simple baselines.', list([
      'Naive: next month = this month',
      'Moving average: next month = average of the last few months',
      'Seasonal naive: next July = last July (for seasonal data)',
    ])),
    sheet('Forecast July as the average of the last 3 months (Apr–Jun).', MONTHS, '=AVERAGE(B5:B7)', 'AVERAGE over B5:B7.', '(130 + 140 + 150) ÷ 3 = 140.', ['AVERAGE']),
    mc('Sales grow every month. What is the weakness of a 3-month average forecast?', ['It lags behind a rising trend', 'It is always too high', 'It ignores the data'], 'Averages look backwards, so a growing trend makes them run low.'),
    mc('Ice cream sales: best simple forecast for next July?', ['Seasonal naive: last July', 'Last month (June)', 'The yearly average'], 'Strong seasons repeat, so last year\'s same month is a great baseline.'),
  ], [rc('A forecast of "next month = this month" is called...', ['Naive', 'Seasonal', 'Regression'])]),
];

// ---------- Stage 4: SQL practice chapter ----------
export const stage4p = [
  L('s4p1', 4, 'Practice set: the plant shop', 6, [
    ex('Three real questions', 'The plant shop owner wants answers. Use JOIN, GROUP BY and HAVING.'),
    sql('Who is the top customer by total spend? Show name and total (call it spent).', 'shop', 'SELECT customers.name, SUM(orders.total) AS spent FROM orders JOIN customers ON orders.customer_id = customers.id GROUP BY customers.name ORDER BY spent DESC LIMIT 1', 'JOIN, GROUP BY customers.name, ORDER BY spent DESC LIMIT 1', 'Priya, with 108. A VIP worth a thank-you note!'),
    sql('Which items were ordered more than once? Show item and count.', 'shop', 'SELECT item, COUNT(*) FROM orders GROUP BY item HAVING COUNT(*) > 1', 'GROUP BY item HAVING COUNT(*) > 1', 'Cactus, Pothos and Snake Plant: the reliable sellers.'),
    sql('How many orders came from each city, including cities with none?', 'shop', 'SELECT customers.city, COUNT(orders.id) FROM customers LEFT JOIN orders ON customers.id = orders.customer_id GROUP BY customers.city', 'LEFT JOIN from customers; COUNT(orders.id) counts only real orders.', 'Austin leads with 6. COUNT(column) skips the NULLs, so Ana adds 0 to Denver.'),
  ], [rc('Count only real matches after a LEFT JOIN with...', ['COUNT(orders.id)', 'COUNT(*)', 'SUM(*)'])]),

  L('s4p2', 4, 'Self joins', 5, [
    ex('A table joined to itself', 'Give the same table two short names (aliases) and join them. Great for pairs, like songs by the same artist.', code("SELECT a.title, b.title\nFROM songs a JOIN songs b\n  ON a.artist = b.artist AND a.id < b.id")),
    sql("List every pair of Nova Ray songs (title, title).", 'music', "SELECT a.title, b.title FROM songs a JOIN songs b ON a.artist = b.artist AND a.id < b.id WHERE a.artist = 'Nova Ray'", "Use the pattern from the code card, plus WHERE a.artist = 'Nova Ray'", 'a.id < b.id stops each pair from appearing twice (and a song pairing with itself).'),
    mc('Classic interview use of a self join:', ['Employees and their managers in the same table', 'Summing a column', 'Sorting'], 'employees.manager_id points to another row in employees.'),
  ], [rc('Joining a table to itself needs...', ['Two aliases', 'Two databases', 'A UNION'])]),

  L('s4p3', 4, 'Lists in one cell: GROUP_CONCAT', 4, [
    ex('Combine many rows into one text', 'GROUP_CONCAT (SQLite, MySQL) joins values from a group into one string. In BigQuery and PostgreSQL it is STRING_AGG.', code("SELECT artist, GROUP_CONCAT(title, ', ')\nFROM songs GROUP BY artist")),
    sql("For each artist, list their song titles in one cell, separated by ', '.", 'music', "SELECT artist, GROUP_CONCAT(title, ', ') FROM songs GROUP BY artist", "GROUP_CONCAT(title, ', ') with GROUP BY artist", 'Perfect for readable summaries in reports.'),
  ], [rc('BigQuery\'s version of GROUP_CONCAT:', ['STRING_AGG', 'CONCAT_ALL', 'JOIN_TEXT'])]),

  L('s4p4', 4, 'Interview practice 2', 6, [
    ex('Two classics', 'Interviewers love "second highest" and "per month" questions.'),
    sql('Which song has the SECOND most plays? Show its title.', 'music', 'SELECT title FROM songs ORDER BY plays DESC LIMIT 1 OFFSET 1', 'ORDER BY plays DESC LIMIT 1 OFFSET 1 (skip the first row).', 'OFFSET skips rows. You could also use RANK() and keep rank = 2.'),
    sql('Total payment amount per month (call the month column month).', 'app', "SELECT strftime('%Y-%m', paid_on) AS month, SUM(amount) FROM payments GROUP BY month", "strftime('%Y-%m', paid_on) AS month … GROUP BY month", 'Bonus thought: this table has duplicate payments. In a real interview, mention that you would dedupe first!'),
  ], [rc('Skip the first N rows of a result with...', ['OFFSET', 'SKIP', 'HAVING'])]),
];

// ---------- Stage 5: chart critique ----------
export const stage5z = [
  L('s5z1', 5, 'Chart critique', 5, [
    ex('Be a friendly critic', 'Reviewing charts (yours and others\') is a core analyst skill. Ask: is it honest, is it clear, does it answer one question?'),
    mc('A bar chart\'s axis starts at 90, so 92 vs. 95 looks huge. Fix?', ['Start the axis at zero', 'Add 3D', 'Use more colors'], 'Bars must start at zero to be honest.'),
    mc('A line chart has 12 colored lines and a legend far away. Fix?', ['Highlight one or two lines, label them directly, gray the rest', 'Add more lines', 'Make it a pie'], 'Highlight the story; mute the rest.'),
    mc('Two different measures share one chart with two y-axes. Risk?', ['Readers can be misled about how they relate', 'None', 'It is too small'], 'Dual axes can suggest a relationship that isn\'t there. Use two charts.'),
  ], [rc('Bars must start at...', ['Zero', 'The minimum', 'Any value'])]),

  L('s5z2', 5, 'Writing insight headlines', 4, [
    ex('Headline = insight', 'Practice turning facts into takeaways.', bar('Signups by channel', [['Search', 420], ['Friends', 310], ['Instagram', 120]], 'Search')),
    mc('Search 420 vs. Friends + Instagram 430. Is "Search beats all other channels combined" true?', ['No, the others combined are slightly more', 'Yes', 'Can\'t tell'], '310 + 120 = 430, which beats 420. Always check the math behind a bold headline!'),
    mc('Which headline is safest and true?', ['Search is our biggest signup channel', 'Instagram is failing', 'Friends don\'t matter'], 'Claim only what the data shows. No exaggeration.'),
  ], [rc('A good chart headline is...', ['A true, specific takeaway', 'The chart type', 'As dramatic as possible'])]),
];

// ---------- Stage 6: pandas practice ----------
export const stage6z = [
  L('s6z1', 6, 'Predict the output: pandas', 5, [
    mc('What does this return?', ['3', '5', '2'], 'value_counts counts each value: "Latte" appears 3 times.', { kind: 'code', code: 'df = pd.DataFrame({"drink": ["Latte", "Tea", "Latte", "Mocha", "Latte"]})\ndf["drink"].value_counts()["Latte"]' }),
    mc('How many rows remain?', ['2', '3', '4'], 'Only prices over 5: 5.5 and 6.0.', { kind: 'code', code: 'df = pd.DataFrame({"price": [4.5, 5.5, 3.0, 6.0]})\nlen(df[df["price"] > 5])' }),
    mc('What is printed?', ['6.0', '4.75', '19.0'], 'The max of the price column is 6.0.', { kind: 'code', code: 'df = pd.DataFrame({"price": [4.5, 5.5, 3.0, 6.0]})\nprint(df["price"].max())' }),
  ], [rc('df["col"].value_counts() returns...', ['A count of each value', 'The column sum', 'The first rows'])]),

  L('s6z2', 6, 'A pandas cleaning project', 6, [
    ex('From messy CSV to tidy table', 'A real cleaning script follows the same checklist you learned in Stage 1, in code.', { kind: 'code', code: 'df = pd.read_csv("orders.csv")\ndf = df.drop_duplicates()\ndf["date"] = pd.to_datetime(df["date"])\ndf["city"] = df["city"].str.strip().str.title()\ndf["coupon"] = df["coupon"].fillna("none")\ndf = df[df["total"] > 0]' }),
    ord('Order the cleaning steps in the script.', ['Load the CSV', 'Drop duplicates', 'Convert dates', 'Tidy city names', 'Fill missing coupons', 'Remove impossible totals'], 'Same checklist, now automatic for every new file.'),
    mc('Why fill missing coupons with "none" instead of dropping rows?', ['Those orders are real; only the coupon is blank', 'Dropping is illegal', 'It makes the file bigger'], 'Never throw away real orders because an optional field is blank.'),
  ], [rc('Fill missing values in pandas with...', ['fillna()', 'dropna()', 'isna()'])]),
];

// ---------- Stage 13: Real-World Projects ----------
export const stage13 = [
  L('s13l1', 13, 'Project: the café weekly review', 7, [
    ex('Your brief', 'Bean There Coffee wants a quick weekly review: best days, best morning drinks, and one recommendation.'),
    sql('Revenue per day, best day first (call it revenue).', 'coffee', 'SELECT day, SUM(price) AS revenue FROM sales GROUP BY day ORDER BY revenue DESC', 'GROUP BY day ORDER BY revenue DESC', 'Monday leads with 17.75; Thursday is quietest.'),
    sql('Most popular drinks before noon (hour < 12): drink and cups, most first.', 'coffee', 'SELECT drink, COUNT(*) AS cups FROM sales WHERE hour < 12 GROUP BY drink ORDER BY cups DESC', 'WHERE hour < 12 … GROUP BY drink ORDER BY cups DESC', 'Lattes rule the mornings (4 cups).'),
    mc('Best recommendation from these results?', ['Run a Thursday latte deal to lift the quietest day', 'Close on Mondays', 'Stop selling lattes'], 'Pair the weakest day with the most loved morning drink.'),
  ], [rc('A weekly review should end with...', ['A recommendation', 'Raw data', 'Only charts'])]),

  L('s13l2', 13, 'Project: subscription health', 7, [
    ex('Your brief', 'The study app team asks: how many users pay, who stays active, and what is our churn?'),
    sql('Count users per plan.', 'app', 'SELECT plan, COUNT(*) FROM users GROUP BY plan', 'GROUP BY plan', 'Half free, half pro: 4 and 4.'),
    sql('How many different users logged in during March 2026 (login_date on or after 2026-03-01)?', 'app', "SELECT COUNT(DISTINCT user_id) FROM logins WHERE login_date >= '2026-03-01'", "COUNT(DISTINCT user_id) … WHERE login_date >= '2026-03-01'", '5 active users in March.'),
    sheet('Monthly churn: cancelled ÷ subscribers at the start.', [['Start', 'Cancelled'], [400, 18]], '=B2/A2', 'B2/A2.', '0.045 = 4.5% churn.'),
    mc('Best next step?', ['Check which plan and signup month the churned users came from', 'Celebrate and stop', 'Delete inactive users'], 'Segmenting churn shows where to act.'),
  ], [rc('Active users are usually counted with...', ['COUNT(DISTINCT user_id)', 'COUNT(*)', 'SUM(user_id)'])]),

  L('s13l3', 13, 'Project: the marketing budget', 6, [
    ex('Your brief', 'Marketing has $1,000 more to spend. Which channel should get it?'),
    sheet('ROAS for Search (row 3): revenue ÷ spend.', [['Channel', 'Spend', 'Revenue'], ['Social', 600, 1500], ['Search', 400, 1600], ['Email', 100, 700]], '=C3/B3', 'C3/B3.', 'Search returns 4 for every 1 spent.'),
    sheet('ROAS for Email (row 4).', [['Channel', 'Spend', 'Revenue'], ['Social', 600, 1500], ['Search', 400, 1600], ['Email', 100, 700]], '=C4/B4', 'C4/B4.', 'Email: 7! Small but mighty.'),
    mc('Email has the best ROAS but only 100 spend. Smart move?', ['Test a bigger email budget and watch if ROAS holds', 'Move all money to email immediately', 'Cut email'], 'Returns often shrink as spend grows. Test, measure, then scale.'),
  ], [rc('ROAS = ...', ['Revenue ÷ ad spend', 'Spend ÷ revenue', 'Clicks ÷ views'])]),

  L('s13l4', 13, 'Project: music library insights', 6, [
    ex('Your brief', 'A music app wants to know which genre to feature on the home screen.'),
    sql('Total plays per genre, most first (call it total).', 'music', 'SELECT genre, SUM(plays) AS total FROM songs GROUP BY genre ORDER BY total DESC', 'GROUP BY genre ORDER BY total DESC', 'Pop leads with 970 plays.'),
    sql('Average song length per genre, rounded to 2 decimals.', 'music', 'SELECT genre, ROUND(AVG(minutes), 2) FROM songs GROUP BY genre', 'ROUND(AVG(minutes), 2) … GROUP BY genre', 'Lo-fi songs are shortest (2.8 min): great for quick study sessions.'),
    mc('Pop has the most plays, but Lo-fi has the single most-played song. What do you recommend?', ['Feature Pop, plus a "Study Lo-fi" playlist', 'Feature only Rock', 'Feature nothing'], 'Good analysts combine findings into one clear recommendation.'),
  ], [rc('Pick a featured genre by...', ['Total plays (and context)', 'Alphabetical order', 'Random choice'])]),

  L('s13l5', 13, 'Boss level: your portfolio project', 8, [
    ex('Put it all together', 'Your final project: pick a public dataset, answer a real question, and present it. This is exactly what goes in your portfolio.'),
    ord('Order your project steps.', ['Pick a question you care about', 'Find and save the raw data', 'Clean and document', 'Analyze with SQL or formulas', 'Build 1–3 clear charts', 'Write the recommendation'], 'Ask → Prepare → Process → Analyze → Share → Act. Full circle!'),
    mc('Where should the project live so recruiters can see it?', ['GitHub, Tableau Public or a simple website, linked on your resume', 'Only on your laptop', 'In an email draft'], 'Make it one click away.'),
    mc('Your README should start with...', ['The question and the main finding', 'Your software versions', 'A long list of steps'], 'Lead with the answer, always.'),
    reflect('Describe your portfolio project in 2–3 sentences: question, finding, recommendation.', 'I analyzed a year of city bike rentals to find when demand peaks. Rentals double on warm weekend afternoons, while weekday mornings are steady. I recommend moving more bikes to parks on sunny weekends.'),
  ], [rc('Portfolio projects should lead with...', ['The question and finding', 'The tools', 'The data size'])]),
];
