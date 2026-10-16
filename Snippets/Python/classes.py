class Player:
    def __init__(self, name, score=0):
        self.name = name
        self.score = score

    ⟦def boost(self, amount):
        self.score += amount
        return self.score⟧
