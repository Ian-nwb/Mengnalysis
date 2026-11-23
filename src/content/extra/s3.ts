import { bar, bl, ex, fx, L, list, mc, rc, rec } from '../build';

// Extra Stage 3 lessons: Statistics
export const stage3x = [
  L('s3x1', 3, 'Outliers', 5, [
    ex('The odd ones out', 'An outlier is a value far away from the rest. It could be an error (age 250) or something real and interesting (a $300 catering order).', bar('Daily orders', [['Mon', 52], ['Tue', 48], ['Wed', 55], ['Thu', 210], ['Fri', 50]], 'Thu')),
    mc('Which day is the outlier?', ['Thursday', 'Monday', 'Friday'], '210 is about 4x the other days.'),
    mc('Before deleting an outlier, you should...', ['Find out why it happened', 'Delete it immediately', 'Double it'], 'Maybe Thursday had a festival nearby. That\'s an insight, not an error!'),
    ex('The IQR rule', 'A common rule: a value is an outlier if it\'s far beyond the middle 50% of the data (more than 1.5 × the IQR from the quartiles). Box plots draw this for you.'),
  ], [rc('Before removing an outlier...', ['Investigate why it happened', 'Just delete it', 'Ignore it'])]),

  L('s3x2', 3, 'Quartiles and box plots', 5, [
    ex('Cutting data in four', 'Quartiles split sorted data into four equal parts. Q1 = 25th percentile, Q2 = median, Q3 = 75th percentile. The IQR (interquartile range) is Q3 − Q1: the middle half of your data.', fx('=QUARTILE(B2:B100, 1)', 'Q1, the 25th percentile')),
    mc('Q2 is the same as...', ['The median', 'The mean', 'The max'], 'The 50% mark is the median.'),
    mc('Q1 = 4, Q3 = 10. What is the IQR?', ['6', '14', '4'], '10 − 4 = 6.'),
    ex('Box plots', 'A box plot draws the box from Q1 to Q3, a line at the median, and "whiskers" out to the normal range. Dots beyond the whiskers are outliers.'),
  ], [rc('IQR = ...', ['Q3 − Q1', 'Max − Min', 'Q2 × 2'])]),

  L('s3x3', 3, 'Weighted averages', 5, [
    ex('Not all values count equally', 'Store A sells 900 coffees at $4. Store B sells 100 at $6. The average price is NOT $5, because Store A sold way more!', rec('Weighted average', [['Calculation', '(900×4 + 100×6) ÷ 1000'], ['Result', '$4.20']])),
    mc('Why isn\'t the answer $5?', ['Store A sold far more coffees', 'Math error', 'Store B is closed'], 'A weighted average gives bigger groups more say.'),
    ex('In a spreadsheet', 'SUMPRODUCT multiplies pairs and adds them up.', fx('=SUMPRODUCT(B2:B3, C2:C3)/SUM(C2:C3)', '$4.20', 'B = prices, C = quantities')),
    bl('Averaging averages from groups of different sizes needs a ___ average.', ['weighted', 'simple', 'random'], 'A classic analyst trap!'),
  ], [rc('Groups of different sizes need a...', ['Weighted average', 'Simple average', 'Median'])]),

  L('s3x4', 3, 'Probability basics', 5, [
    ex('How likely?', 'Probability is a number from 0 (impossible) to 1 (certain). It\'s often shown as a %. Probability = matching outcomes ÷ all outcomes.', list(['Coin lands heads: 1 ÷ 2 = 50%', 'Roll a 6: 1 ÷ 6 ≈ 17%', 'Roll an even number: 3 ÷ 6 = 50%'])),
    mc('20 of 100 customers buy a pastry. Probability the next one does?', ['20%', '80%', '2%'], '20 ÷ 100 = 0.2 = 20%.'),
    mc('Probability of 1 means...', ['Certain', 'Impossible', 'Unknown'], '0 = never, 1 = always.'),
    bl('Probability = matching outcomes ÷ ___ outcomes.', ['all', 'bad', 'two'], 'The classic formula.'),
  ], [rc('A probability of 0 means...', ['Impossible', 'Certain', '50/50'])]),

  L('s3x5', 3, 'The 68-95-99.7 rule', 5, [
    ex('The bell curve\'s secret', 'In a normal distribution, almost everything falls near the mean.', list([
      '68% within 1 standard deviation',
      '95% within 2 standard deviations',
      '99.7% within 3 standard deviations',
    ])),
    mc('Delivery takes 30 min on average, SD 5 min. About 95% of deliveries take...', ['20 to 40 minutes', '25 to 35 minutes', '0 to 60 minutes'], '2 SDs: 30 ± 10.'),
    mc('A delivery took 50 minutes. That\'s...', ['Very unusual (4 SDs away)', 'Totally normal', 'Impossible'], 'Worth investigating!'),
  ], [rc('In a normal distribution, ~95% of values are within...', ['2 standard deviations', '1 standard deviation', '5 standard deviations'])]),

  L('s3x6', 3, 'Z-scores', 5, [
    ex('How unusual is this?', 'A z-score says how many standard deviations a value is from the mean. z = (value − mean) ÷ SD.', fx('=STANDARDIZE(B2, AVERAGE(B:B), STDEV(B:B))', 'The z-score of B2')),
    mc('Mean 50, SD 10. A value of 70 has z = ...', ['2', '20', '0.7'], '(70 − 50) ÷ 10 = 2.'),
    mc('A z-score of 0 means...', ['Exactly average', 'Very unusual', 'An error'], 'Zero distance from the mean.'),
    bl('Z-scores above 3 or below −3 are usually ___.', ['outliers', 'medians', 'errors in Excel'], 'Remember the 99.7% rule!'),
  ], [rc('z = 0 means the value is...', ['Exactly average', 'An outlier', 'Missing'])]),

  L('s3x7', 3, 'Confidence intervals', 5, [
    ex('Answers with honesty', 'A sample gives an estimate, not the exact truth. A confidence interval gives a range: "Average spend is $6.20, ± $0.40 (95% confidence)".'),
    mc('Which sample gives a NARROWER (more precise) interval?', ['10,000 customers', '10 customers', 'Same either way'], 'More data = more precision.'),
    mc('"Satisfaction is 72% ± 3%". The real value is probably between...', ['69% and 75%', '72% exactly', '0% and 100%'], '72 − 3 and 72 + 3.'),
    ex('Why this matters', 'If two options overlap a lot ("A: 50% ± 5", "B: 52% ± 5"), you can\'t be sure which is better. Say so honestly!'),
  ], [rc('More data makes confidence intervals...', ['Narrower', 'Wider', 'Disappear'])]),

  L('s3x8', 3, 'Trend lines', 5, [
    ex('Drawing the best line', 'Linear regression finds the straight line that best fits the data. It helps estimate: "for every 1°C warmer, we sell 8 more iced coffees".', fx('=SLOPE(B2:B31, A2:A31)', '8 more sales per degree', 'A = temperature, B = sales')),
    mc('A slope of 8 means...', ['Sales rise by 8 for every 1 degree', 'Sales are always 8', 'It\'s 8 degrees'], 'Slope = change in y per 1 unit of x.'),
    ex('Charts can do it too', 'In both apps, add a trendline to a scatter chart: Sheets: Chart editor → Customize → Series → Trendline. Excel: click chart → + → Trendline.'),
    mc('Can a trend line prove temperature CAUSES sales?', ['No, it shows a relationship, not proof', 'Yes, always', 'Only on Mondays'], 'Correlation ≠ causation, still!'),
  ], [rc('SLOPE tells you...', ['Change in y per 1 unit of x', 'The average', 'The max'])]),

  L('s3x9', 3, 'Simpson\'s paradox', 6, [
    ex('A famous trap', 'A trend can flip when you split data into groups. Imagine Store A has a higher conversion rate in BOTH weekdays and weekends, but a lower rate overall!', rec('How it happens', [
      ['Store A', 'Mostly weekday visitors (low conversion days)'],
      ['Store B', 'Mostly weekend visitors (high conversion days)'],
      ['Overall', 'B looks better, but A wins in each group'],
    ])),
    mc('What causes Simpson\'s paradox?', ['Groups of very different sizes or mixes', 'Typos', 'Using a pie chart'], 'The group mix hides the real pattern.'),
    mc('How do you protect yourself?', ['Look at the data split by important groups', 'Only look at totals', 'Use bigger fonts'], 'Always check if the overall story holds inside each group.'),
  ], [rc('A trend that flips when data is grouped is...', ['Simpson\'s paradox', 'A z-score', 'Regression'])]),

  L('s3x10', 3, 'Survivorship bias', 4, [
    ex('The missing data', 'In WWII, engineers studied returning planes\' bullet holes to decide where to add armor. Abraham Wald pointed out: the planes hit in OTHER places never came back. The missing data was the most important!'),
    mc('"All successful startups had a cool office, so offices cause success!" What\'s missing?', ['Failed startups that also had cool offices', 'Nothing', 'More offices'], 'You only see the survivors.'),
    mc('You survey current customers about why they love you. Who\'s missing?', ['Customers who left', 'Nobody', 'Your boss'], 'Customers who left could tell you the most.'),
    bl('Only looking at the winners is called ___ bias.', ['survivorship', 'sampling', 'leading'], 'Always ask: who isn\'t in this data?'),
  ], [rc('Studying only successes leads to...', ['Survivorship bias', 'Correlation', 'Confidence'])]),
];
