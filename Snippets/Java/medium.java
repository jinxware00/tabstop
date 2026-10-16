public class Averages {
    public static void main(String[] args) {
        int[] scores = {82, 91, 76};
        int total = 0;

        ⟦for (int score : scores) {
            total += score;
        }⟧

        System.out.println("average: " + total / scores.length);
    }
}
