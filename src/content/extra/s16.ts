import { chartpick, code, ex, L, list, match, mc, odd, ord, rc, rec, sheet, sort, tf } from '../build';

// Another batch of lessons, mixing explanations with every game type.

// ---------- Stage 0: Data Foundations ----------
export const stage0w = [
  L('s0w1', 0, 'Database data types', 5, [
    ex('Databases are strict', 'Spreadsheets guess types; databases make you choose. The right type keeps data clean and math correct.', list([
      'INTEGER: whole numbers (quantity: 3)',
      'DECIMAL / NUMERIC: exact amounts (price: 4.50)',
      'VARCHAR / TEXT: words ("Latte")',
      'DATE / TIMESTAMP: dates and times (2026-06-01 08:30)',
      'BOOLEAN: true or false (is_member)',
    ])),
    match('Match each type to what it stores.', [['INTEGER', 'Whole numbers like 3'], ['DECIMAL', 'Exact amounts like 4.50'], ['VARCHAR', 'Text like "Latte"'], ['TIMESTAMP', 'A date plus a time']], 'Picking the right type prevents a lot of messy data.'),
    mc('Best type for prices?', ['DECIMAL (exact)', 'VARCHAR (text)', 'BOOLEAN'], "Money needs exact decimals, and text can't be added up."),
  ], [rc('Exact money amounts are stored as...', ['DECIMAL', 'BOOLEAN', 'VARCHAR'])]),

  L('s0w2', 0, 'Reading a data dictionary', 4, [
    ex('The map of a dataset', 'A data dictionary explains every column: what it means, its type, and allowed values. Read it before you analyze.', rec('orders table', [
      ['order_id', 'Unique ID for each order (text)'],
      ['total', 'Order total in USD, after discounts'],
      ['status', 'One of: paid, refunded, pending'],
    ])),
    tf('Data dictionaries: true or false?', [['A data dictionary explains what each column means', true], ['It only lists column names', false], ['It can list allowed values, like paid or refunded', true]], 'Five minutes with the dictionary can save hours of wrong analysis.'),
    mc('"total" says "after discounts". Why does that matter?', ['Revenue sums will already include discounts', 'It doesn\'t matter', 'It means the column is empty'], 'Definitions change the meaning of every number you calculate.'),
  ], [rc('Before analyzing a new table, first read its...', ['Data dictionary', 'Last row', 'File size'])]),

  L('s0w3', 0, 'Spreadsheet or database?', 4, [
    ex('Right tool, right job', 'Spreadsheets are perfect for small, quick, personal work. Databases handle huge data, many users and apps writing at once.'),
    sort('Spreadsheet or database?', ['Spreadsheet', 'Database'], [['A quick budget for one person', 0], ['Millions of app orders', 1], ['A one-off list of 50 contacts', 0], ['Data that many apps write to all day', 1]], 'Size, sharing and safety decide the tool.'),
    mc('Where do companies keep their main sales data?', ['In a database or warehouse', 'In one shared spreadsheet', 'In emails'], 'Analysts then pull what they need into Sheets, Python or a dashboard.'),
  ], [rc('Millions of rows written by apps belong in a...', ['Database', 'Spreadsheet', 'Document'])]),
];

