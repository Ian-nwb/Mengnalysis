import { bl, code, ex, L, list, mc, ord, rc, rec, reflect, sql } from '../build';

// Stage 11: Industry Workflows: the tools real data teams use day to day.
export const stage11 = [
  L('s11l1', 11, 'Parquet and columnar storage', 5, [
    ex('Why SELECT * costs money', 'CSV stores data row by row as plain text: big, slow, and no data types. Parquet stores data column by column, compressed, with types built in. Warehouses work the same way: reading 2 columns means scanning only those 2 columns.', list([
      'CSV: easy to open, but large, slow, and everything is text',
      'Parquet: small and fast, keeps types (dates stay dates)',
      'Columnar = pick fewer columns → scan less → pay less',
    ])),
    mc('Why is SELECT order_id, amount cheaper than SELECT * in a warehouse?', ['Columnar storage only reads the columns you ask for', 'Fewer rows are returned', 'It\'s not cheaper'], 'Columns you skip are never read at all.'),
    mc('Which format keeps ZIP codes as text and dates as dates automatically?', ['Parquet', 'CSV', 'Plain .txt'], 'Types are stored inside the file.'),
  ], [rc('Columnar file format used by data teams:', ['Parquet', 'CSV', 'DOCX'])]),

  L('s11l2', 11, 'DuckDB and Polars', 5, [
    ex('Big data on your laptop', 'DuckDB runs SQL directly on local CSV or Parquet files, very fast, with no server. Polars is a lightning-fast pandas alternative with "lazy" DataFrames that plan the work before running it.', code("import duckdb\nduckdb.sql(\"SELECT drink, SUM(price) FROM 'sales.parquet' GROUP BY drink\")")),
    mc('You have a 3 GB Parquet file and no cloud warehouse. Fastest way to query it with SQL?', ['DuckDB', 'Open it in Excel', 'Email it to IT'], 'DuckDB reads files directly with SQL.'),
    mc('Polars "lazy" mode means...', ['It plans the whole query first, then runs it efficiently', 'It\'s slow on purpose', 'It skips errors'], 'Planning first avoids wasted work.'),
  ], [rc('Run SQL directly on a local Parquet file with...', ['DuckDB', 'Looker Studio', 'Mail merge'])]),

  L('s11l3', 11, 'Git for analysts', 6, [
    ex('Version control for queries', 'Git tracks every change to your SQL and Python files, so you can see who changed what, and undo mistakes. GitHub hosts the files online for the team.', list([
      'Repository (repo): the project folder Git tracks',
      'Branch: your own copy to work on safely',
      'Commit: a saved snapshot with a message ("Fix revenue double count")',
      'Pull request (PR): asking the team to review and merge your changes',
    ])),
    ord('Order a typical change.', ['Create a branch', 'Edit the SQL model', 'Commit with a clear message', 'Open a pull request', 'Merge after review'], 'Nobody edits production directly. Changes go through review.'),
    mc('Best commit message?', ['Exclude refunds from revenue model', 'stuff', 'update'], 'Say what changed and why, so future you understands.'),
  ], [rc('Asking teammates to review and merge your change:', ['Pull request', 'Commit', 'Clone'])]),

  L('s11l4', 11, 'Code review', 4, [
    ex('A second pair of eyes', 'In a PR, a teammate reads your SQL before it goes live. They check logic, JOINs, filters, naming and tests. Reviewing others\' code is also one of the fastest ways to learn.'),
    mc('A reviewer asks "why did revenue double after your JOIN?" Best response?', ['Check for duplicate rows and fix it, then thank them', 'Ignore it and merge', 'Delete the PR'], 'Reviews catch bugs before the CEO does.'),
    mc('Reviewing a teammate\'s PR, you should be...', ['Specific and kind', 'Harsh', 'Silent'], '"This JOIN may duplicate orders; maybe use DISTINCT?" beats "wrong".'),
  ], [rc('Code review happens in a...', ['Pull request', 'Dashboard', 'CSV'])]),

  L('s11l5', 11, 'Data observability', 6, [
    ex('Catch broken pipelines early', 'Observability tools watch data health automatically, so a blank dashboard never surprises the CEO.', list([
      'Freshness: did yesterday\'s data actually load?',
      'Volume: 50,000 rows usually… only 800 today? Alert!',
      'Schema drift: an engineer renamed "amount" to "total_amount", breaking every query using it',
    ])),
    mc('Every dashboard shows zero sales for yesterday. First suspect?', ['A freshness problem: the data didn\'t load', 'Nobody bought anything', 'The colors'], 'Check the pipeline before announcing a crisis.'),
    mc('Queries suddenly fail with "no such column: amount". This is...', ['Schema drift', 'A volume anomaly', 'Seasonality'], 'The table changed shape underneath you.'),
    bl('A sudden drop in row count is a ___ anomaly.', ['volume', 'color', 'pivot'], 'Too few (or too many) rows = something broke.'),
  ], [rc('"Did yesterday\'s data load?" is a ___ check.', ['Freshness', 'Volume', 'Schema'])]),

  L('s11l6', 11, 'Lineage and data catalogs', 5, [
    ex('Follow the data', 'Lineage shows how data flows: upstream (where did this column come from?) and downstream (what breaks if I change this table?). Catalogs like DataHub, Atlan and Alation store lineage plus descriptions and owners.', rec('A lineage chain', [
      ['Upstream', 'raw.shopify_orders'],
      ['Model', 'stg_orders → fct_revenue'],
      ['Downstream', '12 dashboards, incl. "CEO Weekly"'],
    ])),
    mc('You want to change fct_revenue. What do you check first?', ['Downstream lineage: which dashboards use it', 'The table\'s color', 'Nothing'], 'Know who you\'ll affect before you edit.'),
    mc('"Where does this weird column come from?" Look...', ['Upstream in the lineage graph', 'Downstream', 'In the chart legend'], 'Trace it back to its source.'),
  ], [rc('Finding which dashboards depend on a table means looking...', ['Downstream', 'Upstream', 'Sideways'])]),

  L('s11l7', 11, 'Product analytics and events', 6, [
    ex('Every click is an event', 'Tech companies track user actions as events with properties. Tools like Amplitude, Mixpanel and PostHog turn them into funnels and retention charts without writing SQL each time.', rec('A tracking plan entry', [
      ['Event', 'checkout_completed'],
      ['Properties', 'plan_type, cart_value, coupon_used'],
      ['When', 'Payment succeeds'],
    ])),
    mc('Good event name?', ['user_signed_up', 'click3', 'Event'], 'object_action, past tense, consistent everywhere.'),
    mc('Why write a tracking plan before engineers add events?', ['So everyone names and fires events the same way', 'To slow things down', 'It\'s a legal form'], 'Messy event names = messy analysis forever.'),
  ], [rc('Amplitude, Mixpanel and PostHog are...', ['Product analytics tools', 'Data warehouses', 'Spreadsheets'])]),

  L('s11l8', 11, 'GA4, UTMs and attribution', 6, [
    ex('Where did visitors come from?', 'UTM parameters tag links so Google Analytics 4 (GA4) knows the source.', list([
      'utm_source=instagram (where)',
      'utm_medium=social (what type)',
      'utm_campaign=summer_sale (which campaign)',
      'GA4 can export raw events to BigQuery for SQL analysis',
    ])),
    ex('Attribution', 'A customer saw an Instagram ad, later clicked an email, then bought. Who gets credit? First-touch credits Instagram; last-touch credits the email. Different models tell different stories.'),
    mc('Last-touch attribution gives credit to...', ['The final click before purchase', 'The first ad they saw', 'Everyone equally'], 'Last touch = last step.'),
    mc('Which part of a UTM says "which campaign"?', ['utm_campaign', 'utm_source', 'utm_medium'], 'source = where, medium = type, campaign = which promo.'),
  ], [rc('First-touch attribution credits...', ['The first interaction', 'The last click', 'Nobody'])]),

  L('s11l9', 11, 'Modern notebooks: Hex, Sigma, Count', 4, [
    ex('SQL + Python + charts in one link', 'Hex and Count are collaborative notebooks where SQL cells, Python cells and interactive charts live together and share as one link. Sigma looks like a spreadsheet but runs on Snowflake or BigQuery underneath.'),
    mc('You want a teammate to see your SQL, Python and charts together, live. Use...', ['A collaborative notebook like Hex', 'Five email attachments', 'A screenshot'], 'One link, always up to date.'),
    mc('Sigma feels like a spreadsheet but...', ['Runs on the cloud warehouse', 'Only works offline', 'Can\'t do formulas'], 'Spreadsheet skills + warehouse power.'),
  ], [rc('Notebook tool mixing SQL and Python cells:', ['Hex', 'Paint', 'Notepad'])]),

  L('s11l10', 11, 'AI inside the warehouse', 5, [
    ex('Classify text with SQL', 'Warehouses now have built-in AI functions (like Snowflake\'s AI_CLASSIFY or BigQuery\'s AI functions) that can label thousands of support tickets or reviews right inside a query.', code("SELECT ticket_id,\n  AI_CLASSIFY(message, ['billing', 'bug', 'feature request']) AS topic\nFROM support_tickets")),
    ex('Audit before you trust', 'Spot-check AI labels: read 20 random rows yourself, compare counts before and after JOINs, and test edge cases (empty messages, other languages). Never send AI-labeled numbers to leadership unchecked.'),
    mc('AI labeled 10,000 tickets. Before reporting "40% are billing issues" you...', ['Spot-check a random sample by hand', 'Report it immediately', 'Delete the labels'], 'Verification is the analyst\'s job.'),
  ], [rc('Before trusting AI-labeled data, always...', ['Spot-check a random sample', 'Round the numbers', 'Add colors'])]),

  L('s11l11', 11, 'Boss level: trace the broken KPI', 8, [
    ex('Your case', 'The "Avg Large Drink Price" KPI on the CEO dashboard shows nothing since this morning. Lineage: raw.sales → stg_sales → kpi_large_price → CEO dashboard. Let\'s find and fix it.'),
    mc('Freshness and volume checks on raw.sales are fine. Where next?', ['Look at recent changes to the models in the lineage', 'Restart the CEO\'s laptop', 'Delete the dashboard'], 'Data is arriving, so a change downstream probably broke it.'),
    ex('Found it', 'Yesterday\'s PR changed the KPI query to WHERE size = \'large\'. But the data says \'Large\' with a capital L, and text matching is exact, so zero rows match.'),
    sql('Fix the KPI: write the corrected query for the average price of Large drinks.', 'coffee', "SELECT AVG(price) FROM sales WHERE size = 'Large'", "WHERE size = 'Large' (capital L)", 'One capital letter brought the KPI back. That\'s real-world debugging!'),
    mc('Which data test would have caught this before the CEO noticed?', ['A test that the KPI is not_null / has rows', 'A color test', 'No test can'], 'Add the test so it never happens again.'),
    reflect('Write your pull request summary for the team.', "Fixes the empty Avg Large Drink Price KPI. Yesterday's change matched size = 'large', but the data uses 'Large', so no rows matched. Restored the correct value and added a not_null test so a blank KPI fails the build instead of reaching the dashboard."),
  ], [rc('A KPI went blank after a code change. Check...', ['Recent changes in its lineage', 'The weather', 'Font sizes'])]),
];
