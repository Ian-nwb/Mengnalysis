import { bar, ex, L, list, mc, rc, reflect, sheet } from '../build';

// Stage 12: Industry Packs: domain analytics with hands-on formulas.
export const stage12 = [
  L('s12l1', 12, 'Marketing: CTR, CPC and ROAS', 6, [
    ex('Speak marketing', 'Marketing teams live by a few ratios.', list([
      'CTR (click-through rate) = clicks ÷ impressions',
      'CPC (cost per click) = spend ÷ clicks',
      'ROAS (return on ad spend) = revenue ÷ spend',
    ])),
    sheet('Find the ROAS for Instagram (row 2): revenue ÷ spend.', [['Channel', 'Spend', 'Clicks', 'Revenue'], ['Instagram', 500, 1000, 2000], ['Search', 800, 1600, 4000], ['Email', 100, 400, 900]], '=D2/B2', 'Revenue (D2) divided by spend (B2).', 'ROAS of 4 means $4 back for every $1 spent.'),
    sheet('Which channel has the best ROAS? Calculate Email\'s (row 4).', [['Channel', 'Spend', 'Clicks', 'Revenue'], ['Instagram', 500, 1000, 2000], ['Search', 800, 1600, 4000], ['Email', 100, 400, 900]], '=D4/B4', 'D4/B4.', 'Email wins with 9! Small spend, big return.'),
  ], [rc('ROAS = revenue ÷ ...', ['Ad spend', 'Clicks', 'Impressions'])]),

  L('s12l2', 12, 'Marketing: campaigns and A/B emails', 5, [
    ex('Testing subject lines', 'Email teams A/B test subject lines: half get version A, half get B, and the open rate decides.', bar('Open rate by subject line (%)', [['A: "New menu!"', 21], ['B: "Your free coffee awaits"', 34]], 'B: "Your free coffee awaits"')),
    mc('Before declaring B the winner, check...', ['That the sample is big enough to be sure', 'The font', 'Nothing'], 'Stage 3 skills: significance and sample size.'),
    mc('Open rate is a "leading" metric. What matters more to the business?', ['Purchases or revenue from the email', 'Number of emails sent', 'Subject length'], 'Opens are nice; sales pay the bills.'),
  ], [rc('Open rate = opens ÷ ...', ['Emails delivered', 'Purchases', 'Clicks'])]),

  L('s12l3', 12, 'Finance: profit and margins', 6, [
    ex('The P&L', 'A profit and loss statement (P&L) goes: Revenue − Cost of goods sold (COGS) = Gross profit. Then − operating expenses = Operating profit. Margin = profit ÷ revenue.'),
    sheet('Gross profit for the café (row 2): revenue − COGS.', [['Month', 'Revenue', 'COGS', 'OpEx'], ['June', 24000, 9600, 10000], ['July', 28000, 11000, 10500]], '=B2-C2', 'B2 minus C2.', '24,000 − 9,600 = 14,400.'),
    sheet('Gross margin for June as a decimal: (revenue − COGS) ÷ revenue.', [['Month', 'Revenue', 'COGS', 'OpEx'], ['June', 24000, 9600, 10000], ['July', 28000, 11000, 10500]], '=(B2-C2)/B2', 'Use brackets: (B2-C2)/B2.', '0.6 = a 60% gross margin.'),
  ], [rc('Gross margin = gross profit ÷ ...', ['Revenue', 'Costs', 'Expenses'])]),

  L('s12l4', 12, 'Finance: budget vs. actual', 5, [
    ex('Variance analysis', 'Finance compares what was planned (budget) with what happened (actual). Variance = actual − budget. For costs, a positive variance is bad; for revenue, it\'s good.'),
    sheet('Find the variance for Marketing spend (row 2): actual − budget.', [['Line', 'Budget', 'Actual'], ['Marketing', 5000, 6200], ['Payroll', 30000, 29500]], '=C2-B2', 'C2 minus B2.', 'Marketing overspent by 1,200.'),
    mc('Revenue came in $3,000 above budget. That variance is...', ['Favorable (good)', 'Unfavorable', 'An error'], 'More revenue than planned is good news.'),
  ], [rc('Variance = actual − ...', ['Budget', 'Last year', 'Revenue'])]),

  L('s12l5', 12, 'E-commerce: carts and returns', 5, [
    ex('Online store vitals', 'Cart abandonment rate = carts not purchased ÷ carts created. Return rate = items returned ÷ items sold. AOV = revenue ÷ orders.'),
    sheet('Cart abandonment rate: (carts − orders) ÷ carts.', [['Week', 'Carts', 'Orders'], ['W1', 800, 240]], '=(B2-C2)/B2', '(B2-C2)/B2.', '0.7 = 70% abandoned. Very normal online, sadly!'),
    mc('Return rate jumps for one size of one product. Likely cause?', ['A sizing problem with that product', 'Seasonality', 'Too many charts'], 'Segment, then dig in.'),
  ], [rc('AOV = revenue ÷ ...', ['Orders', 'Customers', 'Visits'])]),

  L('s12l6', 12, 'SaaS: MRR movements', 6, [
    ex('Where did monthly revenue go?', 'Subscription businesses break MRR changes into parts: New (new customers) + Expansion (upgrades) − Contraction (downgrades) − Churn (cancellations).'),
    sheet('Ending MRR: start + new + expansion − contraction − churn.', [['Start', 'New', 'Expansion', 'Contraction', 'Churn'], [10000, 1500, 600, 200, 900]], '=A2+B2+C2-D2-E2', 'A2 + B2 + C2 − D2 − E2.', '11,000 MRR at month end.'),
    mc('Net revenue retention (NRR) above 100% means...', ['Existing customers grew revenue even after churn', 'No customers left', 'New customers doubled'], 'NRR > 100% is a sign of a very healthy product.'),
  ], [rc('MRR churn means revenue lost from...', ['Cancellations', 'Upgrades', 'New customers'])]),

  L('s12l7', 12, 'People analytics: attrition', 5, [
    ex('Analytics for HR', 'People teams track headcount, hiring time and attrition (people leaving). Attrition rate = leavers ÷ average headcount. This data is sensitive, so it\'s always aggregated and kept private.'),
    sheet('Annual attrition: leavers ÷ average headcount.', [['Team', 'Leavers', 'AvgHeadcount'], ['Support', 6, 40]], '=B2/C2', 'B2/C2.', '0.15 = 15% per year.'),
    mc('Your manager asks for each person\'s exit reason by name in a dashboard. Best response?', ['Show grouped reasons, not individuals, to protect privacy', 'Share every name', 'Delete the data'], 'People data needs extra care.'),
  ], [rc('Attrition rate = leavers ÷ ...', ['Average headcount', 'New hires', 'Salaries'])]),

  L('s12l8', 12, 'Operations: lead time and inventory', 5, [
    ex('Keeping shelves stocked', 'Lead time = how long from ordering stock to receiving it. Inventory turnover = cost of goods sold ÷ average inventory (how many times stock "turns over"). On-time delivery % = on-time ÷ total deliveries.'),
    sheet('On-time delivery rate: on-time ÷ total.', [['Supplier', 'OnTime', 'Total'], ['Bean Co', 45, 50]], '=B2/C2', 'B2/C2.', '90% on time.'),
    mc('Inventory turnover is very low. That suggests...', ['Stock sits on shelves too long', 'Selling out too fast', 'Perfect balance'], 'Cash tied up in slow stock.'),
  ], [rc('Time from ordering stock to receiving it:', ['Lead time', 'Churn', 'CTR'])]),

  L('s12l9', 12, 'Healthcare operations', 4, [
    ex('Data that helps patients', 'Clinics analyze wait times, no-show rates and how full the schedule is (utilization). Health data is highly private, so analysts work with de-identified, aggregated data and follow strict rules (like HIPAA in the US).'),
    mc('No-show rate = ...', ['Missed appointments ÷ scheduled appointments', 'Patients ÷ doctors', 'Wait minutes ÷ 60'], 'Reminder texts often cut no-shows.'),
    mc('Best way to share clinic wait-time insights?', ['Aggregated by day and clinic, no patient details', 'Patient names and times', 'Screenshots of records'], 'Insight without identifying anyone.'),
  ], [rc('Health data for analysis should be...', ['De-identified and aggregated', 'Shared by name', 'Printed'])]),

  L('s12l10', 12, 'Boss level: pick your industry', 6, [
    ex('Your case', 'A recruiter asks: "Which industry interests you, and which metrics would you track first?" Let\'s practice your answer.'),
    mc('For an online store, the best first three metrics are...', ['Conversion rate, AOV and return rate', 'Font size, logo, colors', 'Total emails ever sent'], 'They map straight to revenue.'),
    mc('For a subscription app, the best first three are...', ['MRR, churn and NRR', 'Page views, likes, followers', 'Lead time only'], 'Recurring revenue and retention.'),
    sheet('Quick interview math: churn rate = cancelled ÷ subscribers at start.', [['Start', 'Cancelled'], [500, 25]], '=B2/A2', 'B2/A2.', '5% monthly churn. Now you can discuss whether that\'s healthy!'),
    reflect('Answer the recruiter: which industry excites you, and which 3 metrics would you watch first?', 'I\'m excited about e-commerce because every click tells a story. I\'d watch conversion rate to see if people buy, average order value to see how much they spend, and return rate to catch product problems early.'),
  ], [rc('SaaS companies care most about...', ['MRR and churn', 'Inventory turnover', 'Foot traffic'])]),
];
