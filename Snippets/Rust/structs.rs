struct Player {
    name: String,
    score: i32,
}

impl Player {
    ⟦fn new(name: &str) -> Player {
        Player { name: name.to_string(), score: 0 }
    }

    fn boost(&mut self, amount: i32) {
        self.score += amount;
    }⟧
}
