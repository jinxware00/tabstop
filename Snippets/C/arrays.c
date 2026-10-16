#include <stdio.h>

int main(void) {
    int values[] = {4, 8, 15, 16, 23, 42};
    int total = 0;

    ⟦for (int i = 0; i < 6; i++) {
        total += values[i];
    }

    printf("Sum: %d\n", total);⟧
    return 0;
}
