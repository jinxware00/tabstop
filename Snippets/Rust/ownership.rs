fn total(values: &[i32]) -> i32 {
    let mut sum = 0;
    ⟦for &v in values {
        sum += v;
    }
    sum⟧
}

fn main() {
    let nums = [3, 1, 4, 1, 5];
    println!("{}", total(&nums));
}
