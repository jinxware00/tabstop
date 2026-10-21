#include <string>
#include <unordered_map>
#include <vector>

std::unordered_map<std::string, int> countWords(
    const std::vector<std::string>& words
) {
    std::unordered_map<std::string, int> counts;

    for (const auto& word : words) {
        ++counts[word];
    }

    return counts;
}
