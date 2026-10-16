trait Summary {
    fn summarize(&self) -> String;
}

struct Report {
    title: String,
    lines: usize,
}

impl Summary for Report {
    fn summarize(&self) -> String {
        ⟦format!("{} ({} lines)", self.title, self.lines)⟧
    }
}
