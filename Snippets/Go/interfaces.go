package main

type Shape interface {
	Area() float64
}

type Square struct {
	Side float64
}

⟦func (s Square) Area() float64 {
	return s.Side * s.Side
}⟧