// ---------- Stage 7: Modern Data Stack ----------
export const stage7w = [
  L('s7w1', 7, 'Orchestration: pipelines on a schedule', 5, [
    ex('Who runs everything at 6am?', 'Orchestration tools (Airflow, Dagster, dbt Cloud jobs) run pipeline steps in the right order on a schedule. The plan is a DAG: steps connected by arrows, with no loops.'),
    ord('Order a nightly pipeline.', ['Load raw data', 'Run staging models', 'Run mart models', 'Run data tests', 'Refresh dashboards'], 'Each step waits for the one before it.'),
    mc('Why do tests run before dashboards refresh?', ['So bad data is caught before people see it', 'Tests are faster', 'No reason'], 'Fail the pipeline, not the CEO meeting.'),
  ], [rc('A plan of pipeline steps with arrows and no loops is a...', ['DAG', 'KPI', 'CTE'])]),

  L('s7w2', 7, 'Partitions and clustering', 5, [
    ex('Scan less, pay less', 'Big tables are split into partitions, usually by date. When your WHERE filters on the partition column, the warehouse skips every other day. Clustering sorts data inside partitions (by customer, for example) for even faster filters.'),
    mc('A table is partitioned by order_date. Cheapest query?', ["WHERE order_date >= '2026-06-01'", 'No WHERE at all', 'WHERE the total is above 10'], 'Filtering on the partition column skips the other days entirely.'),
    tf('Partitions: true or false?', [['Partitions split a table into chunks, often by date', true], ['Filtering on the partition column scans less data', true], ['Partitions change your query results', false]], 'Same answers, smaller bill.'),
  ], [rc('Tables are most often partitioned by...', ['Date', 'Color', 'Row count'])]),

  L('s7w3', 7, 'Data contracts', 4, [
    ex('A promise about data', 'A data contract is an agreement between the team that produces data (often engineers) and the teams that use it: column names and types, how fresh it is, what it means, and who owns it. Changes are announced and versioned instead of surprising everyone.'),
    match('Match each part of a data contract.', [['Schema', 'Column names and types'], ['Freshness', 'How often data updates'], ['Owner', 'Who to contact'], ['Versioning', 'A safe way to change it']], 'Contracts turn surprise breakages into planned changes.'),
    mc('Engineers want to rename "amount". With a contract they...', ['Announce and version the change so dashboards keep working', 'Rename it quietly', 'Delete the column'], 'Remember schema drift? Contracts prevent it.'),
  ], [rc('An agreement about a dataset\'s shape and freshness is a...', ['Data contract', 'Data lake', 'Dashboard'])]),

  L('s7w4', 7, 'dbt sources, seeds and docs', 5, [
    ex('More dbt building blocks', 'Sources declare raw tables. Seeds load small CSV files (like a region list) as tables. dbt docs builds a website with descriptions and lineage.', code("select * from {{ source('shop', 'orders') }}")),
    match('Match each dbt feature to its job.', [['source()', 'Points to a raw table'], ['ref()', 'Points to another model'], ['seed', 'A small CSV loaded as a table'], ['dbt docs', 'A website with descriptions and lineage']], 'source = raw in, ref = model to model.'),
    mc('A tiny lookup list of 12 store regions belongs in...', ['A dbt seed', 'A dashboard', 'An email'], 'Seeds keep small reference data versioned with your code.'),
  ], [rc('In dbt, raw tables are declared as...', ['Sources', 'Seeds', 'Marts'])]),
];

// ---------- Stage 9: AI-Assisted Analytics ----------
export const stage9w = [
  L('s9w1', 9, 'Prompt patterns that work', 5, [
    ex('Five ingredients', 'Strong prompts usually include:', list([
      'Role: "You are a careful SQL analyst"',
      'Context: table names, columns, definitions',
      'Task: exactly what you want',
      'Format: "Return only the SQL, then a one-line explanation"',
      'Example: one sample input and output (few-shot prompting)',
    ])),
    ord('Put a strong prompt together, in order.', ['Give context (tables, columns)', 'Describe the task', 'Say the format you want', 'Ask it to explain its answer'], 'Context first, then the ask.'),
    mc('Showing the AI one example input and output is called...', ['Few-shot prompting', 'Hallucination', 'Overfitting'], 'Examples are the fastest way to get the format you want.'),
  ], [rc('Showing examples in a prompt is called...', ['Few-shot prompting', 'Fine-tuning', 'Debugging'])]),

  L('s9w2', 9, 'AI for exploring data', 4, [
    ex('A brainstorming partner', 'AI can suggest questions to explore, code for summary stats, and chart ideas. You run the code and confirm every number yourself.'),
    tf('Exploring with AI: true or false?', [['AI can suggest good questions to explore', true], ['AI summaries never need checking', false], ['Confirm key numbers with your own query', true]], 'Ideas from AI, facts from your data.'),
    mc('AI says "sales grew 40% in June." Next step?', ['Check it with your own query', 'Put it in the report', 'Ask the AI if it is sure'], 'Only your query on real data counts as proof.'),
  ], [rc('AI-suggested numbers should be...', ['Checked with your own query', 'Trusted', 'Rounded up'])]),

  L('s9w3', 9, 'Bias in data and AI', 5, [
    ex('Old data, old patterns', 'Models learn from past data. If past decisions were unfair, a model can repeat them. Analysts check results across groups and write down known gaps.'),
    sort('Good practice or risky?', ['Good practice', 'Risky'], [['Compare results across groups', 0], ['Write down known data gaps', 0], ['Assume old data is fair', 1], ['Hide groups with odd results', 1]], 'Fairness checks are part of doing the job well.'),
    mc('A model approves fewer loans in one neighborhood with similar incomes. You...', ['Flag it and investigate for bias', 'Ignore it', 'Remove that neighborhood from the data'], 'Speaking up about bias is a professional skill.'),
  ], [rc('Models trained on unfair past data can...', ['Repeat unfair patterns', 'Fix themselves', 'Never be biased'])]),
];

