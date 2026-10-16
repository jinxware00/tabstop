import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        List<String> words = List.of("apple", "pear", "apple");
        Map<String, Integer> counts = new HashMap<>();

        ⟦for (String word : words) {
            counts.put(word, counts.getOrDefault(word, 0) + 1);
        }

        System.out.println(counts);⟧
    }
}
