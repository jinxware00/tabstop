#include <iostream>

class Counter {
  int count = 0;

public:
  ⟦void increment() { count += 1; }
  int value() const { return count; }⟧
};
