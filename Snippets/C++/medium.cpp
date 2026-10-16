#include <iostream>
#include <vector>

int main() {
    std::vector<int> scores = {82, 91, 76};
    int total = 0;

    ⟦for (int value : scores) {
        total += value;
    }⟧

    std::cout << "average: " << total / scores.size() << std::endl;
    return 0;
}
