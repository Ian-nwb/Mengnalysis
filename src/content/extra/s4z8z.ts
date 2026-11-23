import { ex, fx, L, list, mc, ord, rc, sql } from '../build';

// Stage 4: advanced SQL (verified against src/sql/datasets.ts)
export const stage4z = [
  L('s4z1', 4, 'SQL++: LAG and LEAD', 6, [
    ex('Compare with the previous row', 'LAG looks at the row before; LEAD looks at the row after. Perfect for day-over-day change.', fx('SELECT day, sales, sales - LAG(sales) OVER (ORDER BY day) AS change FROM daily_sales', 'How much sales went up or down each day')),
    sql('Show day, sales and the previous day\'s sales (call it prev).', 'app', 'SELECT day, sales, LAG(sales) OVER (ORDER BY day) AS prev FROM daily_sales', 'LAG(sales) OVER (ORDER BY day) AS prev', 'Day 1 has no previous day, so prev is empty (NULL).'),
    sql('Now show day and the change from the previous day (sales minus LAG).', 'app', 'SELECT day, sales - LAG(sales) OVER (ORDER BY day) AS change FROM daily_sales', 'sales - LAG(sales) OVER (ORDER BY day) AS change', 'Day-over-day change, a dashboard favorite!'),
  ], [rc('Look at the previous row with...', ['LAG', 'LEAD', 'PREV'])]),

  L('s4z2', 4, 'SQL++: percent of total', 5, [
    ex('A window over everything', 'SUM(...) OVER () adds up the whole table without grouping, so every row can compare itself to the total.', fx('SELECT drink, price, price * 100.0 / SUM(price) OVER () AS pct FROM sales', 'Each sale\'s share of total revenue')),
    sql('For each drink, show total price and its % of all revenue (call it pct).', 'coffee', 'SELECT drink, SUM(price) AS total, SUM(price) * 100.0 / SUM(SUM(price)) OVER () AS pct FROM sales GROUP BY drink', 'SUM(price) * 100.0 / SUM(SUM(price)) OVER () after GROUP BY drink', 'Window over grouped results: a classic interview trick. Latte leads with about 26%.'),
  ], [rc('Total of the whole table, on every row:', ['SUM(x) OVER ()', 'SUM(x) GROUP ALL', 'TOTAL(x)'])]),

  L('s4z3', 4, 'SQL++: NTILE buckets', 4, [
    ex('Split into equal groups', 'NTILE(4) splits ordered rows into 4 equal buckets (quartiles). Great for "top 25% of customers".', fx('SELECT title, plays, NTILE(4) OVER (ORDER BY plays DESC) AS quartile FROM songs', 'Quartile 1 = the most played songs')),
    sql('Put songs into 2 halves by plays (most played = 1). Show title and the half.', 'music', 'SELECT title, NTILE(2) OVER (ORDER BY plays DESC) AS half FROM songs', 'NTILE(2) OVER (ORDER BY plays DESC) AS half', 'Top half vs. bottom half in one line.'),
  ], [rc('Split rows into equal buckets with...', ['NTILE', 'RANK', 'GROUP'])]),

  L('s4z4', 4, 'SQL++: UNION', 4, [
    ex('Stack results', 'UNION stacks the results of two queries (same number of columns) and removes duplicates. UNION ALL keeps duplicates and is faster.', fx("SELECT name FROM customers WHERE city = 'Austin' UNION SELECT name FROM customers WHERE city = 'Denver'", 'Austin and Denver customers in one list')),
    sql("List customer names from Austin, then from Chicago, using UNION.", 'shop', "SELECT name FROM customers WHERE city = 'Austin' UNION SELECT name FROM customers WHERE city = 'Chicago'", "Two SELECTs joined by UNION", 'UNION = stack vertically. JOIN = connect side by side.'),
    mc('UNION vs. UNION ALL:', ['UNION removes duplicates; UNION ALL keeps them', 'They\'re identical', 'UNION ALL removes more'], 'Use UNION ALL when duplicates are impossible or wanted.'),
  ], [rc('Stack two query results vertically:', ['UNION', 'JOIN', 'MERGE'])]),

  L('s4z5', 4, 'SQL++: EXISTS and NOT EXISTS', 5, [
    ex('Does a match exist?', 'EXISTS checks whether a subquery finds any row. NOT EXISTS is a clean way to find "who never did something".', fx('SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)', 'Customers with no orders: Ana')),
    sql('Find names of customers who HAVE ordered at least once, using EXISTS.', 'shop', 'SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)', 'WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)', 'No duplicates, even though Maria ordered 3 times. That\'s why EXISTS is handy.'),
  ], [rc('Find customers who never ordered with...', ['NOT EXISTS', 'IS EMPTY', 'NO JOIN'])]),

  L('s4z6', 4, 'SQL++: gaps and islands', 6, [
    ex('Find streaks in data', 'A famous pattern: find runs of consecutive values ("islands"). Trick: subtract ROW_NUMBER from the day. Consecutive days get the SAME difference, so you can group by it.', list([
      'days 3,4,5,9,10 → row numbers 1,2,3,4,5',
      'day − row number → 2,2,2,5,5',
      'group by that → two streaks: 3–5 and 9–10',
    ])),
    mc('Why does day − ROW_NUMBER() find streaks?', ['Consecutive days keep the same difference', 'It sorts the data', 'It removes NULLs'], 'Each break in the run changes the difference.'),
    mc('A real-world use of gaps & islands:', ['Finding a user\'s login streaks', 'Counting rows', 'Rounding prices'], 'Yes, exactly like your streak in this app!'),
  ], [rc('Gaps & islands groups by...', ['day − ROW_NUMBER()', 'day + 1', 'COUNT(*)'])]),

  L('s4z7', 4, 'SQL++: recursive CTEs', 5, [
    ex('Queries that loop', 'A recursive CTE refers to itself, so it can walk a hierarchy (employee → manager → manager…) or generate a series of dates.', fx('WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 5) SELECT x FROM n', '1, 2, 3, 4, 5')),
    mc('A good use for a recursive CTE:', ['Walking an org chart from employee to CEO', 'Summing one column', 'Renaming a table'], 'Hierarchies and series are the classic uses.'),
    ord('A recursive CTE has these parts.', ['Starting row (anchor)', 'UNION ALL', 'Step that refers to itself', 'A stop condition'], 'Always include a stop condition, or it loops forever!'),
  ], [rc('A CTE that refers to itself is...', ['Recursive', 'Correlated', 'Materialized'])]),
];

