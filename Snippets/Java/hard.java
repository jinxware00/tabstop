import java.util.List;
import java.util.Optional;

public class Best {
    record Player(String name, int score) {}

    public static Optional<Player> top(List<Player> players) {
        ⟦return players.stream()
            .max((a, b) -> Integer.compare(a.score(), b.score()));⟧
    }
}
