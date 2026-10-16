package main

import "fmt"

func main() {
	words := []string{"apple", "pear", "apple"}
	counts := make(map[string]int)

	⟦for _, w := range words {
		counts[w]++
	}

	fmt.Println(counts)⟧
}
