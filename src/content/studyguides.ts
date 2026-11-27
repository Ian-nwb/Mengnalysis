// Study guides: a longer, calm read for each stage, to review the big ideas in one place.
export type Guide = { stage: number; title: string; intro: string; sections: { heading: string; body: string[] }[]; takeaways: string[] };

export const STUDY_GUIDES: Guide[] = [
  {
    stage: 0,
    title: 'How data is stored',
    intro: 'Before any formula or query, an analyst asks: where does this data live, and what does one row mean?',
    sections: [
      { heading: 'Files you will meet', body: ['CSV files are plain text: each line is a row, and commas separate the columns. They open anywhere but keep no formulas or types. XLSX files are Excel workbooks with tabs and formulas. JSON is the nested label-and-value format that apps and APIs send.', 'When a CSV opens in Excel, the app guesses column types. That is how ZIP codes lose their leading zeros and long IDs turn into scientific notation. Importing (Data → From Text/CSV) lets you set those columns to Text.'] },
      { heading: 'Granularity', body: ['Granularity is what one row represents. One row per order is different from one row per item in an order. If an order total is copied onto every item row, summing it counts the same money several times. Always ask "what is one row?" before you add anything up.'] },
      { heading: 'Keys connect tables', body: ['A primary key uniquely identifies each row, like customer_id. A foreign key in another table points to it, like orders.customer_id. Lookups, SQL joins and dashboard relationships all work by matching these keys.'] },
      { heading: 'Respect personal data', body: ['Names, emails, phone numbers and addresses are PII. Use only what you need, keep it secure, and remove or replace it before sharing analysis.'] },
    ],
    takeaways: ['Keep raw files untouched and work on copies', 'Check granularity before summing', 'Keys connect tables', 'Protect PII'],
  },
  {
    stage: 1,
    title: 'Thinking like an analyst',
    intro: 'Tools change, but the way analysts think stays the same: start with a clear question and end with a decision.',
    sections: [
      { heading: 'Good questions', body: ['A strong question says what you measure, for whom, and over what time. "Did weekend sales grow from May to June?" tells you exactly which data to pull.'] },
      { heading: 'The analysis process', body: ['Ask → Prepare → Process → Analyze → Share → Act. Preparing means finding the data; processing means cleaning it; sharing means telling the story so people can act.'] },
      { heading: 'Metrics and dimensions', body: ['A metric is a number you calculate, like revenue. A dimension is how you slice it, like by city or month. A metric tree breaks a big number into parts: Revenue = Traffic × Conversion × Average order value. When revenue moves, the tree shows which part moved.', 'Prefer actionable metrics (weekly active users) over vanity metrics (total signups ever), and agree on definitions before you measure.'] },
    ],
    takeaways: ['Specific questions lead to clear answers', 'Clean data before analyzing', 'Agree on definitions first', 'Use metric trees to find what moved'],
  },
  {
    stage: 2,
    title: 'Spreadsheets with confidence',
    intro: 'Google Sheets and Excel share almost all their formulas. Learn the patterns once and use them everywhere.',
    sections: [
      { heading: 'Formulas and references', body: ['Formulas start with =. Point at cells instead of typing numbers, so results update when data changes. Copying a formula shifts its references; add $ (like $E$1) to lock a cell.'] },
      { heading: 'The everyday functions', body: ['SUM, AVERAGE, COUNT, MIN and MAX summarize. IF makes decisions. SUMIFS and COUNTIFS summarize only matching rows. XLOOKUP brings values from another table using a key. IFERROR keeps errors off your reports.'] },
      { heading: 'Summaries without formulas', body: ['Pivot tables group and total thousands of rows in seconds: put categories in Rows and numbers in Values. Add slicers for clickable filters and "Show values as" for percentages.'] },
      { heading: 'Working like a pro', body: ['Keep raw data, calculations and dashboards on separate tabs. Use data validation to prevent typos, Power Query to repeat cleaning steps, and Apps Script to automate Google Sheets tasks like emailing a report every morning.'] },
    ],
    takeaways: ['Use cell references, not typed numbers', 'SUMIFS + XLOOKUP + pivot tables cover most work', 'Separate raw, calc and dashboard tabs', 'Automate what you repeat'],
  },
  {
    stage: 3,
    title: 'Statistics without fear',
    intro: 'Statistics helps you say how sure you are, and protects you from being fooled by noise.',
    sections: [
      { heading: 'Center and spread', body: ['The mean is pulled by outliers; the median is not. Spread tells you how much values vary: range, IQR and standard deviation. Two shops with the same average can behave very differently.'] },
      { heading: 'Relationships', body: ['Correlation measures how two numbers move together, from −1 to +1. It does not prove cause. A hidden confounder, like hot weather, can make two things rise together.'] },
      { heading: 'Experiments', body: ['A/B tests split people randomly so the change is the only difference. A p-value under 0.05 is commonly called significant, but also check whether the effect is big enough to matter, and report a confidence interval.'] },
      { heading: 'Traps to avoid', body: ['Sampling bias (asking only some people), survivorship bias (only seeing winners), and Simpson\'s paradox (a trend that flips when groups are combined). Always ask: who is missing from this data?'] },
    ],
    takeaways: ['Use the median with skewed data', 'Correlation is not causation', 'Random experiments prove cause', 'Significant is not the same as important'],
  },
  {
    stage: 4,
    title: 'SQL from first query to window functions',
    intro: 'SQL is the most requested analyst skill. It reads almost like English once you know the order of the pieces.',
    sections: [
      { heading: 'The core pattern', body: ['SELECT columns FROM table WHERE rows match GROUP BY categories HAVING group rules ORDER BY sort LIMIT n. Behind the scenes, the database runs FROM and WHERE first, then GROUP BY, then SELECT.'] },
      { heading: 'Joining tables', body: ['JOIN connects rows using matching keys. LEFT JOIN keeps every row from the first table, so it can find "who never ordered" with WHERE right_table.id IS NULL. Always compare row counts before and after a join to catch duplicates.'] },
      { heading: 'Real-world messiness', body: ['NULL is not equal to anything, so use IS NULL and COALESCE. WHERE col != \'x\' silently drops NULL rows. Group dates by month with DATE_TRUNC in warehouses (strftime in SQLite). Remove duplicates by keeping ROW_NUMBER() = 1 within each group.'] },
      { heading: 'Window functions', body: ['Window functions calculate across rows while keeping every row: RANK for leaderboards, LAG for day-over-day change, SUM(...) OVER () for percent of total, and moving averages with ROWS BETWEEN 6 PRECEDING AND CURRENT ROW.'] },
    ],
    takeaways: ['Know the clause order', 'Check row counts after joins', 'Treat NULL carefully', 'Window functions keep every row'],
  },
  {
    stage: 5,
    title: 'Charts that tell the truth',
    intro: 'A chart should answer one question at a glance, honestly.',
    sections: [
      { heading: 'Pick by question', body: ['Compare categories with a sorted bar chart, show change over time with a line, show relationships with a scatter plot, and show distributions with a histogram. Use a big number (KPI) when one value matters most.'] },
      { heading: 'Design for clarity', body: ['Start bars at zero. Use one highlight color and keep the rest calm. Label data directly instead of using far-away legends. Remove chart junk like 3D effects and heavy gridlines.'] },
      { heading: 'Tell the story', body: ['Titles should state the takeaway: "Sales doubled since January". Structure presentations as What → So what → Now what, or SCQA: Situation, Complication, Question, Answer. Match the depth to your audience.'] },
    ],
    takeaways: ['Chart type follows the question', 'Honest axes and one highlight', 'Titles say the insight', 'Lead with the answer'],
  },
  {
    stage: 6,
    title: 'Python and pandas for analysts',
    intro: 'Python repeats your analysis on any size of data, and pandas makes tables feel like spreadsheets in code.',
    sections: [
      { heading: 'Python basics', body: ['Variables store values, lists hold several values (counting from 0), dictionaries map keys to values, if makes decisions, for repeats, and def creates reusable functions. Read error messages from the last line up.'] },
      { heading: 'pandas essentials', body: ['Load with pd.read_csv, look with head, shape and describe, filter with df[df["price"] > 5], summarize with groupby, combine with merge, and reshape with pivot_table and melt.'] },
      { heading: 'Cleaning at scale', body: ['Find missing values with isna().sum(), remove duplicates with drop_duplicates, tidy text with .str.strip() and .str.title(), and convert dates with pd.to_datetime so they sort and group correctly.'] },
    ],
    takeaways: ['Notebooks (Colab, Jupyter) are your workspace', 'groupby is the pivot table of pandas', 'merge is JOIN', 'Clean first, always'],
  },
  {
    stage: 7,
    title: 'The modern data stack',
    intro: 'At most companies, data travels a pipeline before you ever query it.',
    sections: [
      { heading: 'From app to dashboard', body: ['Sources (the app, payments, the online store) → ingestion tools (Fivetran, Airbyte) → a cloud warehouse (BigQuery, Snowflake, Databricks) → transformation with dbt → dashboards. Modern stacks load raw data first and clean it inside the warehouse (ELT).'] },
      { heading: 'Cost-aware SQL', body: ['Warehouses often charge by data scanned. Select only the columns you need and filter by date partitions instead of running SELECT * on huge tables.'] },
      { heading: 'Trustworthy models', body: ['dbt turns SELECT statements into models: staging models clean raw tables, mart models are ready for business use. Tests like unique and not_null catch problems early. A semantic layer defines each metric once so every team sees the same number.'] },
    ],
    takeaways: ['Know the pipeline end to end', 'Query only what you need', 'Test your data', 'One definition per metric'],
  },
  {
    stage: 8,
    title: 'Dashboards people actually use',
    intro: 'A good dashboard answers a few important questions quickly and stays fresh on its own.',
    sections: [
      { heading: 'Layout', body: ['Put 3–5 KPIs at the top with comparisons (vs. last month or target), the main trend in the middle, and breakdowns and details below. Always show when the data was last updated.'] },
      { heading: 'Data models', body: ['Keep events in fact tables and descriptions in dimension tables, linked in a star schema. Measures recalculate with every filter. In Power BI, DAX functions like CALCULATE, DIVIDE and SAMEPERIODLASTYEAR cover most needs.'] },
      { heading: 'Tools', body: ['Power BI pairs with Excel and Power Query. Looker Studio is free and pairs with Google Sheets. Tableau is great for flexible visuals and Tableau Public portfolios. Ask users what decisions they make, then design for that.'] },
    ],
    takeaways: ['KPIs first, details last', 'Star schemas keep things fast', 'Show freshness', 'Design for decisions'],
  },
  {
    stage: 9,
    title: 'Working with AI, safely',
    intro: 'AI assistants speed up analysis when you give them context and verify everything they produce.',
    sections: [
      { heading: 'Prompting', body: ['Give table names, columns, filters and the exact output you want. Ask for one step at a time and ask the AI to explain its code.'] },
      { heading: 'Verifying', body: ['Run AI code on a small sample you can check by hand. Compare totals with a trusted number and row counts before and after joins. Look up any function you have never seen; hallucinated functions are common.'] },
      { heading: 'Privacy', body: ['Never paste customer data, salaries, secrets or passwords into public AI tools. Describe the structure or use made-up sample rows instead, or use company-approved tools.'] },
    ],
    takeaways: ['Context in, better code out', 'Verify before you trust', 'Structure, not secrets', 'You own the final answer'],
  },
  {
    stage: 10,
    title: 'Thinking like the business',
    intro: 'Business analytics connects your numbers to money, customers and decisions.',
    sections: [
      { heading: 'Customer journeys', body: ['Funnels show where people drop off between steps. Cohorts show whether customers who started at the same time keep coming back. RFM groups customers by recency, frequency and money spent.'] },
      { heading: 'Unit economics', body: ['CAC is what it costs to win a customer. LTV is what a customer brings in over time. Churn is the share of customers lost. A healthy business usually has LTV of at least three times CAC.'] },
      { heading: 'When a number drops', body: ['First check for data or tracking problems, then external events, then split by segment (platform, region, product), then use the metric tree to see which part moved.'] },
    ],
    takeaways: ['Funnels find drop-offs', 'LTV ≥ 3× CAC', 'Seasonality: compare year over year', 'Rule out data bugs first'],
  },
  {
    stage: 11,
    title: 'How data teams work',
    intro: 'Modern analysts borrow habits from software teams so that their work is fast, reviewed and reliable.',
    sections: [
      { heading: 'Faster files and tools', body: ['Parquet stores data by column, compressed and typed, so it is smaller and faster than CSV. DuckDB runs SQL on local files, and Polars is a very fast DataFrame library.'] },
      { heading: 'Version control', body: ['Git tracks changes. Work on a branch, commit with clear messages, and open a pull request so a teammate reviews your SQL before it reaches production.'] },
      { heading: 'Keeping data healthy', body: ['Observability checks freshness (did it load?), volume (is the row count normal?) and schema drift (did a column change?). Lineage shows where data comes from and which dashboards depend on it.'] },
      { heading: 'Product analytics', body: ['Events like checkout_completed, with properties, power tools like Amplitude, Mixpanel, PostHog and GA4. UTM tags show where visitors came from, and attribution models decide which touchpoint gets credit.'] },
    ],
    takeaways: ['Branch → commit → pull request', 'Watch freshness, volume and schema', 'Check lineage before changing tables', 'Agree on a tracking plan'],
  },
  {
    stage: 12,
    title: 'Speaking each industry\'s language',
    intro: 'Every industry has a few metrics it lives by. Knowing them helps you ask better questions from day one.',
    sections: [
      { heading: 'Marketing and e-commerce', body: ['CTR (clicks ÷ impressions), CPC (spend ÷ clicks) and ROAS (revenue ÷ ad spend) measure campaigns. Online stores watch conversion rate, average order value, cart abandonment and return rate.'] },
      { heading: 'Finance and subscriptions', body: ['A P&L goes from revenue to gross profit to operating profit; margin is profit ÷ revenue. Variance compares actual with budget. Subscription businesses track MRR and its movements, churn and net revenue retention.'] },
      { heading: 'People, operations and health', body: ['People analytics tracks attrition and hiring, always aggregated for privacy. Operations watches lead time, on-time delivery and inventory turnover. Healthcare operations studies wait times and no-shows using de-identified data.'] },
    ],
    takeaways: ['Learn the 3 core metrics of your target industry', 'Ratios need clear definitions', 'Sensitive data stays aggregated'],
  },
  {
    stage: 13,
    title: 'Working real projects',
    intro: 'Projects are where skills turn into proof. Every project follows the same shape.',
    sections: [
      { heading: 'Start with the brief', body: ['Write the question in one sentence and who will use the answer. A clear brief keeps you from drowning in data.'] },
      { heading: 'Clean and document', body: ['Keep the raw data, clean a copy, and write a short cleaning log: what you removed, filled or fixed, and why.'] },
      { heading: 'Analyze, then decide', body: ['Use the simplest tool that answers the question: a pivot table, a SQL GROUP BY, a moving average. Then turn numbers into one recommendation someone can act on.'] },
      { heading: 'Share it', body: ['Lead with the finding, show one to three clear charts, and mention limits honestly. Put it on GitHub or Tableau Public so it becomes part of your portfolio.'] },
    ],
    takeaways: ['One-sentence brief', 'Keep a cleaning log', 'Simplest tool that works', 'End with a recommendation'],
  },
  {
    stage: 14,
    title: 'From learner to analyst',
    intro: 'Getting hired is about showing your thinking, not knowing everything.',
    sections: [
      { heading: 'Portfolio', body: ['Build about three projects: a spreadsheet analysis, a SQL project and a dashboard. Each should state a question, show clean work and end with a recommendation. Share them on GitHub, Tableau Public or a simple website.'] },
      { heading: 'Applying', body: ['Search many titles (data, business, BI, reporting analyst). Apply when you match about 60–70% of a posting. Write resume bullets as action + tool + result.'] },
      { heading: 'Interviews', body: ['Use STAR stories for behavioral questions, think out loud in SQL tests, clarify before solving case questions, and lead take-home reports with a short summary of findings.'] },
    ],
    takeaways: ['Three strong projects beat many certificates', 'Apply before you feel 100% ready', 'Think out loud', 'Keep learning a little every day'],
  },
];
