package main

import (
	"errors"
	"fmt"
)

type Account struct {
	Owner   string
	Balance float64
}

⟦func (a *Account) Deposit(amount float64) error {
	if amount <= 0 {
		return errors.New("deposit must be positive")
	}
	a.Balance += amount
	return nil
}⟧

func main() {
	account := Account{Owner: "Jinx"}
	fmt.Println(account.Deposit(25.5))
}
