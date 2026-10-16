SELECT o.id, c.name, o.total
FROM orders o
⟦INNER JOIN customers c
  ON c.id = o.customer_id
WHERE o.total > 100⟧
ORDER BY o.total DESC;
