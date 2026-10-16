package main

func greet(name string) string {
    return "Hello, " + name
}

func main() {
    name := "Jinx"
    msg := greet(name)
    _ = msg
}
