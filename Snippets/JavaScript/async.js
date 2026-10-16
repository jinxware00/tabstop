async function loadUser(id) {
  ⟦const res = await fetch(`/users/${id}`);
  if (!res.ok) throw new Error("failed");
  return res.json();⟧
}
