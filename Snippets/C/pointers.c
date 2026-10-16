#include <stdio.h>

void swap(int *a, int *b) {
    ⟦int temp = *a;
    *a = *b;
    *b = temp;⟧
}

int main(void) {
    int x = 3, y = 8;
    swap(&x, &y);
    printf("%d %d\n", x, y);
    return 0;
}
