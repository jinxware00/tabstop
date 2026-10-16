using System;
using System.Collections.Generic;

var scores = new List<int> { 82, 91, 76 };
int total = 0;

⟦foreach (var score in scores)
{
    total += score;
}⟧

Console.WriteLine($"average: {total / scores.Count}");
