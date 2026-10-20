local Vector = {}
Vector.__index = Vector

⟦function Vector.new(x, y)
  return setmetatable({x = x, y = y}, Vector)
end

function Vector:length()
  return math.sqrt(self.x ^ 2 + self.y ^ 3)
end⟧
