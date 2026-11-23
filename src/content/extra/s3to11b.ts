import { bar, bl, code, ex, fx, L, list, mc, ord, rc, sql } from '../build';

// Stage 3 additions
export const stage3y = [
  L('s3y1', 3, 'Significant vs. useful', 5, [
    ex('Two different questions', 'Statistical significance asks: "Is this difference real or luck?" Practical significance asks: "Is it big enough to matter?" With 10 million users, even a 0.01% lift can be "significant"… and still worthless.'),
    mc('A new button lifts sales by 0.01%, p < 0.05, but costs $50,000 to build. Ship it?', ['Probably not: real, but too small to matter', 'Yes, it\'s significant!', 'Rebuild the whole app'], 'Always compare the size of the effect to its cost.'),
    mc('Which pair answers both questions?', ['p-value AND the size of the difference', 'Only the p-value', 'Only the chart color'], 'Report the effect size with a confidence interval.'),
    bl('Real but tiny effects are statistically significant but not ___ significant.', ['practically', 'visually', 'legally'], 'Business decisions need both.'),
  ], [rc('With huge samples, tiny differences become...', ['Statistically significant', 'Invisible', 'Errors'])]),

  L('s3y2', 3, 'Margin of error', 4, [
    ex('Say the range out loud', 'Polls say "52% ± 3%". The ± part is the margin of error: the real value is probably between 49% and 55%. Reporting a single number pretends to be more certain than you are.'),
    mc('Option A: 48% ± 4%. Option B: 51% ± 4%. Is B clearly better?', ['No, the ranges overlap', 'Yes, 51 > 48', 'Yes, A is wrong'], '44–52 and 47–55 overlap a lot. You need more data.'),
    mc('Margin of error gets smaller when...', ['The sample gets bigger', 'You round the numbers', 'You use a pie chart'], 'More data = more precision.'),
  ], [rc('"60% ± 5%" means the real value is likely between...', ['55% and 65%', '60% exactly', '0% and 100%'])]),
];

