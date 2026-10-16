public class Main {
    public static int parse(String value) {
        try {
            ⟦return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }⟧
    }
}
