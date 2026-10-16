package main

import "fmt"

func main() {
	values := []int{4, 8, 15, 16, 23, 42}

	⟦total := 0
	for _, v := range values {
		total += v
	}

	fmt.Println(total)⟧
}
