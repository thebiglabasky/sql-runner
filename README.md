# sql-runner

## Setup

```sh
npm install
```

## Configuration

Create a `.env` file at the project root:

```
DB_CONNECTION_STRING=your_database_url_here
```

## Example: Generate Orders in Batches

Create a job YAML (e.g. `jobs/orders_n_rows.yaml`):

```yaml
name: generate_orders
sql_file: insert_orders.sql
total_rows: 1000000
batch_size: 20000
description: Generate 1M orders in batches of 20k
parameters:
  min_amount: 10.00
  max_amount: 1000.00
  min_tax_percent: 5
  max_tax_percent: 15
  min_due_days: 7
  max_due_days: 60
```

The SQL template (`sql/insert_orders.sql`) should use placeholders like `{{min_amount}}`, `{{max_amount}}`, and the above parameters.

## Run the Job

```sh
npm start -- run jobs/orders_n_rows.yaml
```

This will execute the job, inserting data in batches with progress feedback.
