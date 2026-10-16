const words = ["alpha", "beta", "gamma", "ab"];

const byLength = words.reduce((groups, word) => {
  ⟦const key = word.length;
  (groups[key] ??= []).push(word);⟧
  return groups;
}, {});

console.log(byLength);
