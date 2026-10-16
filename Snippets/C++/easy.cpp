#include <string>

std::string greet(const std::string& name) {
    return "Hello, " + name;
}

int main() {
    std::string name = "Jinx";
    ⟦auto message = greet(name);
    return message.empty() ? 1 : 0;⟧
}
