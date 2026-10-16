#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {3, 1, 4, 1, 5};
    int total = 0;

    ⟦for (int n : numbers) {
        total += n;
    }

    std::cout << total << std::endl;⟧
    return 0;
}
