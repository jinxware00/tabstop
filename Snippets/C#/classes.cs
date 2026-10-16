using System;

class Player {
    public string Name { get; set; } = "";
    public int Score { get; private set; }

    ⟦public void Boost(int amount) {
        Score += amount;
    }⟧
}
