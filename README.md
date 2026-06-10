# QuantQuest 🗺️

https://jhenao0803.github.io/quantquest/

An interactive, game-style quant finance curriculum: 10 missions taking you from
Python fundamentals (coming from R) to a full alpha research framework.

Built for learning by **doing** — every mission has:

- ⚔️ **Code Arena** — real Python (with NumPy) running in your browser via Pyodide,
  with side quests in the comments
- 🔁 **R → Python cheat sheet** — translate what you already know
- 💥 **Trap Room** — the mistakes that cost real money (look-ahead bias, leakage, overfitting)
- 🏆 **Boss Quiz** — reasoning questions, not recall

Plus a searchable glossary of 25 quant terms and a metrics calculator
(Sharpe, win rate, profit factor, alpha, beta) for any return series you paste in.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` auto-deploy to GitHub Pages via the workflow in
`.github/workflows/deploy.yml`.

Progress (XP, cleared missions, streak) is stored in your browser's localStorage.
