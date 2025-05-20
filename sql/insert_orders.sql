INSERT INTO bigorders (created_at, total_amount, tax, due_date)
SELECT
  NOW() - (random() * INTERVAL '365 days') AS created_at,
  ROUND(({{min_amount}} + (random() * ({{max_amount}} - {{min_amount}})))::numeric, 2) AS total_amount,
  ROUND(
    (
      ({{min_tax_percent}} + (random() * ({{max_tax_percent}} - {{min_tax_percent}}))) / 100 *
      ({{min_amount}} + (random() * ({{max_amount}} - {{min_amount}})))
    )::numeric, 2
  ) AS tax,
  (NOW() - (random() * INTERVAL '365 days'))::date + ({{min_due_days}} + (random() * ({{max_due_days}} - {{min_due_days}})))::integer AS due_date
FROM generate_series({{start}}, {{end}} - 1);
