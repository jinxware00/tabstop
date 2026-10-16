SELECT category,
       ⟦COUNT(*) AS items,
       AVG(price) AS avg_price,
       MAX(price) AS highest⟧
FROM products
GROUP BY category
ORDER BY items DESC;
