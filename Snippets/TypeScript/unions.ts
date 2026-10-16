type Status = "idle" | "running" | "done";

⟦function describe(status: Status): string {
  if (status === "done") return "Finished";
  return "Working";
}⟧
