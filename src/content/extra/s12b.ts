import { bl, code, ex, fx, L, list, mc, ord, rc } from '../build';

// Stage 1 additions: business thinking
export const stage1y = [
  L('s1y1', 1, 'Metric trees', 5, [
    ex('Break big numbers into parts', 'Big goals are made of smaller numbers multiplied together. Revenue = Traffic × Conversion rate × Average order value (AOV).', list([
      'Traffic: 10,000 visits',
      'Conversion: 2% buy something',
      'AOV: $25 per order',
      'Revenue: 10,000 × 0.02 × $25 = $5,000',
    ])),
    mc('Revenue fell but traffic and AOV stayed the same. What changed?', ['Conversion rate', 'Nothing', 'The weather'], 'If two branches are steady, the third one moved.'),
    mc('Why build a metric tree?', ['To find exactly which part moved', 'To make charts prettier', 'To hide bad news'], 'It turns "revenue dropped!" into "checkout conversion dropped on mobile".'),
    bl('Revenue = Traffic × Conversion × ___.', ['AOV', 'CEO', 'CSV'], 'Average order value.'),
  ], [rc('Revenue = Traffic × Conversion × ...', ['Average order value', 'Headcount', 'Profit'])]),

  L('s1y2', 1, 'Vanity vs. actionable metrics', 4, [
    ex('Feel-good numbers', 'Vanity metrics look impressive but don\'t guide decisions: total signups ever, page views, followers. Actionable metrics tell you what to do: weekly active users, conversion rate, repeat purchase rate.'),
    mc('Which is actionable?', ['% of new users still active after 4 weeks', 'Total downloads since launch', 'Number of likes'], 'It shows whether people stick around, and you can work to improve it.'),
    mc('"We hit 1 million signups!" Why might that be vanity?', ['It never goes down and says nothing about who stays', 'It\'s too big', 'Signups aren\'t data'], 'Cumulative totals only go up, even if the product is failing.'),
  ], [rc('Total signups ever is usually a...', ['Vanity metric', 'Actionable metric', 'Dimension'])]),

  L('s1y3', 1, 'Defining business logic', 5, [
    ex('Same word, different meanings', '"Active user" might mean logged in this week (Product), made a purchase this month (Finance), or opened an email (Marketing). Before analyzing, agree on the definition and write it down.'),
    mc('Two teams report different "active users". Most likely cause?', ['Different definitions', 'Someone lied', 'A broken computer'], 'Definitions first, numbers second.'),
    ord('Order these steps before building a metric.', ['Ask how each team defines it', 'Agree on one definition', 'Write it down', 'Build the metric'], 'Documented assumptions save weeks of confusion.'),
  ], [rc('Before measuring "churn", first...', ['Agree on a definition', 'Make a chart', 'Email the CEO'])]),
];

