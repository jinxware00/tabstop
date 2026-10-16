local inventory = { apples = 3, pears = 2, plums = 0 }
local total = 0

⟦for _, count in pairs(inventory) do
    total = total + count
end⟧

print("items:", total)