// Stage 4 additions: Real-World Messy SQL (dataset: app). Verified with sqlite3.
export const stage4y = [
  L('s4y1', 4, 'Messy SQL: NULL traps', 6, [
    ex('NULL hides in plain sight', 'COUNT(*) counts rows. COUNT(column) skips NULLs. And WHERE col != \'x\' silently DROPS rows where col is NULL, because NULL isn\'t equal OR unequal to anything.', fx('SELECT COUNT(*), COUNT(referrer) FROM users', '8 users, but only 5 have a referrer')),
    sql('Count users whose referrer is NOT instagram, including users with no referrer.', 'app', "SELECT COUNT(*) FROM users WHERE referrer != 'instagram' OR referrer IS NULL", "WHERE referrer != 'instagram' OR referrer IS NULL", 'Without the IS NULL part you\'d get 3 instead of 6. Sneaky!'),
    ex('COALESCE fills blanks', 'COALESCE(a, b) returns the first value that isn\'t NULL. Perfect for labels.', fx("SELECT name, COALESCE(referrer, 'unknown') FROM users", "NULL referrers show as 'unknown'")),
    sql("Show each user's name and referrer, with 'unknown' instead of NULL.", 'app', "SELECT name, COALESCE(referrer, 'unknown') FROM users", "SELECT name, COALESCE(referrer, 'unknown') FROM users", 'Clean labels make reports readable.'),
  ], [rc('COUNT(column) ignores...', ['NULL values', 'Duplicates', 'Text']), rc('Replace NULL with a default using...', ['COALESCE', 'IFNULLIFY', 'TRIM'])]),

  L('s4y2', 4, 'Messy SQL: dates', 6, [
    ex('Grouping by month', 'Real tables store full dates. To group by month, cut the date down. Big warehouses use DATE_TRUNC(\'month\', date). SQLite (this app) uses strftime.', fx("SELECT strftime('%Y-%m', signup_date) AS month, COUNT(*) FROM users GROUP BY month", '2026-01: 3 · 2026-02: 3 · 2026-03: 2')),
    sql('Count signups per month (call the month column month).', 'app', "SELECT strftime('%Y-%m', signup_date) AS month, COUNT(*) FROM users GROUP BY month", "strftime('%Y-%m', signup_date) AS month ... GROUP BY month", 'Same idea as DATE_TRUNC in BigQuery or Snowflake.'),
    ex('Days between dates', 'DATEDIFF in most warehouses; in SQLite, subtract julianday() values.', fx("SELECT name, julianday('2026-03-31') - julianday(signup_date) AS days FROM users", 'How many days each user has been signed up')),
    mc('Times are stored in UTC, but the business is in New York. Risk?', ['Late-night sales land on the wrong day', 'None', 'Dates get deleted'], 'Always convert to the business\'s time zone before grouping by day.'),
  ], [rc('Group dates by month in most warehouses with...', ['DATE_TRUNC', 'MONTHIFY', 'ROUND'])]),

  L('s4y3', 4, 'Messy SQL: removing duplicates', 6, [
    ex('The ROW_NUMBER pattern', 'Number the rows inside each group of "same" records, then keep only row 1. Payments 3 and 4 are the same payment recorded twice!', code("WITH r AS (\n  SELECT id, user_id, paid_on,\n    ROW_NUMBER() OVER (PARTITION BY user_id, paid_on, amount ORDER BY id) AS rn\n  FROM payments\n)\nSELECT id, user_id, paid_on FROM r WHERE rn = 1")),
    sql('Use the ROW_NUMBER pattern to list the real (deduplicated) payments: id, user_id, paid_on.', 'app', 'WITH r AS (SELECT id, user_id, paid_on, ROW_NUMBER() OVER (PARTITION BY user_id, paid_on, amount ORDER BY id) AS rn FROM payments) SELECT id, user_id, paid_on FROM r WHERE rn = 1', 'Copy the pattern from the code card: PARTITION BY user_id, paid_on, amount ... WHERE rn = 1', '8 rows became 6. This exact pattern shows up in interviews constantly!'),
    mc('PARTITION BY user_id, paid_on, amount means...', ['Rows with the same user, date and amount are one group', 'Sort by user', 'Delete those columns'], 'Within each group, ROW_NUMBER counts 1, 2, 3…'),
  ], [rc('Dedupe pattern: ROW_NUMBER() ... keep rows where rn =', ['1', '0', '2'])]),

  L('s4y4', 4, 'Messy SQL: moving averages', 5, [
    ex('Smooth the noise', 'Daily numbers jump around. A moving average averages each day with the days before it, so the trend shows.', fx('AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)', '3-day moving average')),
    sql('Show day, sales, and a 3-day moving average called avg3.', 'app', 'SELECT day, sales, AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS avg3 FROM daily_sales', 'AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS avg3', 'Use 6 PRECEDING for a 7-day average on real daily data.'),
    mc('For a 7-day moving average, use...', ['ROWS BETWEEN 6 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 7 PRECEDING', 'LIMIT 7'], '6 days before + today = 7 days.'),
  ], [rc('7-day moving average frame:', ['6 PRECEDING AND CURRENT ROW', '7 FOLLOWING', 'LIMIT 7'])]),

  L('s4y5', 4, 'Messy SQL: CASE buckets', 5, [
    ex('Label users on the fly', 'CASE WHEN turns raw values into business categories, then you can group by them.', fx("SELECT CASE WHEN plan = 'pro' THEN 'Paying' ELSE 'Free' END AS segment, COUNT(*) FROM users GROUP BY segment", 'Paying: 4 · Free: 4')),
    sql("Count users per segment: 'Paying' for pro, 'Free' otherwise (name it segment).", 'app', "SELECT CASE WHEN plan = 'pro' THEN 'Paying' ELSE 'Free' END AS segment, COUNT(*) FROM users GROUP BY segment", "CASE WHEN plan = 'pro' THEN 'Paying' ELSE 'Free' END AS segment ... GROUP BY segment", 'Buckets like New / Active / Churned work the same way.'),
  ], [rc('Turn values into categories with...', ['CASE WHEN', 'GROUP ONLY', 'LIKE'])]),

  L('s4y6', 4, 'Messy SQL: cohorts and retention', 7, [
    ex('Do users come back?', 'A cohort is a group that started at the same time, like everyone who signed up in January. Retention asks: how many of them came back in later months?'),
    ex('The pattern', 'Join users to logins, label each user\'s signup month, and count users with a login in a LATER month.', code("SELECT strftime('%Y-%m', u.signup_date) AS cohort,\n  COUNT(DISTINCT u.id) AS users,\n  COUNT(DISTINCT CASE WHEN strftime('%Y-%m', l.login_date)\n    > strftime('%Y-%m', u.signup_date) THEN u.id END) AS came_back\nFROM users u LEFT JOIN logins l ON l.user_id = u.id\nGROUP BY cohort")),
    sql('Run the cohort query from the code card (cohort, users, came_back).', 'app', "SELECT strftime('%Y-%m', u.signup_date) AS cohort, COUNT(DISTINCT u.id) AS users, COUNT(DISTINCT CASE WHEN strftime('%Y-%m', l.login_date) > strftime('%Y-%m', u.signup_date) THEN u.id END) AS came_back FROM users u LEFT JOIN logins l ON l.user_id = u.id GROUP BY cohort", 'Copy it carefully from the code card. u and l are short names (aliases) for the tables.', 'January: 2 of 3 came back. February: 2 of 3. You just ran a real retention analysis!'),
    mc('Why use LEFT JOIN here?', ['Keep users who never logged in again', 'It\'s faster', 'To remove users'], 'They\'re the ones who didn\'t retain, and they still count!'),
  ], [rc('A group of users who started at the same time:', ['Cohort', 'Partition', 'Segment key'])]),
];

