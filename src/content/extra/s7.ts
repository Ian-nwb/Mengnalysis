import { bl, both, ex, fx, L, list, mc, ord, rc } from '../build';

// Extra Stage 7 lessons: Dashboards & BI
export const stage7x = [
  L('s7x1', 8, 'Power BI tour', 5, [
    ex('Three parts', 'Power BI has three main pieces.', list([
      'Power BI Desktop: free Windows app where you build reports',
      'Power Query: the same cleaning tool as in Excel',
      'Power BI Service: the website where reports are shared',
    ])),
    ex('Building a report', 'Get Data → clean in Power Query → build relationships in the model view → drag fields onto visuals.'),
    ord('Order the Power BI workflow.', ['Get data', 'Clean in Power Query', 'Build the model', 'Create visuals', 'Publish and share'], 'This is the same flow at almost every company.'),
  ], [rc('Power BI\'s cleaning tool is...', ['Power Query', 'Power Clean', 'DAX'])]),

  L('s7x2', 8, 'Looker Studio tour', 4, [
    ex('Free and simple', 'Looker Studio (lookerstudio.google.com) connects to Google Sheets, BigQuery and more. Add a data source, then drag charts and controls onto a canvas. Share it like a Google Doc.'),
    mc('Your Sheet updates daily. Does the Looker Studio dashboard update?', ['Yes, it reads the live data', 'No, you rebuild it daily', 'Only if printed'], 'Connected data = automatic updates.'),
    mc('Looker Studio shares like...', ['A Google Doc', 'A printed poster', 'A USB stick'], 'Same sharing buttons you already know.'),
  ], [rc('Looker Studio connects easily to...', ['Google Sheets', 'Paper', 'Photoshop'])]),

  L('s7x3', 8, 'Tableau basics', 4, [
    ex('Drag and drop', 'Tableau splits fields into dimensions (categories, blue) and measures (numbers, green). Drag them onto Rows and Columns to build a chart. Tableau Public is free, and great for portfolios!'),
    mc('In Tableau, "Sales" would be a...', ['Measure', 'Dimension', 'Filter only'], 'Numbers you calculate are measures, just like metrics in Stage 1.'),
    mc('Free place to publish Tableau dashboards for your portfolio:', ['Tableau Public', 'Tableau Secret', 'Excel Online'], 'Recruiters can click and explore your work.'),
  ], [rc('Tableau calls categories...', ['Dimensions', 'Measures', 'Sheets'])]),

  L('s7x4', 8, 'Choosing visuals in BI', 4, [
    ex('Same rules, new tools', 'Everything from Stage 5 applies: KPI cards for key numbers, lines for trends, sorted bars for comparisons, tables for details.'),
    mc('Show this month\'s revenue vs. target:', ['A KPI card with the target', 'A pie chart', 'A scatter plot'], 'Big number + comparison.'),
    mc('Compare 12 product categories:', ['Sorted bar chart', '12-slice pie', 'Map'], 'Still bars!'),
  ], [rc('Key number vs. target in a dashboard:', ['KPI card', 'Scatter plot', 'Pie chart'])]),

  L('s7x5', 8, 'Time intelligence', 5, [
    ex('Comparing periods', 'Dashboards constantly compare time: month-to-date (MTD), year-to-date (YTD), and year-over-year (YoY) growth.', fx('Revenue YTD = TOTALYTD(SUM(Sales[Amount]), Dates[Date])', 'Revenue so far this year (Power BI DAX)')),
    mc('YoY growth compares...', ['This period to the same period last year', 'Today to yesterday', 'Two products'], 'It removes seasonal effects like summer peaks.'),
    mc('Why compare June to last June instead of to May?', ['Seasons affect sales', 'May doesn\'t exist', 'It\'s required by law'], 'Summer vs. summer is a fair comparison.'),
    bl('YTD stands for year-to-___.', ['date', 'day', 'data'], 'From January 1st until today.'),
  ], [rc('YoY means...', ['Year over year', 'Yes or yes', 'Yield of year'])]),

  L('s7x6', 8, 'Refreshing data', 4, [
    ex('Keep it fresh', 'Dashboards are only useful if the data is current. Set a scheduled refresh (e.g. every morning at 6am) so numbers update automatically.', both('Looker Studio refreshes from Sheets automatically (with a short cache).', 'Power BI Service → dataset settings → Scheduled refresh.')),
    mc('The dashboard shows last week\'s numbers. Likely cause?', ['The refresh failed or isn\'t scheduled', 'The charts are wrong colors', 'Too many KPIs'], 'Always show a "Last updated" time on dashboards!'),
  ], [rc('Dashboards should display...', ['A "last updated" time', 'Every raw row', 'No titles'])]),

  L('s7x7', 8, 'Sharing and security', 4, [
    ex('The right data for the right people', 'Not everyone should see everything. Row-level security (RLS) in Power BI lets each manager see only their own region, in the same dashboard.'),
    mc('Store managers should only see their own store. Use...', ['Row-level security', 'Separate files for everyone', 'Trust'], 'One dashboard, filtered automatically per person.'),
    mc('A dashboard includes customer emails. Should it be shared company-wide?', ['No, limit access or remove personal data', 'Yes', 'Only on Fridays'], 'Privacy rules from Stage 1 still apply!'),
  ], [rc('Show each manager only their region with...', ['Row-level security', 'Bigger fonts', 'Pie charts'])]),

  L('s7x8', 8, 'Getting feedback', 4, [
    ex('Dashboards are products', 'Build version 1, show it to the people who\'ll use it, watch them use it, and improve it. The best dashboards answer the questions users actually have.'),
    ord('Order the dashboard improvement loop.', ['Ask users what decisions they make', 'Build a first version', 'Watch them use it', 'Improve it'], 'Talk → build → watch → improve, again and again.'),
    mc('Nobody uses your dashboard. First step?', ['Ask users what they need', 'Add more charts', 'Change the colors'], 'Usually it\'s not answering their real questions.'),
  ], [rc('The best dashboards start by asking users...', ['What decisions they make', 'Their favorite color', 'Nothing'])]),
];
