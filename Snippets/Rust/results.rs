use std::fs;
use std::io;

fn read_first_line(path: &str) -> io::Result<String> {
    ⟦let content = fs::read_to_string(path)?;
    let first = content.lines().next().unwrap_or("");
    Ok(first.to_string())⟧
}