// Stage 5 additions
export const stage5y = [
  L('s5y1', 5, 'Pre-attentive attributes', 4, [
    ex('3-second insights', 'Our brains notice color, size and position before we even think. Use ONE of these to make the insight jump out instantly.', bar('Returns by product', [['Mugs', 12], ['Tees', 9], ['Hoodies', 41], ['Caps', 7]], 'Hoodies')),
    mc('What did your eye notice first?', ['Hoodies', 'Caps', 'The title'], 'One strong color does the work.'),
    mc('Everything is bold, big and colorful. Result?', ['Nothing stands out', 'Everything stands out', 'Faster reading'], 'Contrast only works when most things are calm.'),
  ], [rc('Color, size and position are...', ['Pre-attentive attributes', 'Dimensions', 'Delimiters'])]),

  L('s5y2', 5, 'Waterfall, heatmap, bullet', 5, [
    ex('Special-purpose charts', 'Some questions have a perfect chart.', list([
      'Waterfall: how you got from A to B (start $100K, +$30K new, −$12K refunds → $118K)',
      'Heatmap: a grid colored by value (busy hours × weekdays)',
      'Bullet chart: actual vs. target in one compact bar',
    ])),
    mc('"What drove profit from last year to this year?"', ['Waterfall chart', 'Pie chart', 'Scatter plot'], 'Each bar adds or subtracts from the running total.'),
    mc('"Which hour of which weekday is busiest?"', ['Heatmap', 'Line chart', 'KPI card'], 'Two categories × one value = heatmap.'),
    mc('"Are we on track for our target?"', ['Bullet chart', 'Histogram', 'Map'], 'Actual bar vs. a target marker.'),
  ], [rc('Show how you got from A to B with a...', ['Waterfall chart', 'Pie chart', 'Map'])]),

  L('s5y3', 5, 'Data-ink ratio', 4, [
    ex('Less junk, more data', 'Every drop of ink should show data. Remove what doesn\'t: 3D effects, heavy gridlines, shadows, redundant legends, decorative backgrounds.'),
    ord('Clean up a chart: order the steps.', ['Remove 3D and shadows', 'Lighten or remove gridlines', 'Label data directly', 'Delete the extra legend'], 'Simpler = clearer.'),
    mc('Which is chart junk?', ['A 3D shadow on every bar', 'The axis labels', 'The data values'], 'It adds ink without adding information.'),
  ], [rc('Chart junk is...', ['Ink that shows no data', 'Any color', 'Axis labels'])]),

  L('s5y4', 5, 'The SCQA framework', 5, [
    ex('Story structure for business', 'SCQA: Situation (what\'s normal), Complication (what changed), Question (what we need to know), Answer (your recommendation).', list([
      'S: "Afternoon sales have been steady for a year."',
      'C: "In July they dropped 20%."',
      'Q: "Why, and what should we do?"',
      'A: "A new café opened nearby; let\'s launch an afternoon deal."',
    ])),
    ord('Put SCQA in order.', ['Situation', 'Complication', 'Question', 'Answer'], 'Context → problem → question → your answer.'),
    mc('Which part is "In July sales dropped 20%"?', ['Complication', 'Situation', 'Answer'], 'It\'s the change that creates tension.'),
  ], [rc('SCQA ends with the...', ['Answer', 'Question', 'Situation'])]),
];

