enum Direction {
    North,
    East,
    South,
    West,
}

fn main() {
    let heading = Direction::East;
    ⟦let moved = match heading {
        Direction::East | Direction::West => true,
        _ => false,
    };
    println!("{}", moved);⟧
}
