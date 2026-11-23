import { bl, both, ex, fx, L, list, mc, ord, rc, rec } from '../build';

// Extra Stage 2 lessons: Google Sheets & Excel
export const stage2x = [
  L('s2x1', 2, 'Shortcuts that save hours', 4, [
    ex('Work faster', 'These shortcuts work in BOTH Google Sheets and Excel on Windows (use Cmd instead of Ctrl on a Mac).', list([
      'Ctrl + C / Ctrl + V: copy / paste',
      'Ctrl + Z: undo (your best friend!)',
      'Ctrl + F: find',
      'Ctrl + Arrow: jump to the edge of the data',
      'Ctrl + Shift + Arrow: select to the edge',
      'Ctrl + Home: back to cell A1',
    ])),
    mc('You made a mistake. Which shortcut fixes it?', ['Ctrl + Z', 'Ctrl + P', 'Ctrl + Home'], 'Undo works almost everywhere.'),
    mc('Jump to the last row of a 5,000-row table?', ['Ctrl + Down arrow', 'Scroll for 5 minutes', 'Ctrl + F'], 'Ctrl + Arrow jumps to the edge of the data instantly.'),
    bl('Ctrl + Home takes you to cell ___.', ['A1', 'Z100', 'B2'], 'Home base.'),
  ], [rc('Undo shortcut:', ['Ctrl + Z', 'Ctrl + U', 'Ctrl + Y']), rc('Select to the edge of data:', ['Ctrl + Shift + Arrow', 'Alt + Tab', 'Ctrl + P'])]),

  L('s2x2', 2, 'Freeze panes', 4, [
    ex('Keep headers in view', 'Scroll down 500 rows and you forget what each column means. Freezing row 1 keeps the headers on screen as you scroll.', both('View menu → Freeze → 1 row.', 'View tab → Freeze Panes → Freeze Top Row.')),
    mc('Why freeze the top row?', ['So headers stay visible while scrolling', 'To lock the file', 'To make it colder'], 'You always know which column is which.'),
    mc('In Excel, where is Freeze Panes?', ['View tab', 'Insert tab', 'Formulas tab'], 'View → Freeze Panes.'),
  ], [rc('Keep headers visible while scrolling with...', ['Freeze panes', 'Filters', 'Sorting'])]),

  L('s2x3', 2, 'Dropdowns with data validation', 5, [
    ex('Stop typos before they start', 'Data validation makes a cell accept only certain values, like a dropdown of Small / Medium / Large. No more "smal" or "LARGE".', both('Select cells → Data menu → Data validation → Dropdown.', 'Select cells → Data tab → Data Validation → Allow: List.')),
    mc('Why use a dropdown for "Size"?', ['Everyone types the values the same way', 'It looks fancier', 'It makes files smaller'], 'Clean data in = clean analysis out.'),
    mc('Data validation can also...', ['Only allow numbers between 1 and 100', 'Write formulas for you', 'Make charts'], 'You can set number ranges, dates, lists and more.'),
    bl('Data validation helps prevent ___.', ['typos', 'charts', 'formulas'], 'Prevention beats cleaning later.'),
  ], [rc('A dropdown list in a cell comes from...', ['Data validation', 'Conditional formatting', 'Pivot tables'])]),

  L('s2x4', 2, 'COUNTA, COUNTBLANK and ROUND', 5, [
    ex('More counting', 'COUNT only counts numbers. COUNTA counts any non-empty cell (text too). COUNTBLANK counts empty cells, which is great for finding missing data!', list([
      '=COUNTA(A2:A100) → how many names are filled in',
      '=COUNTBLANK(C2:C100) → how many emails are missing',
    ])),
    mc('Column A has 50 customer names (text). Which counts them?', ['=COUNTA(A2:A51)', '=COUNT(A2:A51)', '=SUM(A2:A51)'], 'COUNT ignores text, so COUNTA is right.'),
    ex('Tidy decimals', 'ROUND cleans up long decimals. The second number is how many decimal places to keep.', fx('=ROUND(4.6667, 2)', '4.67')),
    mc('=ROUND(3.14159, 1) gives...', ['3.1', '3.14', '3'], 'One decimal place.'),
  ], [rc('Count empty cells with...', ['COUNTBLANK', 'COUNTA', 'COUNT']), rc('Count text cells with...', ['COUNTA', 'COUNT', 'SUM'])]),

  L('s2x5', 2, 'AND, OR and IFS', 5, [
    ex('Combining tests', 'AND() is true only if all tests are true. OR() is true if any test is true. Put them inside IF.', fx('=IF(AND(B2>5, C2="Large"), "Premium", "")', '"Premium" for large drinks over $5')),
    mc('=OR(5>10, 3<4) is...', ['TRUE', 'FALSE', 'Error'], '3<4 is true, and OR only needs one.'),
    ex('Many outcomes with IFS', 'IFS checks tests in order and returns the first match. Great for grades or tiers.', fx('=IFS(B2>=100, "Gold", B2>=50, "Silver", TRUE, "Bronze")', 'Gold, Silver or Bronze', 'TRUE at the end catches everything else.')),
    mc('B2 is 70. What does that IFS formula give?', ['Silver', 'Gold', 'Bronze'], '70 isn\'t ≥ 100, but it is ≥ 50.'),
  ], [rc('AND() is true when...', ['All tests are true', 'Any test is true', 'No test is true'])]),

  L('s2x6', 2, 'IFERROR', 4, [
    ex('Friendly errors', 'Formulas sometimes fail: #DIV/0! (dividing by zero) or #N/A (lookup found nothing). IFERROR swaps the error for something nicer.', fx('=IFERROR(B2/C2, 0)', '0 instead of #DIV/0!')),
    mc('What does #N/A from XLOOKUP usually mean?', ['The value wasn\'t found', 'The file is broken', 'Too many rows'], 'Check spelling and extra spaces, then use IFERROR if it\'s expected.'),
    mc('Which shows "Not found" instead of an error?', ['=IFERROR(XLOOKUP(E2, A:A, B:B), "Not found")', '=XLOOKUP("Not found")', '=ERROR("Not found")'], 'Wrap the formula in IFERROR(formula, backup).'),
  ], [rc('#DIV/0! means...', ['Dividing by zero', 'Not found', 'Wrong date'])]),

  L('s2x7', 2, 'SUMIFS and COUNTIFS', 5, [
    ex('Multiple rules', 'SUMIFS adds numbers that match several rules. Notice: the sum range comes FIRST in SUMIFS.', fx('=SUMIFS(D2:D500, B2:B500, "Latte", C2:C500, "Large")', 'Money from Large Lattes')),
    mc('Which counts Mochas sold on "Mon"?', ['=COUNTIFS(B2:B500, "Mocha", A2:A500, "Mon")', '=COUNTIF(B2:B500, "Mocha", "Mon")', '=SUM("Mocha", "Mon")'], 'COUNTIFS takes pairs: range, rule, range, rule...'),
    mc('In SUMIFS, the first range is...', ['The numbers to add', 'The first rule', 'The header'], 'SUMIFS(sum_range, range1, rule1, ...).'),
  ], [rc('SUMIFS puts which range first?', ['The sum range', 'The criteria range', 'The header row'])]),

  L('s2x8', 2, 'UNIQUE, FILTER and SORT', 5, [
    ex('Formulas that spill', 'Modern Sheets and Excel have formulas that return whole lists, which "spill" into the cells below.', list([
      '=UNIQUE(B2:B500) → each drink once',
      '=FILTER(A2:D500, D2:D500>5) → only rows over $5',
      '=SORT(A2:D500, 4, FALSE) → sorted by column 4, biggest first',
    ])),
    mc('You want a list of every different city in column C, once each.', ['=UNIQUE(C2:C500)', '=COUNT(C2:C500)', '=CITY(C2:C500)'], 'UNIQUE removes repeats automatically.'),
    mc('Why use FILTER instead of the filter button?', ['The result updates automatically when data changes', 'It deletes rows', 'It\'s the same thing'], 'Formulas stay live; the button is a one-time view.'),
  ], [rc('Get each value once with...', ['UNIQUE', 'FILTER', 'SORT'])]),

  L('s2x9', 2, 'Split text and Flash Fill', 4, [
    ex('One column into two', '"Maria Lopez" in one cell? Split it into first and last name.', both('Data menu → Split text to columns (or =SPLIT(A2, " ")).', 'Data tab → Text to Columns (or =TEXTSPLIT(A2, " ")).')),
    ex('Excel\'s Flash Fill', 'Type the first result yourself (like "Maria") and press Ctrl + E. Excel guesses the pattern for the whole column! Sheets offers a similar "Smart fill" suggestion.'),
    mc('A column has "Austin, TX". You want city and state apart. Use...', ['Split text to columns', 'SUM', 'A pivot table'], 'Split on the comma.'),
  ], [rc('Excel Flash Fill shortcut:', ['Ctrl + E', 'Ctrl + F', 'Ctrl + Q'])]),

  L('s2x10', 2, 'INDEX and MATCH', 5, [
    ex('The classic lookup duo', 'Before XLOOKUP, analysts used INDEX + MATCH, and you\'ll still see it everywhere. MATCH finds the position; INDEX grabs the value at that position.', list([
      '=MATCH("Mocha", A2:A20, 0) → 4 (Mocha is 4th)',
      '=INDEX(B2:B20, 4) → the 4th price',
      '=INDEX(B2:B20, MATCH("Mocha", A2:A20, 0)) → Mocha\'s price',
    ])),
    mc('What does MATCH return?', ['A position number', 'The value itself', 'A chart'], 'MATCH says WHERE; INDEX says WHAT.'),
    mc('The 0 at the end of MATCH means...', ['Exact match', 'Zero results', 'Start at row 0'], 'Like FALSE in VLOOKUP.'),
  ], [rc('INDEX + MATCH: which one finds the position?', ['MATCH', 'INDEX', 'Both'])]),

  L('s2x11', 2, 'Importing CSV files', 4, [
    ex('The universal format', 'CSV (comma-separated values) is plain text: each line is a row, commas separate columns. Almost every system can export CSV.', rec('A CSV line', [['Raw text', '1042,June 3,Iced Latte,5.50'], ['Becomes', '4 columns']])),
    ex('Open it', 'Import keeps your settings in control.', both('File → Import → Upload → choose "Replace" or "Insert new sheet".', 'Data tab → From Text/CSV → Load.')),
    mc('Why might zip codes lose their leading zero on import?', ['They were read as numbers', 'CSV hates zeros', 'The file is broken'], 'Set that column to text when importing (remember Stage 1!).'),
  ], [rc('CSV stands for...', ['Comma-separated values', 'Computer system values', 'Column sheet view'])]),

  L('s2x12', 2, 'Sharing and protecting', 4, [
    ex('Work as a team', 'Share with "Viewer", "Commenter" or "Editor" access. Protect important ranges so nobody accidentally breaks formulas.', both('Share button → set access. Data → Protect sheets and ranges.', 'Share button → set access. Review tab → Protect Sheet.')),
    mc('Your boss only needs to read the report. What access?', ['Viewer', 'Editor', 'Owner'], 'Give the least access needed.'),
    mc('Teammates keep overwriting your formulas. Fix?', ['Protect those cells', 'Delete the file', 'Email it instead'], 'Protection keeps formulas safe.'),
    ord('Order these from least to most access.', ['Viewer', 'Commenter', 'Editor'], 'View → comment → edit.'),
  ], [rc('Least access needed to read a file:', ['Viewer', 'Editor', 'Owner'])]),
];
