fn main() {
    let scores = vec![82, 91, 76];

    ⟦let total: i32 = scores.iter().copied().sum();
    let average = total / scores.len() as i32;⟧

    println!("average: {}", average);
}
