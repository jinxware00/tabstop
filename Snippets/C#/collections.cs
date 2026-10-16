using System;
using System.Collections.Generic;

List<int> numbers = new() {4, 8, 15, 16, 23, 42};
Dictionary<string, int> counts = new();

⟦foreach (int n in numbers) {
    counts["odd" + (n % 2)] = counts.GetValueOrDefault("odd" + (n % 2)) + 1;
}

Console.WriteLine(counts.Count);⟧
