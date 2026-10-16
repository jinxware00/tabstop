WITH weekly AS (
  SELECT customer_id,
         SUM(total) AS spent
  FROM orders
  WHERE created_at >= '2026-01-01'
  GROUP BY customer_id
),
ranked AS (
  SELECT customer_id,
         ⟦RANK() OVER (ORDER BY spent DESC) AS spend_rank⟧
  FROM weekly
)
SELECT r.customer_id, c.name, r.spent
FROM ranked r
JOIN customers c ON c.id = r.customer_id
WHERE r.spend_rank <= 5
ORDER BY r.spend_rank;
