#include <iostream>

void doubleValue(int &value) {
    ⟦value *= 2;⟧
}

int main() {
    int score = 21;
    doubleValue(score);
    std::cout << score << std::endl;
    return 0;
}