// Stage 6 additions
export const stage6y = [
  L('s6y1', 6, 'Reshaping: melt and explode', 5, [
    ex('Wide to long', 'Spreadsheets often have one column per month (wide). Analysis tools prefer one row per month (long). melt() converts it.', code('long = df.melt(id_vars="store", var_name="month", value_name="sales")', 'store | month | sales')),
    ex('Lists in cells', 'A cell with ["latte", "muffin"]? explode() gives each item its own row.', code('df.explode("items")')),
    mc('Columns Jan, Feb, Mar → one "month" column. Use...', ['melt()', 'explode()', 'merge()'], 'Wide → long = melt.'),
    mc('A tags column holds lists. One row per tag?', ['explode()', 'melt()', 'dropna()'], 'Explode the list into rows.'),
  ], [rc('Wide-to-long reshape in pandas:', ['melt()', 'explode()', 'stack_all()'])]),

  L('s6y2', 6, 'Text and regex', 5, [
    ex('Clean text at scale', 'The .str tools work on whole columns. Regex (regular expressions) describes text patterns.', list([
      'df["drink"].str.contains("latte", case=False)',
      'df["code"].str.extract(r"(\\d+)") → pulls out the digits',
      'df["email"].str.lower().str.strip()',
    ])),
    mc('Find rows whose drink mentions "latte" in any capitalization:', ['.str.contains("latte", case=False)', '== "latte"', '.str.upper()'], 'case=False ignores capitals.'),
    mc('In regex, \\d means...', ['A digit (0–9)', 'Delete', 'A date'], '\\d+ = one or more digits.'),
  ], [rc('Regex \\d matches...', ['A digit', 'A letter', 'A space'])]),

  L('s6y3', 6, 'Time series: resample', 4, [
    ex('Roll up timestamps', 'With dates as the index, resample groups by time periods.', code('daily = df.set_index("date")\nweekly = daily["sales"].resample("W").sum()', 'Total sales per week')),
    mc('Monthly totals from daily data?', ['.resample("M").sum()', '.groupby("M")', '.melt("M")'], '"W" = weekly, "M" = monthly.'),
  ], [rc('Weekly totals from daily data:', ['resample("W").sum()', 'explode("W")', 'melt("W")'])]),

  L('s6y4', 6, 'APIs and JSON', 5, [
    ex('Live data from the web', 'Many services share data through APIs. requests fetches it as JSON; pd.json_normalize flattens nested JSON into a table.', code('import requests\nr = requests.get("https://api.example.com/orders")\ndf = pd.json_normalize(r.json())')),
    mc('What does json_normalize do?', ['Flattens nested JSON into columns', 'Deletes JSON', 'Makes a chart'], '{"user": {"name": "Ava"}} becomes a user.name column.'),
    mc('Where should API keys (passwords) go?', ['In a secret setting, never in shared code', 'In the notebook for everyone', 'In the chart title'], 'Keys are like passwords. Keep them private.'),
  ], [rc('Flatten nested JSON in pandas:', ['pd.json_normalize()', 'pd.flatten()', 'pd.read_csv()'])]),
];

