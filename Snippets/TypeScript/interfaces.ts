interface Player {
  name: string;
  score: number;
}

⟦function best(players: Player[]): Player {
  return players.reduce((a, b) => (b.score > a.score ? b : a));
}⟧
