#include <algorithm>
#include <vector>

std::vector<int> keepEven(const std::vector<int>& nums) {
    std::vector<int> result;

    for (int num : nums) {
        if (num % 2 == 0) {
            result.push_back(num);
        }
    }

    return result;
}
