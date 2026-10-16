SELECT name, price, category,
       ⟦RANK() OVER (
         PARTITION BY category
         ORDER BY price DESC
       ) AS rank_in_cat⟧
FROM products;
