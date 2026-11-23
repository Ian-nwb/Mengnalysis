import { bar, bl, ex, L, line, list, mc, ord, rc } from '../build';

// Extra Stage 5 lessons: Charts & Stories
export const stage5x = [
  L('s5x1', 5, 'Scatter plots', 5, [
    ex('Dots for relationships', 'A scatter plot puts one number on the across axis and another on the up axis. Each dot is one row. If dots form an upward cloud, the two rise together.'),
    mc('Each dot in a scatter plot is...', ['One row of data', 'One column', 'One chart'], 'E.g. one day: its temperature and its sales.'),
    mc('Dots trend downward from left to right. That means...', ['A negative relationship', 'A positive relationship', 'No relationship'], 'As one goes up, the other goes down.'),
    bl('Scatter plots show the relationship between ___ numbers.', ['two', 'zero', 'ten'], 'And remember: relationship ≠ cause!'),
  ], [rc('Each dot in a scatter plot is...', ['One row', 'One column', 'One table'])]),

  L('s5x2', 5, 'Histograms', 5, [
    ex('The shape of one number', 'A histogram groups values into ranges ("bins") and counts each range. It shows the distribution: where most values sit.', bar('Order sizes (count of orders)', [['$0–3', 40], ['$3–6', 120], ['$6–9', 60], ['$9–12', 15], ['$12+', 5]], '$3–6')),
    mc('Where are most orders?', ['$3–6', '$12+', '$0–3'], '120 orders, the biggest bin.'),
    mc('What shape is this distribution?', ['Right-skewed (long tail of big orders)', 'Perfectly uniform', 'Left-skewed'], 'A few big orders stretch out to the right.'),
  ], [rc('A histogram shows...', ['How values are distributed', 'Change over time', 'Parts of a whole'])]),

  L('s5x3', 5, 'Stacked bars', 4, [
    ex('Parts of each bar', 'Stacked bars split each bar into parts, like sales per month split into drinks and food. Great for 2–3 parts; messy with more.'),
    mc('A stacked bar with 9 colored parts is...', ['Hard to read; use fewer parts', 'Perfect', 'Required'], 'Only the bottom part is easy to compare. Keep it simple.'),
    mc('Better than a pie chart to show parts over several months?', ['Stacked bars', 'Many pies', 'A table of percentages'], 'One stacked bar per month lets you compare across time.'),
  ], [rc('Stacked bars work best with...', ['2–3 parts', '10+ parts', 'One value'])]),

  L('s5x4', 5, 'Table or chart?', 4, [
    ex('Sometimes a table wins', 'Charts show patterns. Tables show exact values. If people need to look up specific numbers (like prices), use a table.'),
    mc('The finance team needs exact totals for 12 accounts.', ['A table', 'A pie chart', 'A line chart'], 'Precise lookups → table.'),
    mc('The CEO wants to see if revenue is growing.', ['A line chart', 'A table of 365 numbers', 'A word cloud'], 'Patterns → chart.'),
  ], [rc('Need exact values to look up?', ['Use a table', 'Use a pie chart', 'Use a map'])]),

  L('s5x5', 5, 'Using color well', 5, [
    ex('Color with purpose', 'Good charts use color to mean something, not to decorate.', list([
      'One highlight color; everything else gray',
      'Same color = same thing across all charts',
      'Don\'t rely on color alone; add labels too',
      'Avoid red/green as the only difference, since many people can\'t tell them apart',
    ])),
    mc('Every bar is a different bright color for no reason. Problem?', ['Color should mean something', 'Not enough colors', 'No problem'], 'Random colors make readers search for a meaning that isn\'t there.'),
    mc('Revenue is purple in one chart and orange in the next. Problem?', ['Inconsistent colors confuse readers', 'Purple is too pretty', 'No problem'], 'Keep colors consistent.'),
    bl('Always add ___ so color isn\'t the only signal.', ['labels', 'more colors', 'gradients'], 'Labels make charts clear for everyone.'),
  ], [rc('A good chart uses color...', ['To mean something', 'To decorate', 'Randomly'])]),

  L('s5x6', 5, 'Labels and annotations', 4, [
    ex('Point at the story', 'An annotation is a little note on the chart: "New menu launched here". It explains the "why" right where it happened.', line('Weekly orders', [['W1', 300], ['W2', 310], ['W3', 305], ['W4', 420], ['W5', 450]])),
    mc('Orders jumped in week 4. What annotation helps most?', ['"Summer drinks launched"', '"Week 4"', '"Chart"'], 'It explains the jump right where readers look.'),
    mc('Label values directly on bars, or use a far-away legend?', ['Directly on the bars', 'Legend far away', 'No labels'], 'Direct labels save readers\' eyes from jumping back and forth.'),
  ], [rc('A note on a chart explaining a spike is an...', ['Annotation', 'Axis', 'Legend'])]),

  L('s5x7', 5, 'Small multiples', 4, [
    ex('Many small charts', 'Instead of 6 tangled lines in one chart, draw 6 small charts side by side with the same scale. Each is easy to read, and they\'re easy to compare.'),
    mc('One line chart with 8 overlapping lines is...', ['Spaghetti: try small multiples', 'Ideal', 'A histogram'], 'Analysts literally call it a spaghetti chart.'),
    bl('Small multiples must use the same ___.', ['scale', 'title', 'font'], 'Otherwise comparing them is misleading.'),
  ], [rc('Fix a spaghetti chart with...', ['Small multiples', 'More colors', '3D'])]),

  L('s5x8', 5, 'Maps', 4, [
    ex('Where things happen', 'Map charts color regions by a number. Use them when location truly matters, like sales by state.'),
    mc('Big states look important on a map even with low sales. Fix?', ['Show a sorted bar chart too', 'Make the map 3D', 'Remove small states'], 'Area can mislead; bars compare exact values.'),
    mc('When is a map a good choice?', ['When geography is part of the question', 'Always', 'Never'], '"Which region needs a new store?": map. "Which drink sells best?": bar.'),
  ], [rc('Maps are best when...', ['Location matters to the question', 'Showing time trends', 'Showing one number'])]),

  L('s5x9', 5, 'Presenting with confidence', 5, [
    ex('Tips for live presentations', 'You\'ll present findings in meetings. A few habits make it easy.', list([
      'Lead with the answer, then show the proof',
      'One message per slide',
      'Give people time to read each chart',
      'Prepare for "how do you know?" questions',
      'End with a clear next step',
    ])),
    ord('Order a 5-minute findings presentation.', ['The key finding', 'The chart that proves it', 'Caveats and limits', 'Recommended next step'], 'Answer → proof → honesty → action.'),
    mc('Someone asks a question you can\'t answer. Best reply?', ['"Great question, let me check and follow up."', 'Make something up', 'Ignore it'], 'Honesty builds trust, every time.'),
  ], [rc('Start a findings presentation with...', ['The key finding', 'Your methods', 'Thank-yous'])]),
];
