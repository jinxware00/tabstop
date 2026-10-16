SELECT category,
       COUNT(*) AS items,
       AVG(price) AS avg_price
FROM products
GROUP BY category
⟦HAVING COUNT(*) > 3
ORDER BY items DESC;⟧
