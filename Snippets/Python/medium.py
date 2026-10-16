scores = {"ada": 82, "bo": 91, "cy": 76}

⟦top = {name: score for name, score in scores.items() if score >= 80}⟧

print(top)
