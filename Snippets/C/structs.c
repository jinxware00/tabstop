#include <stdio.h>

struct Point {
    int x;
    int y;
};

⟦int distance_sq(struct Point a, struct Point b) {
    int dx = b.x - a.x;
    int dy = b.y - a.y;
    return dx * dx + dy * dy;
}⟧
