#include <stdlib.h>
#include <stdio.h>

int main(void) {
    ⟦int *data = malloc(5 * sizeof(int));
    if (data == NULL) return 1;

    for (int i = 0; i < 5; i++) data[i] = i * i;
    printf("%d\n", data[4]);
    free(data);⟧
    return 0;
}
