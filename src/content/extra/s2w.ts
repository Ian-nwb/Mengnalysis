import { both, ex, fx, L, list, mc, ord, rc, sheet } from '../build';

const SALES: (string | number)[][] = [
  ['Drink', 'Size', 'Price', 'Qty'],
  ['Latte', 'Large', 5, 2],
  ['Tea', 'Small', 2.5, 4],
  ['Latte', 'Medium', 4.5, 1],
  ['Mocha', 'Large', 5.25, 3],
  ['Cold Brew', 'Large', 4.75, 2],
];
const STAFF: (string | number)[][] = [
  ['Name', 'Team', 'Hours', 'Rate'],
  ['Ava', 'Bar', 30, 15],
  ['Ben', 'Kitchen', 25, 16],
  ['Cleo', 'Bar', 40, 15],
  ['Dev', 'Front', 20, 14],
];
const PRICES: (string | number)[][] = [
  ['Code', 'Item', 'Price'],
  ['P1', 'Monstera', 45],
  ['P2', 'Pothos', 18],
  ['P3', 'Cactus', 12],
  ['P4', 'Snake Plant', 30],
];

// Stage 2 hands-on Formula Lab (real formulas, checked by the sandbox) + deeper Excel.
export const stage2w = [
  L('s2w1', 2, 'Formula lab: your first formulas', 5, [
    ex('Hands on!', 'Time to type real formulas. Tap the buttons to build them, or type. Press "Check formula" to see your result. You can\'t break anything!'),
    sheet('Find the total of all prices (column C).', SALES, '=SUM(C2:C6)', 'Use SUM with the range C2:C6.', 'SUM adds up the whole range.'),
    sheet('Find the average price.', SALES, '=AVERAGE(C2:C6)', 'AVERAGE( then the price range.', 'Average = sum ÷ count, done for you.'),
    sheet('What is the most expensive price?', SALES, '=MAX(C2:C6)', 'MAX finds the biggest value.', 'Mocha at 5.25 wins.'),
  ], [rc('Total a range of cells with...', ['=SUM(C2:C6)', '=ADD(C2:C6)', '=TOTAL C2-C6'])]),

  L('s2w2', 2, 'Formula lab: math across columns', 5, [
    sheet('Calculate the revenue for row 2: price × quantity.', SALES, '=C2*D2', 'Multiply C2 by D2 using *.', 'Row 2: 5 × 2 = 10.'),
    sheet('Total quantity of drinks sold (column D).', SALES, '=SUM(D2:D6)', 'SUM over D2:D6.', '12 drinks in total.'),
    sheet('Total revenue for ALL rows in one formula (price × qty, added up).', SALES, '=SUMPRODUCT(C2:C6,D2:D6)', 'SUMPRODUCT(C2:C6, D2:D6) multiplies each pair and adds them.', 'SUMPRODUCT is a pro move: one formula, whole table.', ['SUMPRODUCT']),
  ], [rc('Multiply pairs and add them up:', ['SUMPRODUCT', 'SUMIF', 'PRODUCT'])]),

  L('s2w3', 2, 'Formula lab: IF', 5, [
    sheet('In row 2: show "Premium" if the price is over 4.80, otherwise "Regular".', SALES, '=IF(C2>4.8,"Premium","Regular")', '=IF(C2>4.8, "Premium", "Regular"). Text needs quotes.', 'Row 2\'s Latte is 5, so it\'s Premium.', ['IF']),
    sheet('Row 3: show "Bulk" if quantity is at least 4, otherwise "Single".', SALES, '=IF(D3>=4,"Bulk","Single")', '>= means "at least".', 'Tea sold 4, so it\'s Bulk.', ['IF']),
  ], [rc('IF pattern:', ['=IF(test, if true, if false)', '=IF(true)', '=IF test THEN'])]),

  L('s2w4', 2, 'Formula lab: SUMIF and COUNTIF', 6, [
    sheet('How many sales were Large? (count column B)', SALES, '=COUNTIF(B2:B6,"Large")', 'COUNTIF(range, "Large").', '3 Large drinks.', ['COUNTIF']),
    sheet('Total quantity of Lattes sold.', SALES, '=SUMIF(A2:A6,"Latte",D2:D6)', 'SUMIF(where to look, what to match, what to add).', '2 + 1 = 3 Lattes.', ['SUMIF']),
    sheet('Total quantity of Large drinks that cost over 5.', SALES, '=SUMIFS(D2:D6,B2:B6,"Large",C2:C6,">5")', 'SUMIFS(sum range, B range, "Large", C range, ">5").', 'Only Mocha matches both rules: 3.', ['SUMIFS']),
  ], [rc('Count cells matching a rule:', ['COUNTIF', 'SUMIF', 'COUNTA'])]),

  L('s2w5', 2, 'Formula lab: lookups', 6, [
    sheet('Find the price of item code P3 with XLOOKUP.', PRICES, '=XLOOKUP("P3",A2:A5,C2:C5)', 'XLOOKUP("P3", codes, prices).', 'P3 is the Cactus, at 12.', ['XLOOKUP']),
    sheet('Find the Snake Plant\'s price with VLOOKUP. The item names are in column B, so use the table B2:C5.', PRICES, '=VLOOKUP("Snake Plant",B2:C5,2,FALSE)', 'VLOOKUP("Snake Plant", B2:C5, 2, FALSE). Column 2 of B:C is the price.', 'VLOOKUP searches the first column of the table you give it.', ['VLOOKUP']),
    sheet('Look up code "P9" with XLOOKUP, but show "Not found" instead of an error.', PRICES, '=XLOOKUP("P9",A2:A5,C2:C5,"Not found")', 'XLOOKUP has a 4th part: what to show if nothing is found.', 'No ugly #N/A on your dashboard!', ['XLOOKUP']),
  ], [rc('XLOOKUP\'s optional 4th part is...', ['What to show if not found', 'The sort order', 'A color'])]),

  L('s2w6', 2, 'Formula lab: cleaning text', 5, [
    sheet('Row 6\'s drink is "Cold Brew". Show it in capitals.', SALES, '=UPPER(A6)', 'UPPER(A6).', 'COLD BREW.', ['UPPER']),
    sheet('Join row 2\'s drink and size like "Latte - Large".', SALES, '=A2&" - "&B2', 'Use & to glue: A2 & " - " & B2.', 'Joining text is great for labels.'),
    sheet('How many characters are in row 5\'s drink name?', SALES, '=LEN(A5)', 'LEN counts characters.', '"Mocha" has 5.', ['LEN']),
  ], [rc('Glue text together with...', ['&', '+', '#'])]),

  L('s2w7', 2, 'Formula lab: staff hours', 6, [
    ex('New sheet: the café rota', 'This sheet has staff, their team, hours this week and hourly rate.'),
    sheet('Total wages for Ava (row 2): hours × rate.', STAFF, '=C2*D2', 'C2*D2.', '30 × 15 = 450.'),
    sheet('Total hours worked by the Bar team.', STAFF, '=SUMIF(B2:B5,"Bar",C2:C5)', 'SUMIF over the Team column.', 'Ava 30 + Cleo 40 = 70.', ['SUMIF']),
    sheet('Average hours across all staff, rounded to 1 decimal.', STAFF, '=ROUND(AVERAGE(C2:C5),1)', 'Wrap AVERAGE inside ROUND(…, 1).', 'Nesting functions: formula inside formula!', ['ROUND', 'AVERAGE']),
  ], [rc('Put one function inside another:', ['Nesting', 'Stacking', 'Pivoting'])]),

  L('s2w8', 2, 'Power Query', 5, [
    ex('Clean once, refresh forever', 'Power Query (Excel → Data → Get Data) records every cleaning step: remove columns, trim text, split, change types, merge tables. Next month, drop in the new file and press Refresh. All the steps replay automatically.', list([
      'Get Data → choose your file or folder',
      'Transform: remove columns, fix types, trim, split, filter',
      'Combine: merge (like JOIN) or append (stack tables)',
      'Close & Load → a clean table that refreshes',
    ])),
    mc('Why use Power Query instead of cleaning by hand every month?', ['The steps are saved and replay on Refresh', 'It\'s more colorful', 'It deletes old files'], 'Automation beats repetition.'),
    mc('Stacking January, February and March files into one table is called...', ['Append', 'Merge', 'Pivot'], 'Append stacks; merge joins side by side.'),
  ], [rc('Power Query: stack tables with...', ['Append', 'Merge', 'Split'])]),

  L('s2w9', 2, 'The Data Model and Power Pivot', 5, [
    ex('Pivot tables across tables', 'The Data Model lets one PivotTable use several related tables (Sales, Products, Customers) linked by keys, like a mini Power BI inside Excel. Power Pivot adds DAX measures.'),
    mc('Sales has product_id and Products has id + category. To pivot sales by category, you...', ['Relate them in the Data Model', 'Copy-paste categories by hand', 'Use a pie chart'], 'Relationships beat giant XLOOKUP columns.'),
    mc('Formula language used in Power Pivot (and Power BI):', ['DAX', 'SQL', 'Python'], 'Learn it once, use it in both.'),
  ], [rc('Excel\'s mini Power BI for related tables:', ['Data Model / Power Pivot', 'Flash Fill', 'Goal Seek'])]),

  L('s2w10', 2, 'LET and LAMBDA', 5, [
    ex('Name your pieces', 'LET gives names to parts of a formula, so long formulas read like sentences. LAMBDA lets you create your own reusable function (Excel 365 and Google Sheets).', fx('=LET(total, SUM(C2:C6), count, COUNT(C2:C6), total/count)', 'The average, written readably')),
    mc('Why use LET?', ['Readable formulas that calculate each piece once', 'To make cells bigger', 'It\'s required'], 'Clearer and often faster.'),
    mc('LAMBDA lets you...', ['Build your own reusable function', 'Delete formulas', 'Make charts'], 'Like Apps Script custom functions, but right in a formula.'),
  ], [rc('Name parts of a formula with...', ['LET', 'NAME', 'DIM'])]),

  L('s2w11', 2, 'What-if analysis and Goal Seek', 5, [
    ex('Play with scenarios', 'Goal Seek (Excel: Data → What-If Analysis → Goal Seek) works backwards: "What price do I need so profit hits $1,000?" Scenario tables compare best, expected and worst cases.', both('Use a helper cell and adjust it, or try the Goal Seek add-on.', 'Data → What-If Analysis → Goal Seek / Scenario Manager / Data Table.')),
    mc('"How many coffees must we sell to break even?" Best tool?', ['Goal Seek', 'Freeze panes', 'Conditional formatting'], 'Set the result you want and let Excel find the input.'),
    ord('Order a Goal Seek.', ['Pick the result cell (profit)', 'Type the target value (0 for break-even)', 'Pick the cell to change (cups sold)', 'Read the answer'], 'Backwards math, done for you.'),
  ], [rc('Find the input needed for a target result:', ['Goal Seek', 'XLOOKUP', 'Sort'])]),

  L('s2w12', 2, 'Pivot table power-ups', 5, [
    ex('Beyond basic pivots', 'Make pivot tables interactive and smarter.', list([
      'Slicers: big filter buttons (Insert → Slicer)',
      'Timelines: filter by dates with a slider',
      'Show Values As: % of total, running total, difference from last month',
      'Calculated fields: new values like Profit = Revenue − Cost',
      'Group dates by month, quarter or year',
    ])),
    mc('Show each drink as a % of total sales in a pivot:', ['Show Values As → % of Grand Total', 'Add a pie chart', 'Divide by hand'], 'One click, no formulas.'),
    mc('Big clickable filter buttons on a pivot are...', ['Slicers', 'Sparklines', 'Macros'], 'Perfect for dashboards in Excel.'),
  ], [rc('Interactive filter buttons for pivots:', ['Slicers', 'Freeze panes', 'Comments'])]),
];
