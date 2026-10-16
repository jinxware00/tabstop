package main

import "fmt"

func main() {
	scores := []int{82, 91, 76}
	total := 0

	⟦for _, value := range scores {
		total += value
	}⟧

	fmt.Println("average:", total/len(scores))
}