// Stage 2 additions: QUERY, architecture, Google Apps Script
export const stage2y = [
  L('s2y1', 2, 'QUERY: SQL inside Google Sheets', 5, [
    ex('Sheets\' secret weapon', 'QUERY lets you write SQL-style questions right in a cell. Columns are named by letter.', fx('=QUERY(A1:D500, "select B, sum(D) group by B order by sum(D) desc")', 'Total sales per drink, biggest first')),
    mc('In QUERY, how are columns named?', ['By letter (A, B, C...)', 'By header text', 'By number'], 'select B means column B.'),
    mc('Which shows only Large drinks?', ['=QUERY(A1:D500, "select * where C = \'Large\'")', '=FILTER("Large")', '=QUERY("Large")'], 'Text values go in single quotes inside the query.'),
    ex('Bonus', 'When you learn SQL in Stage 4, QUERY will feel like an old friend.'),
  ], [rc('In Google Sheets QUERY, columns are written as...', ['Letters (A, B)', 'Header names', 'Numbers'])]),

  L('s2y2', 2, 'Spreadsheet architecture', 5, [
    ex('Three kinds of tabs', 'Pro spreadsheets separate jobs into tabs.', list([
      'Raw: pasted or imported data, never edited by hand',
      'Calc: formulas that clean and summarize',
      'Dashboard: the charts and numbers people look at',
    ])),
    ex('Never hardcode', 'Don\'t bury numbers inside formulas like =B2*1.08. Put the tax rate in its own labeled cell (Inputs!B1) and reference it. When the rate changes, you update one cell.', fx('=B2*Inputs!$B$1', 'Price × tax rate (from the Inputs tab)')),
    mc('Why keep raw data on its own tab?', ['You can paste new data without breaking formulas', 'It\'s required by Excel', 'It uses less space'], 'Next month: replace raw data, and everything else updates.'),
    mc('Which formula is better?', ['=B2*Inputs!$B$1', '=B2*1.08', '=B2*8%'], 'No hidden magic numbers.'),
  ], [rc('Hardcoding numbers in formulas is...', ['A bad habit', 'Best practice', 'Required'])]),

  L('s2z1', 2, 'Apps Script: meet automation', 4, [
    ex('Make Sheets do the boring work', 'Google Apps Script is a free coding tool built into Google Sheets. It uses JavaScript and can automate almost anything: clean data, send reports, build menus.', list([
      'Open it: Extensions menu → Apps Script',
      'Write a function, click Run',
      'The first run asks for permission. That\'s normal',
    ])),
    mc('Where do you open Apps Script?', ['Extensions → Apps Script', 'File → Download', 'Insert → Chart'], 'It lives inside every Google Sheet.'),
    mc('Which language does Apps Script use?', ['JavaScript', 'SQL', 'Python'], 'A friendly corner of JavaScript, with Google tools built in.'),
  ], [rc('Apps Script automates...', ['Google Sheets and Workspace', 'Excel desktop only', 'Printers'])]),

  L('s2z2', 2, 'Apps Script: your first function', 5, [
    ex('Hello, Sheet', 'A function is a named set of steps. This one writes text into cell A1.', code('function hello() {\n  const sheet = SpreadsheetApp.getActiveSheet();\n  sheet.getRange("A1").setValue("Hi Tori!");\n}', 'Cell A1 now says: Hi Tori!')),
    mc('What does getRange("A1") do?', ['Points at cell A1', 'Deletes A1', 'Creates a chart'], 'You point at a range, then read or write it.'),
    mc('What does setValue do?', ['Writes into the cell', 'Reads the cell', 'Colors the cell'], 'getValue reads, setValue writes.'),
    bl('SpreadsheetApp.getActiveSheet() gets the sheet you\'re ___.', ['looking at', 'deleting', 'printing'], 'The active (open) tab.'),
  ], [rc('In Apps Script, write to a cell with...', ['setValue', 'getValue', 'print'])]),

  L('s2z3', 2, 'Apps Script: reading and writing ranges', 5, [
    ex('Whole tables at once', 'getValues() reads a range as rows of values. You can loop over them, then write results back with setValues().', code('const data = sheet.getRange("A2:B10").getValues();\nfor (const row of data) {\n  Logger.log(row[0] + " costs " + row[1]);\n}')),
    mc('getValues() returns...', ['Rows of values (a list of lists)', 'One number', 'A chart'], 'Each row is a list: row[0] is the first column.'),
    mc('row[1] is which column of the range?', ['The second column', 'The first column', 'Row 1'], 'Counting starts at 0, just like Python!'),
    ex('Speed tip', 'Read everything with one getValues(), work on it, then write once with setValues(). Calling the sheet cell by cell is slow.'),
  ], [rc('Read a whole range in Apps Script with...', ['getValues()', 'readAll()', 'getCell()'])]),

  L('s2z4', 2, 'Apps Script: custom functions', 5, [
    ex('Your own formulas', 'Write a function in Apps Script, then use it in a cell like any built-in formula!', code('function TAX(price) {\n  return price * 1.08;\n}', 'In a cell: =TAX(B2)')),
    mc('After saving that script, how do you use it?', ['Type =TAX(B2) in a cell', 'Print the sheet', 'Restart Google'], 'Custom functions work just like SUM.'),
    mc('What does "return" do?', ['Sends the answer back to the cell', 'Deletes the function', 'Saves the file'], 'Whatever you return shows in the cell.'),
  ], [rc('Custom functions in Sheets are written in...', ['Apps Script', 'SQL', 'DAX'])]),

  L('s2z5', 2, 'Apps Script: triggers', 5, [
    ex('Run things automatically', 'Triggers run your function on their own: every morning, every hour, when the sheet is edited, or when a form is submitted.', list([
      'Time-driven: every day at 8am',
      'On edit: whenever someone changes a cell',
      'On form submit: when a Google Form response arrives',
      'Set them up in Apps Script → Triggers (clock icon)',
    ])),
    mc('You want a cleanup to run every Monday at 7am. Use...', ['A time-driven trigger', 'An on-edit trigger', 'A pivot table'], 'Set it once and forget it.'),
    mc('A form response should be copied to a summary tab instantly. Use...', ['An on-form-submit trigger', 'A daily trigger', 'Manual copy-paste'], 'It fires the moment a response arrives.'),
  ], [rc('Run a script every morning automatically with...', ['A time-driven trigger', 'A custom function', 'A filter'])]),

  L('s2z6', 2, 'Apps Script: emailing a report', 5, [
    ex('Reports that send themselves', 'Apps Script can email results with MailApp. Combine it with a daily trigger and your boss gets numbers every morning, automatically.', code('function sendReport() {\n  const total = SpreadsheetApp.getActiveSheet()\n    .getRange("B1").getValue();\n  MailApp.sendEmail("boss@company.com",\n    "Daily sales", "Today\'s total: $" + total);\n}')),
    mc('What does this script email?', ['The value in cell B1', 'The whole spreadsheet', 'Nothing'], 'It reads B1, then puts it in the email.'),
    mc('How do you make it send every morning?', ['Add a time-driven trigger', 'Click Run every day', 'Email it yourself'], 'Trigger + MailApp = automatic report.'),
  ], [rc('Send email from Apps Script with...', ['MailApp.sendEmail', 'Gmail.open', 'Logger.log'])]),

  L('s2z7', 2, 'Apps Script: custom menus', 4, [
    ex('Buttons for your team', 'onOpen() runs whenever the sheet opens. Use it to add a menu, so teammates can run your scripts without touching code.', code('function onOpen() {\n  SpreadsheetApp.getUi()\n    .createMenu("Tori Tools")\n    .addItem("Clean data", "cleanData")\n    .addToUi();\n}')),
    mc('When does onOpen run?', ['Every time the spreadsheet opens', 'Once a year', 'Never'], 'It\'s a special built-in trigger.'),
    ord('Order: building a team tool.', ['Write the function', 'Test it with Run', 'Add a menu item', 'Share the sheet'], 'Now anyone can click "Tori Tools → Clean data".'),
  ], [rc('Add a custom menu when a sheet opens using...', ['onOpen()', 'onClose()', 'menu.csv'])]),
];
