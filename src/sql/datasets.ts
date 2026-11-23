// Small, fun datasets for the SQL sandbox. Keep them small enough that
// every answer is checkable by eye, and deterministic (no dates like "now").

export type DatasetId = 'coffee' | 'shop' | 'music' | 'app';

export type Dataset = {
  id: DatasetId;
  title: string;
  tables: { name: string; columns: string[] }[];
  sql: string;
};

export const DATASETS: Record<DatasetId, Dataset> = {
  coffee: {
    id: 'coffee',
    title: 'Bean There Coffee',
    tables: [{ name: 'sales', columns: ['id', 'day', 'hour', 'drink', 'size', 'price'] }],
    sql: `
DROP TABLE IF EXISTS sales;
CREATE TABLE sales (id INTEGER, day TEXT, hour INTEGER, drink TEXT, size TEXT, price REAL);
INSERT INTO sales VALUES
(1,'Mon',8,'Latte','Medium',4.5),
(2,'Mon',9,'Espresso','Small',3.0),
(3,'Mon',13,'Iced Latte','Large',5.5),
(4,'Mon',16,'Cold Brew','Large',4.75),
(5,'Tue',8,'Latte','Large',5.0),
(6,'Tue',10,'Mocha','Medium',5.25),
(7,'Tue',15,'Iced Latte','Large',5.5),
(8,'Wed',7,'Espresso','Small',3.0),
(9,'Wed',8,'Latte','Medium',4.5),
(10,'Wed',12,'Tea','Small',2.5),
(11,'Wed',17,'Cold Brew','Medium',4.25),
(12,'Thu',9,'Mocha','Large',5.75),
(13,'Thu',14,'Iced Latte','Medium',5.0),
(14,'Fri',8,'Latte','Medium',4.5),
(15,'Fri',11,'Tea','Medium',3.0),
(16,'Fri',16,'Cold Brew','Large',4.75);
`,
  },
  shop: {
    id: 'shop',
    title: 'Online plant shop',
    tables: [
      { name: 'customers', columns: ['id', 'name', 'city'] },
      { name: 'orders', columns: ['id', 'customer_id', 'item', 'total'] },
    ],
    sql: `
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS orders;
CREATE TABLE customers (id INTEGER, name TEXT, city TEXT);
CREATE TABLE orders (id INTEGER, customer_id INTEGER, item TEXT, total REAL);
INSERT INTO customers VALUES
(1,'Maria','Austin'),(2,'Sam','Denver'),(3,'Priya','Austin'),(4,'Leo','Chicago'),(5,'Ana','Denver');
INSERT INTO orders VALUES
(101,1,'Monstera',45.0),(102,1,'Pothos',18.0),(103,2,'Cactus',12.0),
(104,3,'Fiddle Leaf Fig',60.0),(105,3,'Pothos',18.0),(106,3,'Snake Plant',30.0),
(107,4,'Cactus',12.0),(108,1,'Snake Plant',30.0);
`,
  },
  music: {
    id: 'music',
    title: 'Your music library',
    tables: [{ name: 'songs', columns: ['id', 'title', 'artist', 'genre', 'plays', 'minutes'] }],
    sql: `
DROP TABLE IF EXISTS songs;
CREATE TABLE songs (id INTEGER, title TEXT, artist TEXT, genre TEXT, plays INTEGER, minutes REAL);
INSERT INTO songs VALUES
(1,'Golden Hour','Nova Ray','Pop',320,3.5),
(2,'Midnight Drive','The Lanterns','Rock',150,4.2),
(3,'Sunflower Fields','Nova Ray','Pop',410,3.1),
(4,'Rainy Café','Lo & Behold','Lo-fi',95,2.8),
(5,'Neon Hearts','The Lanterns','Rock',275,3.9),
(6,'Study Session','Lo & Behold','Lo-fi',500,3.0),
(7,'Paper Planes','Nova Ray','Pop',60,3.4),
(8,'Slow Sunday','Lo & Behold','Lo-fi',210,2.6),
(9,'Thunder Road Trip','The Lanterns','Rock',30,5.1),
(10,'Cherry Soda','Mint Club','Pop',180,2.9);
`,
  },
  app: {
    id: 'app',
    title: 'Study app (messy, real-world)',
    tables: [
      { name: 'users', columns: ['id', 'name', 'signup_date', 'plan', 'referrer'] },
      { name: 'logins', columns: ['user_id', 'login_date'] },
      { name: 'payments', columns: ['id', 'user_id', 'paid_on', 'amount'] },
      { name: 'daily_sales', columns: ['day', 'sales'] },
    ],
    sql: `
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS logins;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS daily_sales;
CREATE TABLE users (id INTEGER, name TEXT, signup_date TEXT, plan TEXT, referrer TEXT);
CREATE TABLE logins (user_id INTEGER, login_date TEXT);
CREATE TABLE payments (id INTEGER, user_id INTEGER, paid_on TEXT, amount REAL);
CREATE TABLE daily_sales (day INTEGER, sales INTEGER);
INSERT INTO users VALUES
(1,'Ava','2026-01-04','pro','instagram'),(2,'Ben','2026-01-15','free',NULL),(3,'Cleo','2026-01-28','pro','friend'),
(4,'Dev','2026-02-02','free','instagram'),(5,'Eli','2026-02-14','pro',NULL),(6,'Fay','2026-02-20','free','search'),
(7,'Gus','2026-03-03','pro','search'),(8,'Hana','2026-03-18','free',NULL);
INSERT INTO logins VALUES
(1,'2026-01-10'),(1,'2026-02-11'),(1,'2026-03-09'),(2,'2026-01-20'),(3,'2026-02-05'),
(4,'2026-02-03'),(5,'2026-03-01'),(6,'2026-03-12'),(7,'2026-03-04'),(8,'2026-03-20');
INSERT INTO payments VALUES
(1,1,'2026-01-04',12.0),(2,1,'2026-02-04',12.0),(3,3,'2026-01-28',12.0),(4,3,'2026-01-28',12.0),
(5,5,'2026-02-14',12.0),(6,7,'2026-03-03',12.0),(7,5,'2026-03-14',12.0),(8,7,'2026-03-03',12.0);
INSERT INTO daily_sales VALUES (1,100),(2,140),(3,90),(4,160),(5,120),(6,200),(7,180),(8,150),(9,210),(10,170);
`,
  },
};
