SELECT name, price, category
FROM products
⟦WHERE price > 10 AND category = 'tools'
ORDER BY price DESC
LIMIT 10;⟧
