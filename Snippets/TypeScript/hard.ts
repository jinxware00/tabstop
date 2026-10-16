async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  ⟦if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return (await response.json()) as T;⟧
}

type User = { id: number; name: string };

getJson<User>("/api/me").then((user) => console.log(user.name));
