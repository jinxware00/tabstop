import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(3, 1, 4, 1, 5, 9);

        ⟦int total = numbers.stream()
                .filter(n -> n % 2 == 1)
                .mapToInt(Integer::intValue)
                .sum();
        System.out.println(total);⟧
    }
}
