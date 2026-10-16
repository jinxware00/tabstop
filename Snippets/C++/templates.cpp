#include <iostream>

template <typename T>
T maximum(T a, T b) {
    ⟦return a > b ? a : b;⟧
}

int main() {
    std::cout << maximum(4, 9) << std::endl;
    std::cout << maximum(2.5, 1.5) << std::endl;
    return 0;
}