// ---------- Stage 10: Business Analytics ----------
export const stage10w = [
  L('s10w1', 10, 'Pricing basics', 5, [
    ex('Price × units', 'Revenue = price × units sold. Raising the price usually sells fewer units; the question is whether total revenue goes up. Price elasticity is how strongly demand reacts to price.'),
    sheet('Revenue at $4 (row 2): price × cups.', [['Price', 'Cups'], [4, 500], [5, 420]], '=A2*B2', 'A2*B2.', '$4 × 500 = $2,000.'),
    sheet('Now revenue at $5 (row 3).', [['Price', 'Cups'], [4, 500], [5, 420]], '=A3*B3', 'A3*B3.', '$5 × 420 = $2,100. Fewer cups, more money!'),
    mc('Demand drops a lot when the price rises a little. That is...', ['High price elasticity', 'Low churn', 'Seasonality'], 'Sensitive customers = elastic demand.'),
  ], [rc('Revenue = price × ...', ['Units sold', 'Costs', 'Customers lost'])]),

  L('s10w2', 10, 'NPS and CSAT', 5, [
    ex('Measuring happiness', 'NPS asks "How likely are you to recommend us?" from 0 to 10. Promoters answer 9–10, passives 7–8, detractors 0–6. NPS = % promoters − % detractors. CSAT is the % of satisfied ratings.'),
    match('Match each score to its group.', [['9–10', 'Promoter'], ['7–8', 'Passive'], ['0–6', 'Detractor']], 'Passives don\'t count in NPS, but they are worth winning over.'),
    sheet('Calculate NPS: % promoters − % detractors.', [['Promoters %', 'Passives %', 'Detractors %'], [50, 30, 20]], '=A2-C2', 'A2 − C2.', 'NPS = 30. Anything above 0 means more fans than critics.'),
  ], [rc('NPS = % promoters − ...', ['% detractors', '% passives', 'Revenue'])]),

  L('s10w3', 10, 'Payback period', 4, [
    ex('When does a customer pay for themselves?', 'Payback period = CAC ÷ monthly profit per customer. Shorter is safer: you get your money back sooner.'),
    sheet('Payback in months: CAC ÷ monthly profit.', [['CAC', 'Monthly profit'], [60, 15]], '=A2/B2', 'A2/B2.', '4 months to earn back the $60.'),
    mc('Payback grew from 4 to 9 months. Likely cause?', ['CAC went up or profit per customer went down', 'More customers stayed', 'Nothing changed'], 'Look at both sides of the fraction.'),
  ], [rc('Payback period = CAC ÷ ...', ['Monthly profit per customer', 'Revenue', 'Churn'])]),

  L('s10w4', 10, 'From test result to decision', 5, [
    ex('Tests need decisions', 'After an A/B test, choose: ship it, test more, or drop it. Weigh the size of the effect, how sure you are, the cost and the risks.'),
    sort('What would you do?', ['Ship it', 'Test more', 'Drop it'], [['+8% sales, clearly significant, cheap to build', 0], ['+0.5%, not significant, small sample', 1], ['−5% sales, clearly significant', 2]], 'Clear win → ship. Unclear → learn more. Clear loss → stop.'),
    mc('A test wins on Android but has no iPhone data. Best step?', ['Ship to Android, test on iPhone separately', 'Ship everywhere', 'Ignore it'], 'Only claim what the data shows.'),
  ], [rc('A clearly significant, sizable win should be...', ['Shipped', 'Ignored', 'Hidden'])]),
];

