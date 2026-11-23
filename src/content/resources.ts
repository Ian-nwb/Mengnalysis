// Free, reputable places to keep practicing outside the app.
export type Resource = { title: string; what: string; url: string; topic: string };

export const RESOURCES: Resource[] = [
  { topic: 'Spreadsheets', title: 'Google Sheets function list', what: 'Every Sheets function with examples.', url: 'https://support.google.com/docs/table/25273' },
  { topic: 'Spreadsheets', title: 'Excel functions by category', what: "Microsoft's guide to every Excel function.", url: 'https://support.microsoft.com/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb' },
  { topic: 'SQL', title: 'SQLBolt', what: 'Short interactive SQL lessons in the browser.', url: 'https://sqlbolt.com' },
  { topic: 'SQL', title: 'Mode SQL tutorial', what: 'SQL for analysts, from basics to advanced.', url: 'https://mode.com/sql-tutorial' },
  { topic: 'Python', title: 'Kaggle Learn', what: 'Free micro-courses: Python, pandas, SQL and data visualization.', url: 'https://www.kaggle.com/learn' },
  { topic: 'Python', title: 'Google Colab', what: 'Run Python notebooks free in your browser.', url: 'https://colab.research.google.com' },
  { topic: 'Python', title: 'pandas getting started', what: 'The official beginner tutorials.', url: 'https://pandas.pydata.org/docs/getting_started/index.html' },
  { topic: 'Python', title: 'freeCodeCamp: Data Analysis with Python', what: 'A free certification course with projects.', url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
  { topic: 'Dashboards', title: 'Microsoft Learn: Power BI', what: 'Free official Power BI training paths.', url: 'https://learn.microsoft.com/training/powerplatform/power-bi' },
  { topic: 'Dashboards', title: 'Looker Studio help', what: "Google's guides for free dashboards.", url: 'https://support.google.com/looker-studio' },
  { topic: 'Dashboards', title: 'Tableau Public', what: 'Free Tableau to build and share portfolio dashboards.', url: 'https://public.tableau.com' },
  { topic: 'Charts', title: 'Storytelling with Data blog', what: 'Practical advice on clear, honest charts.', url: 'https://www.storytellingwithdata.com/blog' },
  { topic: 'Modern stack', title: 'dbt Learn', what: 'Free courses on analytics engineering with dbt.', url: 'https://learn.getdbt.com' },
  { topic: 'Modern stack', title: 'DuckDB documentation', what: 'Fast SQL on local CSV and Parquet files.', url: 'https://duckdb.org/docs/' },
  { topic: 'Datasets', title: 'Kaggle datasets', what: 'Thousands of free datasets for portfolio projects.', url: 'https://www.kaggle.com/datasets' },
  { topic: 'Datasets', title: 'Data.gov', what: 'Free open government data.', url: 'https://data.gov' },
  { topic: 'Career', title: 'Google Data Analytics Certificate', what: 'A well-known beginner certificate program.', url: 'https://grow.google/certificates/data-analytics/' },
];
