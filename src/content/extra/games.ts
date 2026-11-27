import { build, chartpick, match, odd, sort, spot, tf } from '../build';
import { Step } from '../types';

// Duolingo-style game steps, added near the end of existing lessons (see ../index.ts).
// lesson id → steps (inserted before the lesson's last step, or before its reflect step).
export const GAMES: Record<string, Step[]> = {
  // Stage 0
  s0l2: [match('Match each file type to what it is.', [['CSV', 'Plain text with commas'], ['XLSX', 'Excel workbook'], ['JSON', 'Nested labels and values'], ['TSV', 'Columns split by tabs']], 'You will meet all four every week.')],
  s0l6: [tf('Keys: true or false?', [['A primary key is unique for every row', true], ['A name makes a great primary key', false], ['A foreign key points to another table\'s primary key', true]], 'Keys are what connect tables in lookups, JOINs and BI models.')],
  // Stage 1
  s1l2: [tf('Rows and columns: true or false?', [['One row is one record, like one sale', true], ['"Price" is a row', false], ['A table of 500 sales has 500 rows', true]], 'Rows = things, columns = details.')],
  s1l3: [match('Match each value to its data type.', [['42', 'Number'], ['"Iced Latte"', 'Text'], ['June 3, 2026', 'Date'], ['Small / Medium / Large', 'Category']], 'Knowing the type tells you what math makes sense.')],
  s1l7: [build('Build the analysis process (first three steps).', ['Ask', '→', 'Prepare', '→', 'Process'], ['Share', 'Guess'], 'Ask → Prepare → Process, then Analyze → Share → Act.')],
  s1x5: [match('Match each word to its meaning.', [['Metric', 'A number you calculate'], ['Dimension', 'How you slice it'], ['Revenue', 'A metric'], ['City', 'A dimension']], 'Metrics are measured; dimensions split them.')],
  // Stage 2
  s2l3: [build('Build a formula: price (B2) times quantity (C2).', ['=', 'B2', '*', 'C2'], ['x', '+', 'SUM('], 'Formulas start with = and use * to multiply.')],
  s2l4: [match('Match each function to what it does.', [['SUM', 'Adds up'], ['AVERAGE', 'Mean value'], ['COUNT', 'How many numbers'], ['MAX', 'Biggest value']], 'The famous five work the same in Sheets and Excel.')],
  s2l8: [build('Build: total Price (B) for Latte rows (drinks in A).', ['=SUMIF(', 'A2:A100', ',', '"Latte"', ',', 'B2:B100', ')'], ['=COUNTIF(', 'C2:C100'], 'SUMIF(where to look, what to match, what to add).')],
  s2l11: [build('Build an XLOOKUP for the price of "Mocha".', ['=XLOOKUP(', '"Mocha"', ',', 'A2:A20', ',', 'B2:B20', ')'], ['=VLOOKUP(', 'FALSE'], 'Find, look in, return.')],
  s2l12: [tf('Pivot tables: true or false?', [['Values hold the numbers being summarized', true], ['Pivot tables need lots of formulas', false], ['Rows are the groups you want to see', true]], 'Rows = groups, Values = numbers.')],
  // Stage 3
  s3l1: [tf('Mean vs. median: true or false?', [['One huge value pulls the mean up', true], ['The median is pulled by outliers', false], ['For salaries, the median is often fairer', true]], 'Skewed data → median.')],
  s3l6: [match('Match the correlation to its meaning.', [['+1', 'Move perfectly together'], ['0', 'No relationship'], ['−1', 'Move perfectly opposite'], ['0.82', 'Strong positive']], 'Correlation runs from −1 to +1.')],
  s3l7: [tf('Correlation and causation:', [['Ice cream and sunburns rise together, so ice cream causes sunburns', false], ['A hidden factor can drive both things', true], ['Experiments can show cause and effect', true]], 'Correlation ≠ causation. Look for confounders.')],
  s3l8: [match('A/B test words: match them up.', [['Random groups', 'Make the test fair'], ['p-value', 'Chance it is just luck'], ['Bigger sample', 'More confidence'], ['Group B', 'Sees the new version']], 'Fair split + enough data = trustworthy test.')],
  // Stage 4
  s4l2: [build('Build a query that shows every column of the sales table.', ['SELECT', '*', 'FROM', 'sales'], ['WHERE', 'DELETE', 'songs'], 'SELECT * FROM table: the "show me everything" query.')],
  s4l3: [build("Build: sales where the drink is 'Latte'.", ['SELECT', '*', 'FROM', 'sales', 'WHERE', "drink = 'Latte'"], ['HAVING', 'ORDER BY'], 'WHERE filters rows. Text goes in single quotes.')],
  s4l7: [build('Build: count sales per drink.', ['SELECT', 'drink,', 'COUNT(*)', 'FROM', 'sales', 'GROUP BY', 'drink'], ['ORDER BY', 'SUM(price)'], 'GROUP BY = pivot table in SQL.')],
  s4l9: [match('Match each SQL word to its job.', [['JOIN', 'Connect tables'], ['WHERE', 'Filter rows'], ['GROUP BY', 'Make groups'], ['HAVING', 'Filter groups']], 'These four power most analyst queries.')],
  s4l15: [match('Match each window function to its job.', [['RANK()', 'Leaderboard positions'], ['LAG()', 'Previous row\'s value'], ['ROW_NUMBER()', 'Number rows (dedupe)'], ['PARTITION BY', 'Restart per group']], 'Window functions keep every row.')],
  s4x7: [tf('JOINs: true or false?', [['LEFT JOIN keeps every row from the first table', true], ['A regular JOIN keeps unmatched rows', false], ['Missing matches show up as NULL', true]], 'LEFT JOIN finds "who\'s missing".')],
  // Stage 5
  s5l1: [match('Match the question to the best chart.', [['Compare categories', 'Bar chart'], ['Change over time', 'Line chart'], ['Two numbers related?', 'Scatter plot'], ['One key number', 'KPI card']], 'Chart type follows the question.')],
  s5l5: [tf('Honest charts: true or false?', [['Bar charts should start at zero', true], ['Showing only the good months is fine', false], ['3D effects make sizes harder to judge', true]], 'Honest charts build trust.')],
  // Stage 6
  s6l3: [tf('Python lists: true or false?', [['The first item is at position 0', true], ['len([4, 6, 5]) is 15', false], ['sum([2, 3]) is 5', true]], 'Counting from zero takes practice!')],
  s6l5: [match('Match the pandas command to what it shows.', [['df.head()', 'First 5 rows'], ['df.shape', '(rows, columns)'], ['df.columns', 'Column names'], ['df.describe()', 'Summary stats']], 'Always look before you analyze.')],
  s6l7: [build('Build: total price per drink in pandas.', ['df.groupby("drink")', '["price"]', '.sum()'], ['.mean()', 'df.merge'], 'Group → pick column → calculate.')],
  // Stage 7
  s7m1: [match('Match each pipeline step to an example.', [['Source', 'The app\'s database'], ['Ingestion', 'Fivetran copies data'], ['Warehouse', 'Snowflake or BigQuery'], ['Transformation', 'dbt models']], 'Source → load → store → clean → show.')],
  // Stage 8
  s7l2: [tf('KPIs: true or false?', [['A KPI is most useful compared to a target or past period', true], ['A dashboard should lead with 20 KPIs', false], ['▲ 8% means up compared to before', true]], '3–5 KPIs, always with context.')],
  s7l3: [match('Match each modeling word to its meaning.', [['Fact table', 'Events, like orders'], ['Dimension table', 'Describes things, like products'], ['Star schema', 'Facts in the middle'], ['Measure', 'Recalculates with filters']], 'Facts are events; dimensions describe them.')],
  // Stage 9
  s9l3: [tf('Checking AI output:', [['AI can invent functions that don\'t exist', true], ['If AI sounds confident, it\'s correct', false], ['Compare totals before and after a JOIN', true]], 'Verify everything AI writes.')],
  // Stage 10
  s10l2: [match('Match each metric to its formula.', [['CAC', 'Spend ÷ new customers'], ['Churn', 'Lost ÷ customers at start'], ['AOV', 'Revenue ÷ orders'], ['Conversion', 'Buyers ÷ visitors']], 'These show up in every business review.')],
  // Stage 11
  s11l3: [match('Match each Git word to its meaning.', [['Branch', 'Your own working copy'], ['Commit', 'A saved snapshot'], ['Pull request', 'Ask for review'], ['Merge', 'Combine into main']], 'Branch → commit → PR → merge.')],
  // Stage 12
  s12l1: [match('Match each marketing metric to its formula.', [['CTR', 'Clicks ÷ impressions'], ['CPC', 'Spend ÷ clicks'], ['ROAS', 'Revenue ÷ ad spend']], 'Ratios are the language of marketing.')],
  // Stage 13 (projects)
  s13l1: [tf('Café review: true or false?', [['Monday had the most revenue', true], ['Tea is the top morning drink', false], ['A good review ends with a recommendation', true]], 'Facts first, then a clear next step.')],
  // Career
  s8l3: [build('Build the STAR order.', ['Situation', '→', 'Task', '→', 'Action', '→', 'Result'], ['Reason', 'Summary'], 'Set the scene, your goal, what YOU did, the result.')],
};

