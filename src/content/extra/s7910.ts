import { bl, code, ex, L, line, list, mc, ord, rc, reflect, rec } from '../build';

// Stage 7: Data Warehousing & Modern Stack (fluent, not engineer-level)
export const stage7m = [
  L('s7m1', 7, 'From app to dashboard', 5, [
    ex('The data pipeline', 'At real companies, data flows through a pipeline before anyone builds a chart.', list([
      'Sources: the app database, Stripe (payments), Shopify (store), ads',
      'Ingestion: tools copy that data into one place',
      'Warehouse: a giant cloud database holding everything',
      'Transformation: raw tables become clean, tested models',
      'BI: dashboards and reports read the clean models',
    ])),
    ord('Put the pipeline in order.', ['Sources', 'Ingestion', 'Warehouse', 'Transformation', 'Dashboards'], 'Source → load → store → clean → show.'),
    mc('Where do analysts usually run their SQL?', ['The warehouse', 'The live app database', 'The dashboard'], 'Querying the live app database could slow the app for real users!'),
  ], [rc('A giant cloud database for analysis is a...', ['Data warehouse', 'Spreadsheet', 'CRM'])]),

  L('s7m2', 7, 'ETL vs. ELT', 4, [
    ex('Two orders of the same steps', 'ETL = Extract, Transform, Load (clean BEFORE loading, the older way). ELT = Extract, Load, Transform (load raw data first, clean INSIDE the warehouse). Modern cloud warehouses are powerful, so ELT is now the norm.'),
    mc('Raw data is loaded first, then cleaned with SQL in the warehouse. That\'s...', ['ELT', 'ETL', 'DAX'], 'Load before Transform.'),
    bl('In ELT, the T happens inside the ___.', ['warehouse', 'spreadsheet', 'email'], 'Which is why analysts\' SQL skills matter so much.'),
  ], [rc('Modern stacks usually do...', ['ELT', 'ETL only', 'Neither'])]),

  L('s7m3', 7, 'Cloud warehouses', 6, [
    ex('Meet the big three', 'Snowflake, Google BigQuery and Databricks hold company data in the cloud. Unlike a laptop database, storage and compute (the processing power) are separate, so they can scan billions of rows.'),
    ex('Queries cost real money', 'Many warehouses charge by data scanned or compute time. SELECT * on a 5-terabyte table can cost real dollars every time it runs!', rec('Cheaper habits', [
      ['Select only needed columns', 'SELECT order_id, amount, not SELECT *'],
      ['Filter by date partitions', "WHERE order_date >= '2026-06-01'"],
      ['Preview with LIMIT', 'or use the free preview tab'],
    ])),
    mc('Why avoid SELECT * on huge tables?', ['It scans everything and costs money', 'It\'s a syntax error', 'It deletes data'], 'Pick only the columns you need.'),
    mc('Which is a cloud data warehouse?', ['BigQuery', 'Excel', 'Tableau'], 'Snowflake and Databricks are the others.'),
  ], [rc('In cloud warehouses, scanning more data costs...', ['More money', 'Nothing', 'Less money'])]),

  L('s7m4', 7, 'dbt: clean, tested models', 6, [
    ex('SQL with superpowers', 'dbt (data build tool) lets analysts write SELECT statements that become clean tables ("models"). Models build on each other, and dbt runs them in the right order.', list([
      'Staging models: lightly clean raw tables (rename, fix types)',
      'Mart models: business-ready tables (orders, customers) for dashboards',
    ])),
    ex('ref() links models', 'Instead of hardcoding table names, dbt uses Jinja templating.', code("select customer_id, sum(amount) as revenue\nfrom {{ ref('stg_orders') }}\ngroup by customer_id")),
    mc('What does {{ ref(\'stg_orders\') }} do?', ['Points to another dbt model and sets the build order', 'Deletes a table', 'Makes a chart'], 'dbt figures out dependencies from refs.'),
    mc('Staging vs. mart models:', ['Staging cleans raw data; marts are ready for business use', 'They\'re the same', 'Marts are raw data'], 'raw → staging → marts → dashboards.'),
  ], [rc('dbt models that are ready for dashboards:', ['Marts', 'Staging', 'Raw'])]),

  L('s7m5', 7, 'Data tests', 5, [
    ex('Catch bugs before the boss does', 'dbt can test data automatically every time models build.', list([
      'unique: no duplicate order_id values',
      'not_null: every order has a customer_id',
      'accepted_values: status is only "paid", "refunded" or "pending"',
      'relationships: every orders.customer_id exists in customers',
    ])),
    mc('Two rows share the same order_id. Which test fails?', ['unique', 'not_null', 'accepted_values'], 'IDs should never repeat.'),
    mc('Why automate tests?', ['Problems are caught before reaching dashboards', 'Tests make queries faster', 'They\'re required by law'], 'Wrong numbers erode trust fast.'),
  ], [rc('Test that every row has a value:', ['not_null', 'unique', 'accepted_values'])]),

  L('s7m6', 7, 'Ingestion and Reverse ETL', 5, [
    ex('Data in, data out', 'Ingestion tools (Fivetran, Airbyte) copy data from apps like Stripe and Shopify into the warehouse automatically. Reverse ETL tools (Hightouch, Census) push modeled data BACK out, like sending a "VIP customers" list to the email marketing tool.'),
    mc('Copying Shopify orders into BigQuery every hour is...', ['Ingestion (ELT)', 'Reverse ETL', 'A pivot table'], 'Into the warehouse = ingestion.'),
    mc('Sending a "likely to churn" list from the warehouse to the CRM is...', ['Reverse ETL', 'Ingestion', 'Data validation'], 'Out of the warehouse, into business tools.'),
  ], [rc('Pushing warehouse data back into business tools:', ['Reverse ETL', 'Ingestion', 'Staging'])]),

  L('s7m7', 7, 'Semantic layers', 5, [
    ex('One definition of Revenue', 'Finance says revenue is $1.2M, Marketing says $1.4M, Product says $1.3M. Why? Different formulas. A semantic layer (dbt Semantic Layer, LookML in Looker, Cube) defines each metric ONCE, and every tool uses that definition.'),
    mc('Three teams show three revenue numbers. A semantic layer...', ['Defines revenue once for everyone', 'Picks the biggest number', 'Deletes two dashboards'], 'One source of truth for metrics.'),
    mc('Looker\'s semantic layer language is...', ['LookML', 'DAX', 'Jinja'], 'LookML defines dimensions and measures for Looker.'),
  ], [rc('Defining a metric once for all tools:', ['Semantic layer', 'Staging model', 'Reverse ETL'])]),

  L('s7m8', 7, 'Boss level: the stack interview', 6, [
    ex('Your case', 'An interviewer asks: "Walk me through how a Shopify order ends up in our revenue dashboard." Let\'s build your answer.'),
    ord('Order the journey.', ['Shopify records the order', 'Fivetran loads it into Snowflake', 'dbt cleans it into an orders mart', 'Power BI shows revenue'], 'Source → ingestion → warehouse + dbt → BI.'),
    mc('They ask: "How do you keep warehouse costs down?"', ['Select only needed columns and filter by date', 'Always SELECT *', 'Run queries twice'], 'Cost-aware analysts are loved by data teams.'),
    mc('"Finance and Marketing disagree on revenue. What would you suggest?"', ['Agree on one definition in a semantic layer', 'Use Finance\'s number silently', 'Average them'], 'Define once, use everywhere.'),
    reflect('Explain to a non-technical manager how an online order reaches the dashboard.', 'When someone orders online, the order is copied automatically into our central data storage. Then it\'s cleaned and double-checked, and the dashboard reads that clean version, so everyone sees the same trusted numbers each morning.'),
  ], [rc('Shopify → Fivetran → Snowflake → dbt → ...', ['BI dashboard', 'Raw CSV', 'Email'])]),
];

