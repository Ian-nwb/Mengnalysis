import { bl, ex, L, list, mc, ord, rc, rec, reflect } from '../build';

// Stage 0: Data Foundations & Literacy (before Stage 1)
export const stage0 = [
  L('s0l1', 0, 'Files and folders', 4, [
    ex('Where data lives', 'Every dataset starts life as a file somewhere. Analysts keep files tidy so they (and teammates) can always find the right version.', list([
      'Name files clearly: sales_2026-06.csv, not final_FINAL2.csv',
      'Use dates as YYYY-MM-DD so files sort in order',
      'Keep raw files untouched in a "raw" folder; work on copies',
    ])),
    mc('Which file name is best?', ['sales_2026-06-01.csv', 'new file (3).csv', 'stuff.csv'], 'Clear subject + sortable date.'),
    mc('Why keep a "raw" folder you never edit?', ['You can always go back to the original', 'Raw files are faster', 'It looks organized'], 'If cleaning goes wrong, the original is safe.'),
    bl('Dates in file names should be written ___.', ['YYYY-MM-DD', 'DD/MM/YY', 'as words'], 'Year first means files sort in date order automatically.'),
  ], [rc('Best date format for file names:', ['YYYY-MM-DD', 'MM/DD', 'June 1st'])]),

  L('s0l2', 0, 'File types: CSV, XLSX, JSON', 5, [
    ex('The big four', 'You\'ll meet these formats every week.', list([
      '.csv: plain text, commas separate columns. Opens anywhere',
      '.tsv: like CSV but with tabs between columns',
      '.xlsx: an Excel workbook, with formulas, formatting and many tabs',
      '.json: nested "label: value" data, common from apps and APIs',
    ])),
    ex('A peek inside', 'This is what the same row looks like as CSV and as JSON.', rec('One sale', [
      ['CSV line', '1042,Latte,4.50'],
      ['JSON', '{"id": 1042, "drink": "Latte", "price": 4.50}'],
    ])),
    mc('A file has formulas and 3 tabs. It\'s probably...', ['.xlsx', '.csv', '.json'], 'CSV holds only plain values, with no formulas and no tabs.'),
    mc('An app sends nested data like {"user": {"name": "Ava"}}. Format?', ['JSON', 'CSV', 'XLSX'], 'Curly braces and labels = JSON.'),
  ], [rc('Plain text with commas between columns:', ['CSV', 'XLSX', 'JSON']), rc('Nested label: value data from apps:', ['JSON', 'TSV', 'CSV'])]),

  L('s0l3', 0, 'Delimiters and the leading-zero trap', 5, [
    ex('Delimiters', 'A delimiter is the character that separates columns: a comma in CSV, a tab in TSV. If a value contains a comma ("Austin, TX"), it gets wrapped in quotes so it stays in one column.'),
    ex('The leading-zero trap', 'Open a CSV straight in Excel and ZIP code 02134 becomes 2134. Long IDs can turn into 1.2E+15, and "3-4" can become a date! Excel guesses types. Import instead, and set those columns to Text.'),
    mc('ZIP code 02134 shows as 2134. Why?', ['It was read as a number', 'The file is corrupted', 'ZIP codes can\'t start with 0'], 'Numbers drop leading zeros. Treat IDs and ZIP codes as text.'),
    mc('Safest way to open a CSV in Excel?', ['Data → From Text/CSV, and set tricky columns to Text', 'Double-click it', 'Rename it to .xlsx'], 'Importing lets you choose column types.'),
    bl('In CSV files, the column separator is called a ___.', ['delimiter', 'divider key', 'header'], 'Comma, tab, semicolon… all delimiters.'),
  ], [rc('Why might 02134 become 2134?', ['Read as a number', 'Bad internet', 'Too many rows'])]),

  L('s0l4', 0, 'Cloud vs. local files', 4, [
    ex('Two homes for files', 'Local files live on one computer. Cloud files (Google Drive, OneDrive, SharePoint) live online: always backed up, shareable, and everyone sees the latest version.'),
    mc('Five teammates need the latest sales file. Best place?', ['A shared cloud folder', 'Your desktop', 'A USB stick'], 'One source of truth, always up to date.'),
    mc('A big risk of emailing spreadsheets back and forth?', ['Nobody knows which version is current', 'Email is too fast', 'Spreadsheets can\'t be emailed'], '"v2_final_REALLY_final.xlsx" chaos!'),
  ], [rc('A "single source of truth" usually lives...', ['In a shared cloud location', 'In email attachments', 'On a sticky note'])]),

  L('s0l5', 0, 'What is one row? (granularity)', 6, [
    ex('The most important question', 'Granularity means what ONE row represents. In an orders table, one row = one order. In an order_items table, one row = one item inside an order. Mixing them breaks your math.', rec('Order #55 as items', [
      ['Row 1', 'Order 55 · Latte · $4.50'],
      ['Row 2', 'Order 55 · Muffin · $3.00'],
      ['Row 3', 'Order 55 · Tea · $2.50'],
    ])),
    mc('Using the item table above, COUNT(*) gives 3. How many ORDERS is that?', ['1', '3', '0'], 'Three rows, but all from order 55. Count distinct order IDs instead.'),
    mc('The order total is copied onto every item row ($10 each). SUM gives $30. What happened?', ['Double counting from mixed granularity', 'Correct total', 'A formula typo'], 'The real total is $10. Always ask "what is one row?" before summing.'),
    bl('What one row represents is called ___.', ['granularity', 'formatting', 'a delimiter'], 'Analysts check this first, every time.'),
  ], [rc('One row in an order_items table is...', ['One item in an order', 'One whole order', 'One customer'])]),

  L('s0l6', 0, 'Primary and foreign keys', 6, [
    ex('IDs that connect tables', 'A primary key uniquely identifies each row (customer_id 7 is exactly one customer). A foreign key is a column in another table that points to it (orders.customer_id = 7).', rec('How they link', [
      ['customers.id (primary key)', '7 → Gus'],
      ['orders.customer_id (foreign key)', '7, 7, 7 → three orders by Gus'],
    ])),
    mc('Which column is a good primary key?', ['customer_id', 'first_name', 'city'], 'IDs are unique. Two people can share a name or a city.'),
    mc('orders.customer_id points to customers.id. orders.customer_id is a...', ['Foreign key', 'Primary key', 'Delimiter'], 'It refers to another table\'s primary key.'),
    ex('You\'ll use this everywhere', 'XLOOKUP matches keys. SQL JOINs match keys. Power BI relationships match keys. This one idea powers it all!'),
  ], [rc('A column that uniquely identifies each row:', ['Primary key', 'Foreign key', 'Header']), rc('A column pointing to another table\'s ID:', ['Foreign key', 'Primary key', 'Index'])]),

  L('s0l7', 0, 'How apps store data', 5, [
    ex('Behind every tap', 'When you order on a coffee app, it writes rows to a database: one in orders, some in order_items, maybe one in payments. Each table has keys linking them. Analysts later query those same tables.'),
    ord('An app order becomes data. Put it in order.', ['You tap "Order"', 'The app saves rows to its database', 'Data is copied to a warehouse', 'An analyst queries it'], 'From tap to insight. You\'ll learn every step of this pipeline.'),
    mc('Why split data into several tables instead of one giant one?', ['No repeating the same info over and over', 'Databases can only hold small tables', 'It\'s random'], 'Customer details live once in customers, not copied onto every order.'),
  ], [rc('Apps save each action as...', ['Rows in database tables', 'Screenshots', 'Emails'])]),

  L('s0l8', 0, 'Data lifecycle and PII', 5, [
    ex('Where data comes from', 'Common sources: CRM (customer records like Salesforce), web tracking (clicks and visits), and POS (point-of-sale registers).'),
    ex('PII and privacy laws', 'PII (personally identifiable information) is anything that identifies a person: name, email, phone, address, ID numbers. Laws like GDPR (Europe) require companies to protect it, use it only for clear purposes, and delete it on request.'),
    mc('Which is PII?', ['An email address', 'Total June revenue', 'Average order size'], 'It points to one specific person.'),
    mc('A store\'s register system is a...', ['POS system', 'CRM', 'JSON file'], 'Point of sale = where the sale happens.'),
    bl('GDPR is a ___ law.', ['privacy', 'tax', 'traffic'], 'It protects people\'s personal data.'),
  ], [rc('PII stands for...', ['Personally identifiable information', 'Private internet index', 'Public input item'])]),

  L('s0l9', 0, 'Boss level: the messy Downloads folder', 7, [
    ex('Your case', 'Your new manager shares a folder: "final.xlsx", "final2.xlsx", "customers.json", "export (1).csv" and "IMPORTANT sales.csv". You need June sales by customer. Let\'s get organized.'),
    mc('First step?', ['Copy everything into a "raw" folder and never edit it', 'Delete the duplicates you don\'t like', 'Start typing a report'], 'Protect the originals first.'),
    mc('"export (1).csv" shows ZIP 2134 instead of 02134. Fix?', ['Re-import with ZIP as a Text column', 'Type the zeros back by hand', 'Ignore it'], 'Import settings fix it for every row at once.'),
    mc('customers.json has customer_id, and the sales CSV has customer_id too. That shared column is...', ['A key to connect them', 'A duplicate to delete', 'PII to remove'], 'Matching keys lets you combine the files.'),
    mc('The sales file has one row per ITEM. To count orders, you...', ['Count distinct order IDs', 'Count rows', 'Sum the prices'], 'Granularity check: rows are items, not orders!'),
    reflect('Tell your manager, in plain words, what you did with the folder and why.', 'I saved the original files untouched, re-imported the sales file so ZIP codes kept their zeros, and linked sales to customers using their customer ID. Now we can trust the June numbers, and I can redo it anytime.'),
  ], [rc('Before cleaning a shared folder, first...', ['Save untouched originals', 'Rename everything', 'Delete old files'])]),
];
