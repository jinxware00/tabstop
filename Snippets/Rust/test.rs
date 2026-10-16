fn greet(name: &str) -> String {
    format!("Hello, {}", name)
}

fn main() {
    let name = "Jinx";
    let msg = greet(name);
    let level = 10;
}