// Stage 9: AI-Assisted Analytics
export const stage9 = [
  L('s9l1', 9, 'AI as your analysis buddy', 4, [
    ex('A helper, not a replacement', 'Modern analysts use AI assistants to write first drafts of SQL and Python, explain errors, and brainstorm. But YOU check the logic and own the answer.'),
    mc('Best way to use AI as an analyst?', ['Draft with it, then verify everything', 'Copy its answers straight into reports', 'Never use it'], 'Speed from AI + judgment from you.'),
    mc('Who is responsible if an AI-written query is wrong in your report?', ['You', 'The AI', 'Nobody'], 'Your name is on the analysis.'),
  ], [rc('AI-written code should always be...', ['Verified by you', 'Trusted blindly', 'Deleted'])]),

  L('s9l2', 9, 'Prompting for SQL', 5, [
    ex('Context is everything', 'AI can\'t see your database. Tell it the tables, columns and exactly what you want.', list([
      'Weak: "write sql for top customers"',
      'Strong: "Table orders(order_id, customer_id, amount, order_date). Write SQL for the top 5 customers by total amount in 2026, highest first."',
    ])),
    mc('What makes the strong prompt better?', ['Table names, columns, time frame and sort order', 'It\'s longer', 'It says please'], 'Specific inputs → correct outputs.'),
    mc('The AI used a column "total_price" that doesn\'t exist. You...', ['Tell it the real column names and ask again', 'Rename your table', 'Trust it'], 'AI fills gaps with guesses. Give it the facts.'),
  ], [rc('A good AI prompt for SQL includes...', ['Table and column names', 'Your password', 'Nothing extra'])]),

  L('s9l3', 9, 'Spotting AI hallucinations', 6, [
    ex('Confident and wrong', 'AI can invent functions, columns or facts and sound totally sure. Common slips: made-up Excel functions, wrong date functions for your database, JOINs that duplicate rows.'),
    ex('Your verification checklist', 'Check before you trust.', list([
      'Run it on a tiny sample you can check by hand',
      'Compare row counts before and after JOINs',
      'Check totals against a number you already know',
      'Look up any function you\'ve never seen',
    ])),
    mc('AI suggests =SUMBYCOLOR(A1:A10). You\'ve never heard of it. You...', ['Check if it exists before using it', 'Use it in the report', 'Assume it\'s new'], 'It doesn\'t exist in standard Excel. Classic hallucination!'),
    mc('After an AI-written JOIN, total revenue doubled. Likely cause?', ['The JOIN duplicated rows', 'Sales doubled', 'Rounding'], 'Always compare totals before and after a JOIN.'),
  ], [rc('AI confidently inventing things is called...', ['Hallucination', 'Normalization', 'Inference'])]),

  L('s9l4', 9, 'Debugging with AI', 4, [
    ex('Paste the error, not the data', 'Share the error message and your code (not the real data) and ask "why does this fail, and how do I fix it?" Ask it to explain the fix, so you learn instead of copying.'),
    mc('Your pandas code gives KeyError: \'prcie\'. Best AI prompt?', ['Share the code + error and ask what it means', 'Paste the full customer dataset', 'Ask it to rewrite everything'], 'Small, safe, specific.'),
    ord('A healthy AI debugging loop.', ['Read the error yourself first', 'Ask AI with code + error', 'Understand the fix', 'Test it'], 'Learn from every fix.'),
  ], [rc('When debugging with AI, share...', ['Code and error message', 'Real customer data', 'Passwords'])]),

  L('s9l5', 9, 'AI and data privacy', 5, [
    ex('The golden rule', 'Never paste sensitive company data (customer names, emails, salaries, secrets, passwords) into public AI tools. That data may be stored or used to train models. Use fake sample data, describe the structure instead, or use company-approved AI tools.'),
    mc('You want help analyzing a customer list with emails. Safest approach?', ['Describe the columns and use made-up sample rows', 'Paste the full list', 'Email the list to the AI company'], 'Structure, not secrets.'),
    mc('Which is safe to share with a public AI tool?', ['Column names and a fake example row', 'Real salary data', 'Your database password'], 'If in doubt, leave it out.'),
  ], [rc('Before pasting data into public AI, remove...', ['Sensitive and personal data', 'Column names', 'Formatting'])]),

  L('s9l6', 9, 'Automating cleanup with AI', 5, [
    ex('Let AI write the repetitive parts', 'Ask AI for a reusable cleaning script (Python, Apps Script or SQL) for a messy pattern you see every week, then review it line by line, test it on a copy, and save it.', code('# Prompt: "Write pandas code to trim spaces, title-case\n# the city column, and drop duplicate order_ids."\ndf["city"] = df["city"].str.strip().str.title()\ndf = df.drop_duplicates(subset="order_id")')),
    mc('Before running an AI cleanup script on the real file, you...', ['Test it on a copy', 'Run it on the original', 'Skip reading it'], 'Raw data stays sacred (Stage 0!).'),
  ], [rc('Test AI-written cleaning code on...', ['A copy of the data', 'The original only', 'Nothing'])]),

  L('s9l7', 9, 'Boss level: the AI-assisted report', 6, [
    ex('Your case', 'You\'re asked for "monthly revenue by product" from a new table. You use AI to draft the SQL. Let\'s do it the professional way.'),
    mc('What do you give the AI?', ['Table and column names, plus what you want', 'A real export of the table', 'Just "make a report"'], 'Context without secrets.'),
    mc('The AI query returns revenue 40% higher than Finance\'s number. First step?', ['Check the JOINs and filters for duplicates', 'Send it anyway', 'Blame Finance'], 'Big gaps usually mean duplicated rows or missing filters.'),
    mc('You found the bug: refunds weren\'t excluded. Now the numbers match. Best final step?', ['Note your definition and checks in the report', 'Delete your notes', 'Never use AI again'], 'Documented assumptions build trust.'),
    reflect('Tell your manager how you used AI for this report and how you made sure the numbers are right.', 'I used an AI assistant to write a first draft of the query, then checked it myself. My total was too high at first because refunds were included, so I fixed that and confirmed the result now matches Finance\'s number. No customer data was shared with the AI.'),
  ], [rc('AI numbers don\'t match a trusted source. First...', ['Investigate JOINs and filters', 'Publish anyway', 'Average them'])]),
];

