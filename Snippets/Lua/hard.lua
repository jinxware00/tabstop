local Vector = {}
Vector.__index = Vector

function Vector.new(x, y)
    return setmetatable({ x = x, y = y }, Vector)
end

⟦function Vector:add(other)
    return Vector.new(self.x + other.x, self.y + other.y)
end⟧

local a = Vector.new(1, 2)
print(a:add(Vector.new(3, 4)).x)
