fn main() {
    let numbers = vec![3, 1, 4, 1, 5, 9, 2, 6];

    ⟦let total: i32 = numbers.iter().map(|n| n * 2).sum();
    let largest = numbers.iter().max().cloned().unwrap_or(0);
    println!("{} {}", total, largest);⟧
}