// Stage 8: deeper Power BI
export const stage8z = [
  L('s8z1', 8, 'Power BI: relationships', 5, [
    ex('Connecting tables', 'In Model view, drag a key (Products[id]) onto its match (Sales[product_id]). Most relationships are one-to-many: one product, many sales. Filters flow from the "one" side to the "many" side.'),
    mc('Products (one) → Sales (many). Filtering Category = "Plants" filters...', ['Sales for plant products', 'Nothing', 'The Products table only'], 'Filters flow along the relationship.'),
    mc('Two tables can\'t be related because the keys don\'t match types (text vs. number). Fix?', ['Change the types in Power Query', 'Delete one table', 'Use a pie chart'], 'Keys must match exactly, types included.'),
  ], [rc('Most Power BI relationships are...', ['One-to-many', 'Many-to-many', 'None'])]),

  L('s8z2', 8, 'DAX patterns you\'ll use daily', 6, [
    ex('The essential five', 'These cover most dashboards.', list([
      'Total Sales = SUM(Sales[Amount])',
      'Avg Order = DIVIDE([Total Sales], DISTINCTCOUNT(Sales[OrderID]))  (DIVIDE avoids divide-by-zero errors)',
      'Category = RELATED(Products[Category])  (fetch from the "one" side)',
      'Profit = SUMX(Sales, Sales[Qty] * (Sales[Price] - Sales[Cost]))  (row-by-row math)',
      'Sales LY = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Dates[Date]))',
    ])),
    mc('Why DIVIDE instead of / in DAX?', ['It handles divide-by-zero gracefully', 'It\'s faster to type', 'No reason'], 'No more error cards on your dashboard.'),
    mc('Row-by-row math, then add up the results:', ['SUMX', 'SUM', 'RELATED'], 'X functions iterate over rows.'),
    mc('Compare with the same period last year:', ['SAMEPERIODLASTYEAR', 'LASTYEAR()', 'YEARAGO'], 'Wrap it in CALCULATE.'),
  ], [rc('DAX function that avoids divide-by-zero errors:', ['DIVIDE', 'SAFE', 'IFERROR only'])]),

  L('s8z3', 8, 'Power BI visuals that shine', 5, [
    ex('Beyond bar charts', 'Power BI visuals people love.', list([
      'Card / multi-row card: KPIs',
      'Matrix: a pivot table with drill-down',
      'Slicers: filter buttons, dropdowns or date ranges',
      'Bookmarks: save views, make "buttons" that switch them',
      'Drill-through: right-click a product to open its detail page',
      'Tooltips pages: a mini chart when hovering',
    ])),
    mc('Show a pivot-style table with expandable rows:', ['Matrix', 'Card', 'Gauge'], 'Matrix = PivotTable cousin.'),
    mc('Right-click a store to open its detail page:', ['Drill-through', 'Bookmark', 'Slicer'], 'Great for "show me more about this one".'),
  ], [rc('Power BI\'s pivot-table-like visual:', ['Matrix', 'Card', 'Map'])]),

  L('s8z4', 8, 'Power BI Service', 5, [
    ex('From your laptop to the company', 'Publish from Desktop to the Power BI Service (the website). Reports live in workspaces; an App bundles reports for an audience; a gateway lets the cloud refresh data from company servers; scheduled refresh keeps it fresh.'),
    ord('Order: sharing a report.', ['Build in Power BI Desktop', 'Publish to a workspace', 'Set scheduled refresh', 'Share it in an App'], 'Desktop → Service → refresh → audience.'),
    mc('The data lives on a server inside the office. What lets the cloud refresh it?', ['An on-premises data gateway', 'A USB stick', 'A slicer'], 'The gateway is the bridge.'),
  ], [rc('Bundle reports for an audience in Power BI Service:', ['App', 'Gateway', 'Dataset'])]),
];
