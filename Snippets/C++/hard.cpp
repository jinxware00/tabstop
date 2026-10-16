#include <algorithm>
#include <string>
#include <vector>

template <typename T>
void sortAscending(std::vector<T>& items) {
    ⟦std::sort(items.begin(), items.end(),
        [](const T& a, const T& b) {
            return a < b;
        });⟧
}

int main() {
    std::vector<std::string> names = {"zoe", "ada", "bo"};
    sortAscending(names);
    return 0;
}