// ---------- Stage 11: Industry Workflows ----------
export const stage11w = [
  L('s11w1', 11, 'Handling data requests', 5, [
    ex('"Can you pull the numbers?"', 'Most requests start vague. Before you query, clarify: what decision is it for, which metric and definition, what time period, the deadline, and the format.'),
    ord('Order a great request workflow.', ['Ask what decision it supports', 'Agree on the metric and time frame', 'Confirm deadline and format', 'Do the analysis', 'Share with a short summary'], 'Ten minutes of questions saves days of rework.'),
    mc('Your boss asks "Can you get me the numbers?" Best reply?', ['"Sure! Which decision is this for, and for what time period?"', 'Send every table you have', 'Wait until they ask again'], 'Friendly clarifying questions make you look sharp, not slow.'),
  ], [rc('First question for a vague data request:', ['What decision is it for?', 'Which font?', 'How many rows?'])]),

  L('s11w2', 11, 'Documenting your work', 4, [
    ex('Leave a trail', 'Good analysts document: a README (question, data, steps, findings), comments in SQL, assumptions, and a short changelog.'),
    tf('Documentation: true or false?', [['Future you will thank you for a README', true], ['Comments in SQL are a waste of time', false], ['Writing assumptions down builds trust', true]], 'Clear notes make your work reusable and trustworthy.'),
    mc('Where do you note that refunds were excluded?', ['Under "assumptions" in the README or notes', 'Nowhere', 'In the chart color'], 'Every definition choice belongs in writing.'),
  ], [rc('Assumptions like "refunds excluded" belong...', ['In your written notes', 'In your head', 'Nowhere'])]),
];

// ---------- Stage 12: Industry Packs ----------
export const stage12w = [
  L('s12w1', 12, 'Logistics: delivery performance', 5, [
    ex('Getting things there', 'Delivery teams track on-time rate, average delivery time and cost per delivery.'),
    sheet('Average delivery time in days.', [['Order', 'Days'], ['A1', 2], ['A2', 3], ['A3', 5], ['A4', 2]], '=AVERAGE(B2:B5)', 'AVERAGE(B2:B5).', '(2 + 3 + 5 + 2) ÷ 4 = 3 days.'),
    sheet('How many deliveries took more than 2 days?', [['Order', 'Days'], ['A1', 2], ['A2', 3], ['A3', 5], ['A4', 2]], '=COUNTIF(B2:B5,">2")', 'COUNTIF(B2:B5, ">2").', 'Two slow deliveries (3 and 5 days).', ['COUNTIF']),
  ], [rc('Average delivery time uses...', ['AVERAGE', 'COUNT', 'MAX'])]),

  L('s12w2', 12, 'Education analytics', 4, [
    ex('Learning, measured', 'Schools and course platforms track completion rate, engagement (minutes per week) and pass rate. Student data is private, so results are shared as groups.'),
    sheet('Completion rate (row 2): completed ÷ enrolled.', [['Course', 'Enrolled', 'Completed'], ['SQL 101', 200, 120]], '=C2/B2', 'C2/B2.', '0.6 = 60% finished. Not bad for an online course!'),
    mc('Completion drops sharply in week 3 for everyone. Likely cause?', ['A hard or confusing lesson in week 3', 'Students dislike learning', 'It must be a data bug'], 'A drop at the same point for everyone points to the content.'),
  ], [rc('Completion rate = completed ÷ ...', ['Enrolled', 'Passed', 'Teachers'])]),

  L('s12w3', 12, 'Sports analytics', 4, [
    ex('Numbers on the field', 'Teams track win rate, points per game, and home vs. away performance to make game-day decisions.'),
    sheet('Win rate: wins ÷ games.', [['Team', 'Wins', 'Games'], ['Cats', 18, 25]], '=B2/C2', 'B2/C2.', '0.72 = 72% of games won.'),
    odd('Which is NOT a sports performance stat?', ['Cart abandonment', 'Points per game', 'Win rate', 'Shots on target'], 'Cart abandonment is an online store metric.'),
  ], [rc('Win rate = wins ÷ ...', ['Games played', 'Losses', 'Players'])]),
];