// Stage 8 (BI) additions
export const stage8y = [
  L('s8y1', 8, 'DAX context: row vs. filter', 6, [
    ex('Why the same measure shows different numbers', 'Filter context: the filters around a visual (this month, this store) decide which rows a measure sees. Row context: a calculated column works row by row. CALCULATE changes the filter context on purpose.', fx('Pro Revenue = CALCULATE(SUM(Sales[Amount]), Customers[Plan] = "Pro")', 'Revenue from Pro customers, whatever else is filtered')),
    mc('A Revenue card shows a different number when you click "June". Why?', ['The filter context changed', 'DAX is broken', 'The data was deleted'], 'Measures recalculate for every filter.'),
    mc('Tableau\'s cousin of CALCULATE-style fixed calculations:', ['LOD expressions like FIXED', 'VLOOKUP', 'Pivot charts'], '{FIXED [Customer] : SUM([Sales])} ignores other dimensions.'),
  ], [rc('In DAX, change the filter context with...', ['CALCULATE', 'SUMX', 'FILTERALL'])]),

  L('s8y2', 8, 'Dashboard UX', 5, [
    ex('Designing for real people', 'Cross-filtering: clicking one chart filters the others. Drill-down: click a year to see months. Mobile layouts: phones need a single column, big KPI cards, and fewer charts.'),
    mc('Your boss checks the dashboard on a phone. You should...', ['Build a mobile layout with stacked KPI cards', 'Hope they zoom', 'Add more charts'], 'Power BI and Looker Studio both support phone layouts.'),
    mc('Clicking "Austin" on a map filters every other chart. That\'s...', ['Cross-filtering', 'Drill-through', 'Refresh'], 'One click, the whole page responds.'),
  ], [rc('Clicking one chart filters others:', ['Cross-filtering', 'Refreshing', 'Exporting'])]),
];

// Stage 11 (Career) additions
export const stage11y = [
  L('s11y1', 13, 'Domain fluency', 5, [
    ex('Speak the business language', 'Each industry has its favorite metrics. Knowing them makes you sound like you belong.', list([
      'E-commerce: conversion rate, AOV, CAC, LTV, churn',
      'SaaS (subscriptions): MRR, retention, net revenue retention',
      'Operations: lead time, on-time delivery %, inventory turnover',
      'Marketing: CTR (click-through rate), cost per click, ROAS',
    ])),
    mc('A subscription software company cares most about...', ['MRR and retention', 'Inventory turnover', 'Foot traffic'], 'Recurring revenue is their heartbeat.'),
    mc('Before a job interview at a shop, learn...', ['Their likely metrics (AOV, conversion, CAC)', 'Their logo colors', 'Nothing'], 'Domain fluency stands out.'),
  ], [rc('MRR stands for...', ['Monthly recurring revenue', 'Max revenue rate', 'Market risk ratio'])]),

  L('s11y2', 13, 'Saying no (nicely)', 5, [
    ex('Push back with a better option', 'Sometimes a boss asks for a vanity metric ("show total signups ever!"). Don\'t just say no: offer something more useful. "Happy to! Could we also show weekly active users? It tells us if people stay."'),
    mc('Your boss wants a chart that hides a bad month. You...', ['Explain the risk and offer an honest version', 'Do it silently', 'Quit'], 'Trust is an analyst\'s most valuable asset.'),
    ord('A good pushback, in order.', ['Acknowledge the goal', 'Explain the concern', 'Offer a better metric', 'Let them decide'], 'Respectful, clear, helpful.'),
  ], [rc('When asked for a vanity metric, best move:', ['Offer a more useful alternative', 'Refuse rudely', 'Ignore it'])]),
];
