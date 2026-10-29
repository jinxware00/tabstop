using System;
using System.Linq;
using System.Collections.Generic;

List<Player> players = new();

⟦var top = players
    .Where(p => p.Score > 50)
    .OrderByDescending(p => p.Score)
    .Take(3)
    .Select(p => p.Name)
    .ToList();⟧

record Player(string Name, int Score);