// ---------- Stage 13: Real-World Projects ----------
export const stage13w = [
  L('s13w1', 13, 'Project: HR attrition', 6, [
    ex('Your brief', 'HR asks: which team loses the most people, and what should we look into?'),
    sheet('Attrition rate for Sales (row 3): leavers ÷ average headcount.', [['Team', 'Leavers', 'AvgHeadcount'], ['Support', 6, 40], ['Sales', 9, 30], ['Tech', 2, 25]], '=B3/C3', 'B3/C3.', '0.3 = 30% a year. That is high.'),
    chartpick('Tap the team with the highest attrition.', 'Attrition rate (%)', [['Support', 15], ['Sales', 30], ['Tech', 8]], 'Sales', 'Sales loses almost a third of its people each year.'),
    mc('Best next step?', ['Review grouped exit reasons for Sales, keeping people private', 'Blame the Sales manager', 'Do nothing'], 'Find the "why" with care for privacy.'),
  ], [rc('Attrition rate = leavers ÷ ...', ['Average headcount', 'New hires', 'Teams'])]),

  L('s13w2', 13, 'Project: e-commerce returns', 6, [
    ex('Your brief', 'An online clothing store wants to cut returns. Where should they start?'),
    sheet('Return rate for Jeans (row 2): returned ÷ sold.', [['Product', 'Sold', 'Returned'], ['Jeans', 400, 80], ['T-shirts', 900, 45], ['Jackets', 150, 12]], '=C2/B2', 'C2/B2.', '0.2 = 20% of jeans come back.'),
    chartpick('Tap the product with the highest return rate.', 'Return rate (%)', [['Jeans', 20], ['T-shirts', 5], ['Jackets', 8]], 'Jeans', 'Jeans are 4× worse than T-shirts.'),
    mc('Most jean returns say "too small". Recommendation?', ['Improve the size guide and check the sizing', 'Stop selling jeans', 'Raise the price'], 'Fix the cause, keep the product.'),
  ], [rc('Return rate = returned ÷ ...', ['Sold', 'Visitors', 'Products'])]),

  L('s13w3', 13, 'Project: survey results', 6, [
    ex('Your brief', 'Five customers rated the new menu from 1 to 5. The owner wants a quick read.'),
    sheet('Average rating.', [['Response', 'Rating'], ['R1', 5], ['R2', 4], ['R3', 2], ['R4', 5], ['R5', 4]], '=AVERAGE(B2:B6)', 'AVERAGE(B2:B6).', '20 ÷ 5 = 4.0.'),
    sheet('How many people gave 4 or 5 (satisfied)?', [['Response', 'Rating'], ['R1', 5], ['R2', 4], ['R3', 2], ['R4', 5], ['R5', 4]], '=COUNTIF(B2:B6,">=4")', 'COUNTIF(B2:B6, ">=4").', '4 of 5 were satisfied.', ['COUNTIF']),
    mc('Only 5 people answered. How do you present the 4.0 average?', ['As early feedback, mentioning the tiny sample', 'As a final verdict', 'Hide the sample size'], 'Honest about uncertainty, always.'),
  ], [rc('With a tiny sample, results are...', ['Early signals, not proof', 'Final', 'Useless'])]),
];

// ---------- Stage 14: Career ----------
export const stage14w = [
  L('s14w1', 14, 'Writing a project README', 5, [
    ex('Your project\'s front door', 'A great README makes a recruiter understand your project in 30 seconds.', list([
      'Title + one-line summary',
      'The question',
      'The data (source, size, cleaning)',
      'Approach',
      'Key findings, with one chart',
      'Recommendation',
    ])),
    ord('Order the README sections.', ['Title and one-line summary', 'The question', 'The data', 'Approach', 'Findings', 'Recommendation'], 'Lead with the story; details come after.'),
    mc('Recruiters skim a project for about 30 seconds. What must they see first?', ['The question and main finding', 'Your package versions', 'The raw data'], 'Answer first, always.'),
  ], [rc('A README should open with...', ['A one-line summary', 'Installation steps', 'Raw data'])]),

  L('s14w2', 14, 'A mock interview walkthrough', 5, [
    ex('What to expect', 'Most analyst hiring follows a similar path. Knowing it makes each round less scary.'),
    ord('Order a typical hiring process.', ['Recruiter screen', 'Technical test (SQL or Excel)', 'Case study or take-home', 'Team interview', 'Offer'], 'Each round checks something different.'),
    tf('Interview habits: true or false?', [['Thinking out loud helps in technical rounds', true], ['Asking clarifying questions looks weak', false], ['Having questions for them at the end is a good sign', true]], 'Curious, clear and calm wins interviews.'),
    mc('"Any questions for us?" Best reply?', ['"What does success look like in this role after 6 months?"', '"No."', '"How soon can I take vacation?"'], 'Show you care about doing well.'),
  ], [rc('In technical rounds, it helps to...', ['Think out loud', 'Stay silent', 'Rush'])]),
];
