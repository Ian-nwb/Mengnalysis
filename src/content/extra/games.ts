import { build, match, tf } from '../build';
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
