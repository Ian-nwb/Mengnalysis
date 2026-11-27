// One-page cheat sheets, unlocked by beating each stage's boss level.
export type Sheet = { stage: number; title: string; sections: { heading: string; lines: string[] }[] };

export const SHEETS: Sheet[] = [
  {
    stage: 0,
    title: 'Data Foundations',
    sections: [
      { heading: 'File types', lines: ['.csv: plain text, commas between columns', '.tsv: tabs between columns', '.xlsx: Excel workbook (formulas, many tabs)', '.json: nested data from apps and APIs'] },
      { heading: 'Keys', lines: ['Primary key: unique ID for each row (customer_id)', 'Foreign key: points to another table\'s ID', 'Keys make XLOOKUP, JOIN and data models work'] },
      { heading: 'Golden rules', lines: ['Know what ONE row means (granularity)', 'Keep IDs, ZIP codes and phone numbers as text', 'Protect PII: names, emails, addresses, phone numbers'] },
    ],
  },
  {
    stage: 1,
    title: 'Thinking in Data',
    sections: [
      { heading: 'The analysis process', lines: ['Ask → Prepare → Process → Analyze → Share → Act'] },
      { heading: 'Good questions', lines: ['WHAT are we measuring?', 'For WHO?', 'Over WHEN?'] },
      { heading: 'Words to know', lines: ['Row = one thing · Column = one detail', 'Metric = number you calculate', 'Dimension = how you slice it', 'Qualitative = words · Quantitative = numbers'] },
    ],
  },
  {
    stage: 2,
    title: 'Google Sheets & Excel',
    sections: [
      { heading: 'Must-know formulas', lines: ['=SUM / AVERAGE / COUNT / COUNTA / MIN / MAX', '=IF(test, yes, no) · =IFS(...) · =IFERROR(x, backup)', '=COUNTIFS / SUMIFS (sum range first!)', '=XLOOKUP(find, look in, return)', '=UNIQUE · =FILTER · =SORT · =QUERY (Sheets)'] },
      { heading: 'Cleaning', lines: ['=TRIM (spaces) · =PROPER (Title Case)', 'Remove duplicates: Data menu', 'Split text to columns · Flash Fill (Ctrl+E)'] },
      { heading: 'Shortcuts', lines: ['Ctrl+Z undo · Ctrl+Arrow jump · Ctrl+Shift+Arrow select', 'F4 adds $ (lock a cell: $A$1)', 'Ctrl+Shift+L filters (Excel)'] },
    ],
  },
  {
    stage: 3,
    title: 'Statistics',
    sections: [
      { heading: 'Center', lines: ['Mean: pulled by outliers', 'Median: the middle; use with skewed data', 'Mode: most common value'] },
      { heading: 'Spread', lines: ['Range = max − min', 'IQR = Q3 − Q1', 'SD: small = consistent · 68-95-99.7 rule', 'z = (value − mean) ÷ SD; |z| > 3 = outlier'] },
      { heading: 'Traps', lines: ['Correlation ≠ causation (watch for confounders)', 'Sampling and survivorship bias', 'Simpson\'s paradox: check inside groups', 'Statistically significant ≠ useful'] },
    ],
  },
  {
    stage: 4,
    title: 'SQL',
    sections: [
      { heading: 'Write it in this order', lines: ['SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT'] },
      { heading: 'SQL runs it in this order', lines: ['FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT'] },
      { heading: 'Patterns', lines: ['Top N: GROUP BY + ORDER BY ... DESC + LIMIT', 'Who\'s missing: LEFT JOIN + WHERE id IS NULL', 'Buckets: CASE WHEN ... THEN ... END', 'Rank: RANK() OVER (PARTITION BY ... ORDER BY ...)', 'Dedupe: ROW_NUMBER() ... keep row 1', 'NULL: use IS NULL / COALESCE, never = NULL'] },
    ],
  },
  {
    stage: 5,
    title: 'Which chart should I use?',
    sections: [
      { heading: 'Pick by question', lines: ['Compare categories → sorted bar chart', 'Change over time → line chart', 'Relationship → scatter plot', 'Distribution → histogram or box plot', 'Parts of a whole (2–3) → stacked bar or pie', 'Actual vs. target → bullet chart · Key number → KPI card'] },
      { heading: 'Make it honest and clear', lines: ['Bars start at zero', 'One highlight color, the rest gray', 'Title = the takeaway', 'Label directly; cut chart junk'] },
      { heading: 'Tell the story', lines: ['What → So what → Now what', 'SCQA: Situation, Complication, Question, Answer'] },
    ],
  },
  {
    stage: 6,
    title: 'Python & pandas',
    sections: [
      { heading: 'Look', lines: ['df.head() · df.shape · df.columns · df.describe()', 'df["col"].value_counts()', 'df.isna().sum()'] },
      { heading: 'Do', lines: ['df[df["price"] > 5] (filter)', 'df.groupby("drink")["price"].sum()', 'df.sort_values("price", ascending=False)', 'df.merge(other, on="id") (JOIN)', 'df.pivot_table(index=..., columns=..., values=..., aggfunc=...)', 'pd.to_datetime(df["date"])'] },
      { heading: 'Errors', lines: ['Read the LAST line first', 'KeyError = column name typo', 'TypeError = mixing text and numbers'] },
    ],
  },
  {
    stage: 7,
    title: 'Modern Data Stack',
    sections: [
      { heading: 'The pipeline', lines: ['Sources (apps, Stripe, Shopify) → ingestion (Fivetran, Airbyte) → warehouse (BigQuery, Snowflake) → dbt models → dashboards', 'Reverse ETL (Hightouch): warehouse → marketing tools'] },
      { heading: 'Warehouse manners', lines: ['Select only the columns you need (never SELECT * on huge tables)', 'Filter on partitions (dates) to save money'] },
      { heading: 'dbt', lines: ['Staging models clean raw data; marts are ready for BI', '{{ ref(\'orders\') }} links models', 'Tests: unique, not_null'] },
    ],
  },
  {
    stage: 8,
    title: 'Dashboards & BI',
    sections: [
      { heading: 'Layout', lines: ['Top: 3–5 KPI cards with comparisons', 'Middle: main trend', 'Bottom: breakdowns and details', 'Always show "last updated"'] },
      { heading: 'Model', lines: ['Star schema: facts in the middle, dimensions around', 'Measures recalculate with every filter'] },
      { heading: 'Tools', lines: ['Power BI (+ Excel, DAX, Power Query)', 'Looker Studio (+ Google Sheets)', 'Tableau (Tableau Public for portfolios)'] },
    ],
  },
  {
    stage: 9,
    title: 'AI-Assisted Analytics',
    sections: [
      { heading: 'Good prompts', lines: ['Give context: table names, columns, what you want', 'Ask for one step at a time', 'Ask it to explain its code'] },
      { heading: 'Always verify', lines: ['Run it on a tiny sample you can check by hand', 'Check row counts before and after', 'Watch for invented columns and functions'] },
      { heading: 'Privacy', lines: ['Never paste customer data or secrets into public AI tools', 'Use fake or sample data, or company-approved tools'] },
    ],
  },
  {
    stage: 10,
    title: 'Business Metrics',
    sections: [
      { heading: 'Formulas', lines: ['Revenue = Traffic × Conversion × AOV', 'CAC = marketing spend ÷ new customers', 'LTV ≈ avg order × orders per year × years', 'Churn = customers lost ÷ customers at start', 'Healthy: LTV at least 3× CAC'] },
      { heading: 'Analyses', lines: ['Funnel: where do people drop off?', 'Cohorts: do newer customers stay longer?', 'RFM: Recency, Frequency, Monetary'] },
      { heading: '"Why did it drop?"', lines: ['1. Tracking bug?', '2. External event (holiday, outage)?', '3. One segment or platform?', '4. Which part of the metric moved?'] },
    ],
  },
  {
    stage: 11,
    title: 'Industry Workflows',
    sections: [
      { heading: 'Files & speed', lines: ['Parquet: columnar, compressed, typed. Beats CSV', 'DuckDB: SQL on local files · Polars: fast DataFrames', 'Select fewer columns → scan less → pay less'] },
      { heading: 'Git flow', lines: ['Branch → edit → commit (clear message) → pull request → review → merge'] },
      { heading: 'Data health', lines: ['Freshness: did it load?', 'Volume: row count normal?', 'Schema drift: columns renamed?', 'Lineage: upstream = source, downstream = what breaks'] },
      { heading: 'Product analytics', lines: ['Events: object_action (checkout_completed) + properties', 'UTMs: source, medium, campaign', 'Attribution: first-touch vs. last-touch', 'Spot-check AI labels before reporting'] },
    ],
  },
  {
    stage: 12,
    title: 'Industry Metrics',
    sections: [
      { heading: 'Marketing', lines: ['CTR = clicks ÷ impressions', 'CPC = spend ÷ clicks', 'ROAS = revenue ÷ ad spend'] },
      { heading: 'Finance', lines: ['Gross profit = revenue − COGS', 'Margin = profit ÷ revenue', 'Variance = actual − budget'] },
      { heading: 'E-commerce & SaaS', lines: ['Cart abandonment = (carts − orders) ÷ carts', 'AOV = revenue ÷ orders', 'End MRR = start + new + expansion − contraction − churn', 'NRR > 100% = existing customers grow'] },
      { heading: 'People & operations', lines: ['Attrition = leavers ÷ average headcount', 'On-time % = on-time ÷ total deliveries', 'Inventory turnover = COGS ÷ average inventory', 'Keep people and health data aggregated and private'] },
    ],
  },
  {
    stage: 13,
    title: 'Project Playbook',
    sections: [
      { heading: 'Every project', lines: ['Brief: question + who will use it', 'Save raw data; clean a copy', 'Cleaning log: what changed and why', 'Analyze with the simplest tool', '1–3 charts with takeaway titles', 'One clear recommendation'] },
      { heading: 'Useful patterns', lines: ['Top N: GROUP BY + ORDER BY DESC + LIMIT', 'Second highest: LIMIT 1 OFFSET 1', 'Growth: (new − old) ÷ old', 'Baseline forecast: average of last 3 periods'] },
      { heading: 'Sharing', lines: ['README: question, finding, recommendation first', 'GitHub or Tableau Public link on your resume'] },
    ],
  },
  {
    stage: 14,
    title: 'Career',
    sections: [
      { heading: 'Portfolio', lines: ['3 projects: spreadsheet, SQL, dashboard', 'Clear question → clean work → recommendation'] },
      { heading: 'Interviews', lines: ['STAR: Situation, Task, Action, Result', 'Think out loud in SQL tests', 'Case: clarify first, then break it down'] },
      { heading: 'Offers', lines: ['Apply at about 60–70% match', 'Research salaries; negotiating is normal'] },
    ],
  },
];
