words = ["apple", "pear", "apple", "fig", "pear", "apple"]
counts = {}

⟦for word in words:
    counts[word] = counts.get(word, 0) + 1

print(counts)⟧