// More rounds with the newer game types. Merged into GAMES (lessons can have several games).
const MORE: Record<string, Step[]> = {
  s1x3: [sort('Numbers or words?', ['Quantitative (numbers)', 'Qualitative (words)'], [['4 out of 5 stars', 0], ['"The coffee was too bitter"', 1], ['Age: 34', 0], ['Favorite color: purple', 1], ['Visits this month: 12', 0]], 'Numbers you can measure vs. descriptions in words.')],
  s1z2: [sort('Drop, fill or flag?', ['Drop the row', 'Fill a value', 'Flag as unknown'], [['3 of 10,000 rows missing at random', 0], ['Sales on a closed day are blank (should be 0)', 1], ['City is missing, but the order is real', 2]], 'Pick the option that keeps the truth intact.')],
  s2l6: [odd('Which reference is NOT locked?', ['A1', '$A$1', '$B$2', '$C$9'], 'Only A1 has no $ signs, so it shifts when copied.')],
  s2l7: [spot('This IF formula shows an error. Tap the bug.', ['=IF(', 'B2>5', ',', 'Big', ',', '"Small"', ')'], 3, '"Big"', 'Text answers need quotes, like "Big".')],
  s3l3: [chartpick('Tap the most consistent shop (smallest standard deviation).', 'Standard deviation of daily sales', [['Shop A', 1.5], ['Shop B', 45], ['Shop C', 12]], 'Shop A', 'Small SD = sales stay close to the average every day.')],
  s3x1: [chartpick('Tap the outlier.', 'Daily orders', [['Mon', 52], ['Tue', 48], ['Wed', 55], ['Thu', 210], ['Fri', 50]], 'Thu', 'Thursday is about 4× the other days. Investigate before deleting!')],
  s4l3: [spot('This query fails. Tap the bug.', ['SELECT', '*', 'FROM', 'sales', 'WHERE', 'drink', '=', 'Latte'], 7, "'Latte'", 'Text values need single quotes in SQL.')],
  s4l7: [spot('This query is missing something. Tap the bug.', ['SELECT', 'drink,', 'SUM(price)', 'FROM', 'sales', 'GROUP', 'drink'], 5, 'GROUP BY', "It's GROUP BY: two words.")],
  s4l8: [sort('WHERE or HAVING?', ['WHERE (rows)', 'HAVING (groups)'], [['price > 5', 0], ['COUNT(*) > 2', 1], ["day = 'Mon'", 0], ['SUM(price) > 10', 1]], 'WHERE filters rows before grouping; HAVING filters groups after.')],
  s4x8: [spot('This query returns nothing. Tap the bug.', ['SELECT', '*', 'FROM', 'users', 'WHERE', 'referrer', '=', 'NULL'], 6, 'IS', '= NULL never matches anything. Use IS NULL.')],
  s5l2: [chartpick('Tap the best-selling drink.', 'Drinks sold this week', [['Latte', 42], ['Iced Latte', 35], ['Cold Brew', 28], ['Mocha', 19], ['Tea', 11]], 'Latte', 'The longest bar wins: 42.')],
  s5l4: [odd('Which one is a weak chart choice?', ['A pie chart with 9 slices', 'A sorted bar chart of 9 products', 'A line chart of monthly sales', 'A scatter plot of price vs. sales'], 'Nine slices are hard to compare. Sorted bars are clearer.')],
  s5x2: [chartpick('Where do most orders fall? Tap it.', 'Order sizes (count of orders)', [['$0–3', 40], ['$3–6', 120], ['$6–9', 60], ['$9–12', 15], ['$12+', 5]], '$3–6', '120 orders: the tallest bin.')],
  s6l2: [spot('This line crashes. Tap the problem.', ['total', '=', '"5"', '+', '5'], 2, '5', 'Text plus a number is a TypeError. Use the number 5.')],
  s6l6: [spot('This filter has a bug. Tap it.', ['df[df["drink"]', '=', '"Latte"]'], 1, '==', 'Comparisons use ==. A single = stores a value.')],
  s7m3: [odd('Which one is NOT a cloud data warehouse?', ['Excel', 'BigQuery', 'Snowflake', 'Databricks'], 'Excel is a spreadsheet; the others hold company-sized data in the cloud.')],
  s7l1: [sort('BI tool or data warehouse?', ['BI tool (shows data)', 'Warehouse (stores data)'], [['Power BI', 0], ['Looker Studio', 0], ['Tableau', 0], ['BigQuery', 1], ['Snowflake', 1]], 'Warehouses store the data; BI tools show it.')],
  s9l5: [sort('Safe to paste into a public AI tool?', ['Safe', 'Keep private'], [['Column names', 0], ['A made-up sample row', 0], ['Customer emails', 1], ['Employee salaries', 1], ['A database password', 1]], 'Structure is fine; real or secret data stays private.')],
  s10l2: [sort('Cost or value?', ['Cost of winning customers', 'Value customers bring'], [['CAC', 0], ['Ad spend', 0], ['LTV', 1], ['Average order value', 1]], 'Healthy businesses keep value well above cost (LTV at least 3× CAC).')],
  s11l5: [sort('Which check catches each problem?', ['Freshness', 'Volume', 'Schema'], [["Yesterday's data never loaded", 0], ['Only 800 rows instead of 50,000', 1], ['Column "amount" was renamed', 2]], 'Freshness = did it load; volume = how much; schema = did the shape change.')],
  s12l3: [odd('Which is NOT a P&L (finance) number?', ['Click-through rate', 'Revenue', 'COGS', 'Gross profit'], 'CTR is a marketing metric.')],
  s13l3: [chartpick('Tap the channel with the best ROAS.', 'ROAS by channel', [['Social', 2.5], ['Search', 4], ['Email', 7]], 'Email', 'Email returns 7 for every 1 spent.')],
  s8l2: [odd('Which resume bullet is the weak one?', ['Responsible for reports', 'Cut reporting time 80% with a Looker Studio dashboard', 'Found $12K a year in savings with SQL', 'Built a churn analysis used by 3 teams'], 'Strong bullets show action + tool + result.')],
};
for (const [k, v] of Object.entries(MORE)) GAMES[k] = [...(GAMES[k] ?? []), ...v];
