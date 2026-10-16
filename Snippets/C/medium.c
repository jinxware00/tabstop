#include <stdio.h>

int main(void) {
    int scores[] = {82, 91, 76};
    int count = sizeof(scores) / sizeof(scores[0]);
    int total = 0;

    ⟦for (int i = 0; i < count; i++) {
        total += scores[i];
    }⟧

    printf("average: %d\n", total / count);
    return 0;
}
