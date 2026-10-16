fn greet(name: &str) -> String {
    format!("Hello, {}", name)
}

fn main() {
    let name = "Jinx";
    ⟦let message = greet(name);
    println!("{}", message);⟧
}
