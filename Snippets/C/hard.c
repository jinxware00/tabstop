#include <stdio.h>

struct Player {
    char name[32];
    int score;
};

⟦void boost(struct Player *player, int amount) {
    player->score += amount;
}⟧

int main(void) {
    struct Player player = {"Ada", 100};
    boost(&player, 50);
    printf("%s: %d\n", player.name, player.score);
    return 0;
}
