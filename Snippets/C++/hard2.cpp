#include <memory>
#include <utility>

template <typename T>
class Box {
public:
    explicit Box(T value)
        : value_(std::make_unique<T>(std::move(value))) {}

    const T& get() const {
        return *value_;
    }

private:
    std::unique_ptr<T> value_;
};
