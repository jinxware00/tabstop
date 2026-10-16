const numbers = [3, 1, 4, 1, 5, 9, 2, 6];

⟦const doubled = numbers.map((n) => n * 2);
const total = doubled.reduce((sum, n) => sum + n, 0);
console.log(total);⟧
