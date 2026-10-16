public class Player {
    private String name;
    private int score = 0;

    public Player(String name) {
        this.name = name;
    }

    ⟦public void boost(int amount) {
        score += amount;
    }

    public int getScore() {
        return score;
    }⟧
}
