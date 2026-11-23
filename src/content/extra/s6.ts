import { bl, code, ex, L, list, mc, rc } from '../build';

// Extra Stage 6 lessons: Python & pandas
export const stage6x = [
  L('s6x1', 6, 'Strings and f-strings', 4, [
    ex('Working with text', 'Strings have handy methods: .upper(), .lower(), .strip() (removes spaces), .replace().', code('name = "  tori  "\nprint(name.strip().title())', 'Tori')),
    ex('f-strings', 'Put f before the quotes to drop variables into text with {curly braces}.', code('sales = 42\nprint(f"We sold {sales} coffees")', 'We sold 42 coffees')),
    mc('What prints?', ['LATTE', 'latte', 'Latte'], '.upper() makes every letter capital.', code('print("Latte".upper())')),
  ], [rc('Remove spaces around text with...', ['.strip()', '.trim()', '.clean()'])]),

  L('s6x2', 6, 'Dictionaries', 5, [
    ex('Labels and values', 'A dictionary stores pairs: a key and its value. Like one row of a table!', code('sale = {"drink": "Mocha", "price": 5.25}\nprint(sale["drink"])', 'Mocha')),
    mc('What prints?', ['5.25', 'price', 'Mocha'], 'sale["price"] looks up the value for the key "price".', code('sale = {"drink": "Mocha", "price": 5.25}\nprint(sale["price"])')),
    bl('In {"city": "Austin"}, "city" is the ___.', ['key', 'value', 'list'], 'Key → value.'),
  ], [rc('In a dictionary, you look up values by...', ['Key', 'Position number', 'Color'])]),

  L('s6x3', 6, 'Functions', 5, [
    ex('Reusable recipes', 'def creates your own function. return sends back the answer.', code('def with_tax(price):\n    return price * 1.1\n\nprint(with_tax(10))', '11.0')),
    mc('What prints?', ['8', '4', 'double'], 'The function returns 4 × 2.', code('def double(x):\n    return x * 2\n\nprint(double(4))')),
    mc('Why write functions?', ['To reuse the same steps without copy-pasting', 'To make code longer', 'Python requires them'], 'Write once, use everywhere.'),
  ], [rc('Python keyword to create a function:', ['def', 'func', 'make'])]),

  L('s6x4', 6, 'Reading error messages', 5, [
    ex('Errors are clues', 'Every programmer sees errors daily. Read the LAST line first: it says what went wrong.', list([
      'NameError: you used a name that doesn\'t exist (typo?)',
      'KeyError: that column or key doesn\'t exist',
      'SyntaxError: a missing bracket, quote or colon',
      'TypeError: mixing types, like "5" + 5',
    ])),
    mc('df["prcie"] gives KeyError. Why?', ['Typo in the column name', 'pandas is broken', 'Too much data'], '"prcie" should be "price".'),
    mc('"5" + 5 gives...', ['TypeError', '10', '55'], 'Text plus number doesn\'t mix. Use int("5") + 5.'),
    bl('Read the ___ line of an error first.', ['last', 'first', 'middle'], 'The last line names the problem.'),
  ], [rc('A typo in a column name usually gives...', ['KeyError', 'SyntaxError', 'No error'])]),

  L('s6x5', 6, 'Notebooks', 4, [
    ex('Code + notes + charts', 'Analysts usually write Python in notebooks (Jupyter or Google Colab). A notebook has cells: run one at a time and see the result right below it. You can add text cells to explain your thinking.'),
    mc('Why are notebooks great for analysis?', ['You see results step by step, with notes', 'They\'re faster than computers', 'They need no data'], 'Your notebook becomes your report.'),
    mc('Free notebook in the browser from Google:', ['Colab', 'Docs', 'Sheets'], 'colab.research.google.com.'),
  ], [rc('Google\'s free online notebook:', ['Colab', 'Keep', 'Slides'])]),

  L('s6x6', 6, 'Sorting and counting', 5, [
    ex('Two everyday tools', 'sort_values sorts a DataFrame. value_counts counts each value: instant frequency table!', code('df["drink"].value_counts()', 'Latte 4, Iced Latte 3, Cold Brew 3...')),
    mc('Which shows most expensive sales first?', ['df.sort_values("price", ascending=False)', 'df.sort("price")', 'df.price.top()'], 'ascending=False = biggest first.'),
    mc('Fastest way to count each genre?', ['df["genre"].value_counts()', 'A for loop', 'df.count()'], 'One line, sorted biggest first.'),
  ], [rc('Count each value in a column with...', ['value_counts()', 'count_each()', 'freq()'])]),

  L('s6x7', 6, 'New columns', 4, [
    ex('Calculated columns', 'Create a column by assigning to it. The math applies to every row at once.', code('df["total"] = df["price"] * df["qty"]')),
    mc('Add a column with price plus 10% tax:', ['df["with_tax"] = df["price"] * 1.1', 'df.add("tax")', 'with_tax = price + 10'], 'Like dragging a formula down a whole column, in one line.'),
    bl('Math on a column applies to every ___ at once.', ['row', 'file', 'chart'], 'No loops needed!'),
  ], [rc('df["c"] = df["a"] + df["b"] does what?', ['Creates column c for every row', 'Deletes a and b', 'Makes a chart'])]),

  L('s6x8', 6, 'Dates in pandas', 5, [
    ex('Turn text into dates', 'Dates often load as text. pd.to_datetime fixes that, and then .dt gives you parts.', code('df["date"] = pd.to_datetime(df["date"])\ndf["month"] = df["date"].dt.month')),
    mc('Why convert to datetime?', ['So you can sort and group by real dates', 'It looks nicer', 'pandas requires it for everything'], 'Text "10/2" and "9/30" sort wrongly as text!'),
    mc('Which gives the weekday name?', ['df["date"].dt.day_name()', 'df["date"].weekday_text', 'day(df)'], 'Monday, Tuesday...'),
  ], [rc('Convert text to dates with...', ['pd.to_datetime()', 'pd.date()', 'str.date()'])]),

  L('s6x9', 6, 'Pivot tables in pandas', 5, [
    ex('pivot_table', 'You know pivot tables. pandas has one too: index = Rows, columns = Columns, values + aggfunc = Values.', code('df.pivot_table(index="drink", columns="day",\n               values="price", aggfunc="sum")')),
    mc('In pivot_table, index= is like the pivot\'s...', ['Rows', 'Values', 'Filters'], 'Each drink becomes a row.'),
    mc('aggfunc="mean" would show...', ['Average price per drink and day', 'Total price', 'Count of rows'], 'Change aggfunc to change the calculation.'),
  ], [rc('pivot_table index= sets the...', ['Rows', 'Values', 'Title'])]),

  L('s6x10', 6, 'Reading and saving files', 4, [
    ex('In and out', 'pandas reads and writes many formats.', list([
      'pd.read_csv("file.csv") / df.to_csv("out.csv")',
      'pd.read_excel("file.xlsx") / df.to_excel("out.xlsx")',
      'Google Sheets: File → Download → CSV, then read_csv',
    ])),
    mc('Your boss sends an Excel file. Load it with...', ['pd.read_excel()', 'pd.read_word()', 'open_excel()'], 'pandas speaks Excel!'),
    mc('Save cleaned data for a teammate using Excel:', ['df.to_excel("clean.xlsx")', 'df.print()', 'df.save_chart()'], 'Python and spreadsheets work great together.'),
  ], [rc('Load an Excel file in pandas:', ['pd.read_excel()', 'pd.open()', 'pd.xlsx()'])]),
];
