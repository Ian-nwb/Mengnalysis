import { bl, ex, fx, L, mc, rc, sql } from '../build';

// Extra Stage 4 lessons: SQL. Every answer is verified against src/sql/datasets.ts.
export const stage4x = [
  L('s4x1', 4, 'IN and BETWEEN', 5, [
    ex('Shortcuts for filters', 'IN checks a list of values. BETWEEN checks a range (including both ends).', fx("SELECT * FROM sales WHERE day IN ('Sat', 'Sun')", 'Weekend sales')),
    sql('Show sales of Mocha, Tea or Espresso using IN.', 'coffee', "SELECT * FROM sales WHERE drink IN ('Mocha', 'Tea', 'Espresso')", "WHERE drink IN ('Mocha', 'Tea', 'Espresso')", 'IN is much tidier than three ORs.'),
    sql('Show sales between 10 and 15 o\'clock (hour).', 'coffee', 'SELECT * FROM sales WHERE hour BETWEEN 10 AND 15', 'WHERE hour BETWEEN 10 AND 15', 'BETWEEN includes 10 and 15 themselves.'),
  ], [rc('BETWEEN 1 AND 5 includes 5?', ['Yes', 'No'])]),

  L('s4x2', 4, 'LIKE: pattern matching', 5, [
    ex('Partial matches', 'LIKE matches patterns. % means "anything here".', fx("SELECT * FROM sales WHERE drink LIKE '%Latte%'", 'Latte AND Iced Latte')),
    sql('Find every sale with "Latte" anywhere in the drink name.', 'coffee', "SELECT * FROM sales WHERE drink LIKE '%Latte%'", "WHERE drink LIKE '%Latte%'", '% on both sides = "contains".'),
    sql('Find songs whose title starts with "S".', 'music', "SELECT * FROM songs WHERE title LIKE 'S%'", "WHERE title LIKE 'S%'", "'S%' = starts with S."),
    mc("'%day' matches...", ['Anything ending in "day"', 'Anything starting with "day"', 'Only "day"'], 'Monday, Sunday, Slow Sunday...'),
  ], [rc("In LIKE, % means...", ['Any characters', 'Percent', 'Exactly one number'])]),

  L('s4x3', 4, 'Math in SELECT', 5, [
    ex('Calculate new columns', 'You can do math right in SELECT and name the result with AS. ROUND tidies decimals.', fx('SELECT drink, price * 1.1 AS with_tax FROM sales', 'Each price plus 10%')),
    sql('Show each song\'s title and its length in seconds (minutes × 60), named seconds.', 'music', 'SELECT title, minutes * 60 AS seconds FROM songs', 'SELECT title, minutes * 60 AS seconds FROM songs', 'New columns from math: super common.'),
    sql('Show the average price rounded to 2 decimals.', 'coffee', 'SELECT ROUND(AVG(price), 2) FROM sales', 'SELECT ROUND(AVG(price), 2) FROM sales', 'ROUND(value, decimals), same as in spreadsheets!'),
  ], [rc('Name a calculated column with...', ['AS', 'NAME', 'CALL'])]),

  L('s4x4', 4, 'COUNT DISTINCT', 4, [
    ex('How many different?', 'COUNT(*) counts rows. COUNT(DISTINCT column) counts different values.', fx('SELECT COUNT(DISTINCT drink) FROM sales', '6 different drinks')),
    sql('How many different artists are in the library?', 'music', 'SELECT COUNT(DISTINCT artist) FROM songs', 'SELECT COUNT(DISTINCT artist) FROM songs', 'Great for "how many unique customers?" questions.'),
    sql('How many different days had sales?', 'coffee', 'SELECT COUNT(DISTINCT day) FROM sales', 'COUNT(DISTINCT day)', 'Five weekdays!'),
  ], [rc('Count unique values with...', ['COUNT(DISTINCT col)', 'COUNT(*)', 'UNIQUE(col)'])]),

  L('s4x5', 4, 'Sorting by two columns', 4, [
    ex('Tie-breakers', 'ORDER BY can take several columns. The second one breaks ties in the first.', fx('SELECT * FROM songs ORDER BY genre, plays DESC', 'Grouped by genre, most played first')),
    sql('Show songs sorted by artist A–Z, then by plays (biggest first).', 'music', 'SELECT * FROM songs ORDER BY artist, plays DESC', 'ORDER BY artist, plays DESC', 'Each column can have its own direction.'),
  ], [rc('ORDER BY a, b: b is used to...', ['Break ties in a', 'Filter rows', 'Group rows'])]),

  L('s4x6', 4, 'Grouping by two columns', 5, [
    ex('Finer groups', 'GROUP BY two columns makes a group for every combination, like Rows AND Columns in a pivot table.', fx('SELECT day, drink, COUNT(*) FROM sales GROUP BY day, drink', 'Each drink on each day')),
    sql('Count sales for each combination of drink and size.', 'coffee', 'SELECT drink, size, COUNT(*) FROM sales GROUP BY drink, size', 'GROUP BY drink, size', 'Every column in SELECT that isn\'t a calculation must be in GROUP BY.'),
    mc('In GROUP BY queries, plain columns in SELECT must also be...', ['In the GROUP BY', 'In quotes', 'Numbers'], 'A classic error message waiting to happen otherwise!'),
  ], [rc('GROUP BY a, b creates groups for...', ['Each combination of a and b', 'Only a', 'Only b'])]),

  L('s4x7', 4, 'LEFT JOIN', 6, [
    ex('Keep everyone', 'A regular JOIN only keeps rows that match in both tables. LEFT JOIN keeps EVERY row from the first table, even with no match. Missing values show as empty (NULL).', fx('SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id', 'Ana appears too, with an empty item')),
    sql('Show every customer name with their order items, including customers with no orders.', 'shop', 'SELECT customers.name, orders.item FROM customers LEFT JOIN orders ON customers.id = orders.customer_id', 'FROM customers LEFT JOIN orders ON customers.id = orders.customer_id', 'Ana appears with (empty): she hasn\'t ordered yet.'),
    mc('Which JOIN keeps customers with no orders?', ['LEFT JOIN from customers', 'JOIN', 'Neither'], 'LEFT keeps everything from the left (first) table.'),
  ], [rc('LEFT JOIN keeps all rows from...', ['The first (left) table', 'The second table', 'Neither'])]),

  L('s4x8', 4, 'NULL: the empty value', 5, [
    ex('Nothing is special', 'NULL means "no value". You can\'t use = NULL; you must write IS NULL or IS NOT NULL.', fx('SELECT * FROM customers LEFT JOIN orders ON customers.id = orders.customer_id WHERE orders.id IS NULL', 'Customers who never ordered')),
    sql('Find the names of customers who have never ordered.', 'shop', 'SELECT customers.name FROM customers LEFT JOIN orders ON customers.id = orders.customer_id WHERE orders.id IS NULL', 'LEFT JOIN, then WHERE orders.id IS NULL', 'Finding "who\'s missing" is a classic analyst question (and interview question!).'),
    bl('To find empty values, write ___.', ['IS NULL', '= NULL', '== EMPTY'], '= NULL never matches anything. Sneaky!'),
  ], [rc('Check for empty values with...', ['IS NULL', '= NULL', 'EMPTY()'])]),

  L('s4x9', 4, 'Text functions', 4, [
    ex('Cleaning in SQL', 'SQL has text tools too: UPPER(), LOWER(), LENGTH(), TRIM(), and || to join text (in SQLite and many databases).', fx("SELECT UPPER(drink) FROM sales", 'LATTE, ESPRESSO...')),
    sql('Show each song title and how many characters it has (LENGTH).', 'music', 'SELECT title, LENGTH(title) FROM songs', 'SELECT title, LENGTH(title) FROM songs', 'Same cleaning ideas as spreadsheets, different spelling.'),
    sql("Show each customer as one text: name, ' from ', city (use ||).", 'shop', "SELECT name || ' from ' || city FROM customers", "SELECT name || ' from ' || city FROM customers", '|| glues text, like & in spreadsheets.'),
  ], [rc('In SQLite, join text with...', ['||', '&', '+'])]),

  L('s4x10', 4, 'Practice: the coffee report', 6, [
    ex('Put it all together', 'The owner has questions. Answer each with one query. Take your time and use hints if you need them!'),
    sql('Which size sells the most? Show size and count, biggest first.', 'coffee', 'SELECT size, COUNT(*) FROM sales GROUP BY size ORDER BY COUNT(*) DESC', 'GROUP BY size ORDER BY COUNT(*) DESC', 'Medium wins with 7, and Large is close behind with 6.'),
    sql('What is the average price of Large drinks?', 'coffee', "SELECT AVG(price) FROM sales WHERE size = 'Large'", "AVG(price) ... WHERE size = 'Large'", 'Filter first, then average.'),
    sql('Which drinks earned more than $10 in total?', 'coffee', 'SELECT drink, SUM(price) FROM sales GROUP BY drink HAVING SUM(price) > 10', 'GROUP BY drink HAVING SUM(price) > 10', 'HAVING filters the groups. You\'re fluent now!'),
  ], [rc('Filter on a SUM after grouping with...', ['HAVING', 'WHERE', 'LIMIT'])]),
];
