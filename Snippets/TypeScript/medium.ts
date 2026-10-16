interface Player {
  name: string;
  score: number;
}

function describe(player: Player): string {
  ⟦return `${player.name} scored ${player.score}`;⟧
}

console.log(describe({ name: "Jinx", score: 100 }));