// Stage 10: Business & Domain Analytics
export const stage10 = [
  L('s10l1', 10, 'Funnel analysis', 5, [
    ex('Where do people drop off?', 'A funnel tracks users through steps toward a goal.', line('Visitors at each step', [['Visit', 10000], ['Sign up', 2500], ['Add to cart', 900], ['Purchase', 450]])),
    mc('Which step loses the most people?', ['Visit → Sign up', 'Add to cart → Purchase', 'None'], '75% leave before signing up (10,000 → 2,500).'),
    mc('Cart → purchase conversion is...', ['50%', '5%', '90%'], '450 ÷ 900 = 50%.'),
    bl('Overall conversion (visit → purchase) is ___.', ['4.5%', '45%', '0.45%'], '450 ÷ 10,000 = 4.5%.'),
  ], [rc('A funnel shows...', ['Drop-off between steps', 'Revenue by month', 'Customer names'])]),

  L('s10l2', 10, 'Unit economics: CAC and LTV', 6, [
    ex('Is each customer worth it?', 'CAC (customer acquisition cost) = marketing spend ÷ new customers. LTV (lifetime value) = how much a customer brings in over their whole relationship.', rec('Bean There Coffee', [
      ['Marketing spend', '$5,000'],
      ['New customers', '250'],
      ['CAC', '$20'],
      ['LTV', '$5/visit × 2 visits/month × 12 months = $120'],
    ])),
    mc('Is LTV $120 vs. CAC $20 healthy?', ['Yes, LTV is 6× CAC', 'No', 'Can\'t tell'], 'A common rule of thumb: LTV should be at least 3× CAC.'),
    mc('$9,000 spend brought 150 customers. CAC?', ['$60', '$6', '$1,350'], '9,000 ÷ 150 = 60.'),
  ], [rc('CAC = marketing spend ÷ ...', ['New customers', 'Revenue', 'Employees'])]),

  L('s10l3', 10, 'Churn and retention', 5, [
    ex('Keeping customers', 'Churn rate = customers lost ÷ customers at the start of the period. Retention is the opposite: the % who stay. For subscriptions, MRR (monthly recurring revenue) shows the money side.'),
    mc('Start: 400 subscribers. Lost: 20. Monthly churn?', ['5%', '20%', '95%'], '20 ÷ 400 = 5%.'),
    mc('Retention in that month?', ['95%', '5%', '80%'], '100% − 5% churn.'),
    mc('Small monthly churn adds up because...', ['It compounds over months', 'It doesn\'t', 'Customers come back automatically'], '5% a month loses almost half your customers in a year!'),
  ], [rc('Churn = customers lost ÷ ...', ['Customers at start', 'New customers', 'Revenue'])]),

  L('s10l4', 10, 'RFM segmentation', 5, [
    ex('Not all customers are alike', 'RFM scores customers on Recency (how recently they bought), Frequency (how often) and Monetary (how much). High on all three = champions. Low recency but once high = at risk.', list([
      'Champions: bought recently, often, a lot → reward them',
      'At risk: used to buy often, not lately → win them back',
      'New: bought recently, only once → welcome them',
    ])),
    mc('Customer bought 20 times last year but not in 4 months. Segment?', ['At risk', 'Champion', 'New'], 'Great history, gone quiet. Time for a win-back offer!'),
    mc('What does the M in RFM stand for?', ['Monetary', 'Monthly', 'Mobile'], 'How much they spend.'),
  ], [rc('RFM = Recency, Frequency, ...', ['Monetary', 'Metrics', 'Months'])]),

  L('s10l5', 10, 'Seasonality and forecasting', 5, [
    ex('Patterns that repeat', 'Sales often follow weekly cycles (busy weekends) and yearly ones (holidays, summer).', line('Iced drink sales by month', [['Jan', 120], ['Mar', 180], ['May', 320], ['Jul', 410], ['Sep', 260], ['Nov', 140]])),
    mc('Iced drinks peak in...', ['Summer (July)', 'Winter', 'Never'], 'A classic yearly pattern.'),
    ex('A simple forecast', 'A baseline forecast: take the same period last year and apply the recent growth rate. "Last July was 410; we\'re up 10% this year → expect about 450."'),
    mc('Comparing this July to last July (not to June) avoids...', ['Seasonal effects', 'All errors', 'Data cleaning'], 'Year-over-year comparisons remove seasonality.'),
  ], [rc('Yearly repeating patterns are called...', ['Seasonality', 'Churn', 'Granularity'])]),

  L('s10l6', 10, 'Root cause analysis', 6, [
    ex('"Why did sales drop yesterday?"', 'Panic helps nobody. Work through a checklist, in order.', list([
      '1. Is it real? Check for tracking bugs or broken data loads',
      '2. External events? Holiday, outage, weather, news',
      '3. Where? Split by segment: platform, region, product, new vs. returning',
      '4. Which part of the metric? Traffic, conversion or order size (metric tree!)',
    ])),
    ord('Order the root-cause checklist.', ['Check for data or tracking bugs', 'Look for external events', 'Split by segment', 'Find which metric part moved'], 'Rule out data bugs first. They\'re surprisingly common!'),
    mc('Sales dropped only on Android, only after an app update. Likely cause?', ['A bug in the Android update', 'The economy', 'Seasonality'], 'Segmenting found it in minutes.'),
  ], [rc('First step when a metric drops:', ['Check for data/tracking bugs', 'Email the CEO', 'Redesign the dashboard'])]),

  L('s10l7', 10, 'Boss level: the Monday mystery', 7, [
    ex('Your case', 'Monday morning: "Online revenue dropped 18% last week!" You have one hour. Let\'s solve it.'),
    mc('Step 1?', ['Check whether the data pipeline loaded fully', 'Announce a crisis', 'Change prices'], 'A half-loaded table looks exactly like a revenue drop.'),
    mc('Data is fine. Traffic is normal, AOV is normal. So the drop is in...', ['Conversion rate', 'Traffic', 'Nothing'], 'Metric tree: Revenue = Traffic × Conversion × AOV.'),
    mc('Conversion fell only for checkout on iPhone, starting Tuesday. Next step?', ['Tell the product team: possible checkout bug on iOS since Tuesday', 'Wait a month', 'Blame marketing'], 'Specific, actionable and fast.'),
    reflect('Write your 2–3 sentence update for the leadership team.', 'Revenue dropped 18% last week because iPhone customers had trouble completing checkout starting Tuesday. Other devices were normal. The product team is fixing it, and we expect revenue to recover once it\'s resolved.'),
  ], [rc('Revenue fell but traffic and AOV are normal. Check...', ['Conversion', 'Seasonality', 'Logo'])]),
];
