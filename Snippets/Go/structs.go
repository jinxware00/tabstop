package main

type Player struct {
	Name  string
	Score int
}

⟦func (p *Player) Boost(amount int) {
	p.Score += amount
}⟧
