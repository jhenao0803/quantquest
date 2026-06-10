// Jorge's quant curriculum as game missions.
// Every lesson is playable: briefing → code arena → trap room → boss quiz.
// "completed" = cleared before this app existed; everything else unlocks
// by beating the previous boss quiz (or force-opening).

export const lessons = [
  {
    id: 1,
    title: "Python Fundamentals",
    subtitle: "Variables, lists, loops — through the lens of the Sharpe Ratio",
    status: "completed",
    icon: "🐍",
    concepts: ["Variables", "Lists", "Loops", "Sharpe Ratio", "Win Rate"],
    mission: "Compute a real Sharpe Ratio and win rate from a week of Apple returns — using nothing but raw Python. No libraries, no training wheels.",
    explanation: `Python variables work like R objects but use \`=\` instead of \`<-\`. The core structure is the **list** — like an R vector except 0-indexed and able to mix types.

Every strategy you'll ever evaluate boils down to a list of returns. Once you can loop over them, you can compute the two numbers your team asks about first: **Sharpe Ratio** (return per unit of risk) and **win rate** (fraction of profitable trades).

Analogy: the Sharpe Ratio rates a taxi driver in Medellín not by how fast they got you to El Poblado, but by how many near-death lane changes it took. A 30% return with GME-2021 swings can have a *worse* Sharpe than a steady 12%.`,
    rVsPython: [
      {
        label: "Assign a variable",
        r: `annual_return <- 0.18\nticker <- "AAPL"`,
        python: `annual_return = 0.18\nticker = "AAPL"`,
      },
      {
        label: "Vector / list of returns",
        r: `# R vector, 1-indexed\nreturns <- c(0.02, -0.01, 0.03)\nreturns[1]   # first: 0.02`,
        python: `# Python list, 0-indexed!\nreturns = [0.02, -0.01, 0.03]\nreturns[0]   # first: 0.02`,
      },
      {
        label: "Loop over trades",
        r: `wins <- 0\nfor (r in returns) {\n  if (r > 0) wins <- wins + 1\n}`,
        python: `wins = 0\nfor r in returns:\n    if r > 0:\n        wins += 1\n# Indentation IS the syntax`,
      },
    ],
    sandbox: {
      packages: [],
      starterCode: `# MISSION: Apple's daily returns from one trading week
aapl_returns = [0.012, -0.008, 0.021, -0.003, 0.015]

# --- Win rate: fraction of up days ---
wins = 0
for r in aapl_returns:
    if r > 0:
        wins += 1
win_rate = wins / len(aapl_returns)
print(f"Win rate: {win_rate:.0%}")

# --- Sharpe Ratio (simplified, daily) ---
mean_r = sum(aapl_returns) / len(aapl_returns)
variance = sum((r - mean_r) ** 2 for r in aapl_returns) / len(aapl_returns)
std = variance ** 0.5
sharpe_annual = mean_r / std * (252 ** 0.5)  # annualize with sqrt(252)
print(f"Annualized Sharpe: {sharpe_annual:.2f}")

# SIDE QUEST: swap in GME's wild week and watch the Sharpe collapse
# gme_returns = [0.18, -0.22, 0.31, -0.15, 0.09]`,
      hint: "Run it, then try the GME side quest. A Sharpe above 1.0 is good; above 2.0 your team will ask to see your code.",
    },
    commonMistakes: [
      "Indexing from 1 like in R — returns[1] in Python is the SECOND element. This silently shifts your whole backtest by one day.",
      "Forgetting `/` is float division but `//` is integer division — 5 // 2 is 2, not 2.5.",
      "Annualizing Sharpe by multiplying by 252 instead of √252. Volatility scales with the square root of time.",
    ],
    realWorld: `Your team is comparing two momentum signals. Signal A returned 22% with daily vol of 1.8%; Signal B returned 15% with vol of 0.7%. Run both through your Sharpe loop: B wins (~1.7 vs ~0.97). You didn't chase the bigger number — that's how you earn trust on a 6-person team.`,
    quiz: [
      {
        q: "Your colleague's strategy has a 75% win rate but is losing money overall. What must be true?",
        options: [
          "The code has a bug — high win rate means profit",
          "The average loss is much larger than the average win",
          "The Sharpe Ratio must be above 1",
          "The strategy needs more trades to converge",
        ],
        answer: 1,
        explain: "Win rate ignores magnitude. Selling options often wins 75%+ of the time — then one blowup erases it all. Never report win rate without profit factor next to it.",
      },
      {
        q: "You port R code `prices[1]` to Python as `prices[1]`. Your backtest results shift subtly. Why?",
        options: [
          "Python lists are slower than R vectors",
          "Python is 0-indexed, so you skipped the first price — every calculation is offset by one day",
          "Python requires .iloc for indexing",
          "The shift is random floating point noise",
        ],
        answer: 1,
        explain: "Off-by-one errors are the #1 R-to-Python porting bug. One day's offset in a crossover backtest can flip a signal from profitable to losing.",
      },
      {
        q: "Strategy A: +30% return, daily std 2.5%. Strategy B: +14%, daily std 0.6%. Your team can use leverage. Which do you pitch?",
        options: [
          "A — higher raw return always wins",
          "B — its higher Sharpe means you can leverage it to beat A's return at A's risk level",
          "A — leverage doesn't change Sharpe",
          "Neither — Sharpe can't compare different volatilities",
        ],
        answer: 1,
        explain: "Sharpe is leverage-invariant: levering B 2x roughly doubles return AND vol, keeping its superior Sharpe. With leverage available, higher Sharpe dominates.",
      },
    ],
  },
  {
    id: 2,
    title: "NumPy & Pandas",
    subtitle: "Your data.frame instincts, supercharged",
    status: "completed",
    icon: "🐼",
    concepts: ["DataFrame", "Vectorization", "Filtering", "pct_change", "yfinance"],
    mission: "Kill the loop. Recompute everything from Mission 1 on a full price series with zero for-loops — pure vectorized NumPy.",
    explanation: `Pandas was literally inspired by R's data.frame, so a \`DataFrame\` will feel familiar. The shift: the **index** does heavy lifting — with price data the index is the *date*, and operations align on it automatically.

NumPy is the engine underneath: compute on whole arrays at once (**vectorization**) instead of looping. Same instinct as vectorized R — \`returns * 100\` hits every element, no loop, ~100x faster.

The killer one-liner: \`prices.pct_change()\` turns prices into returns. With \`yfinance\`, ten years of Apple data is two lines. Your team's entire pipeline starts here.`,
    rVsPython: [
      {
        label: "Build a data frame",
        r: `df <- data.frame(\n  ticker = c("AAPL", "GME"),\n  ret = c(0.15, -0.30)\n)`,
        python: `import pandas as pd\ndf = pd.DataFrame({\n    "ticker": ["AAPL", "GME"],\n    "ret": [0.15, -0.30]\n})`,
      },
      {
        label: "Filter rows (winners only)",
        r: `winners <- df[df$ret > 0, ]\n# or dplyr:\nwinners <- df %>% filter(ret > 0)`,
        python: `winners = df[df["ret"] > 0]\n# .query() reads like dplyr:\nwinners = df.query("ret > 0")`,
      },
      {
        label: "Prices → returns + download data",
        r: `returns <- diff(p) / head(p, -1)\nlibrary(quantmod)\ngetSymbols("AAPL")`,
        python: `returns = prices.pct_change().dropna()\nimport yfinance as yf\naapl = yf.download("AAPL")`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# AAPL closing prices over 10 days
prices = np.array([182.5, 184.1, 183.2, 186.7, 188.0,
                   187.1, 190.3, 189.5, 192.8, 195.2])

# Vectorized returns — NO loop (this is pct_change under the hood)
returns = prices[1:] / prices[:-1] - 1
print("Daily returns (%):", np.round(returns * 100, 2))

# Filter like an R vector: only the up days
up_days = returns[returns > 0]
print(f"Up days: {len(up_days)} of {len(returns)}")

print(f"Mean daily return: {returns.mean():.4f}")
print(f"Daily volatility:  {returns.std():.4f}")
print(f"Annualized Sharpe: {returns.mean() / returns.std() * np.sqrt(252):.2f}")

# SIDE QUEST: make prices a downtrend and watch every stat flip sign`,
      hint: "prices[1:] / prices[:-1] replaces an entire for-loop. This is the moment Python clicks for R users.",
    },
    commonMistakes: [
      "Forgetting .dropna() after pct_change() — the first row is NaN and silently poisons means and regressions downstream.",
      "Writing `for i in range(len(df))` over a DataFrame. If you're writing that, there's a vectorized one-liner — same rule as avoiding loops in R.",
      "Compound filters with `and` — Pandas needs `&` with parentheses: (df['ret'] > 0) & (df['vol'] < 0.02).",
    ],
    realWorld: `"Does AAPL fall more on days the market falls?" Pull AAPL and SPY with yfinance, pct_change() both, filter AAPL's returns to days where SPY < 0. Three lines, and you've got the conditional downside stats — the raw material for Mission 3's beta.`,
    quiz: [
      {
        q: "You compute prices.pct_change().mean() on data you KNOW has a gap, and get a clean result. What's the silent failure?",
        options: [
          "pct_change crashes on gaps so this can't happen",
          "NaNs were auto-skipped by .mean(), and the return ACROSS the gap got treated as one 'day' — your stats are subtly wrong",
          "Pandas interpolated the missing prices",
          "The mean is unaffected by gaps",
        ],
        answer: 1,
        explain: "Pandas skips NaN silently, and a multi-day move becomes one observation. Always check df.isna().sum() and date continuity first — real data is messy.",
      },
      {
        q: "Your R-style for-loop over 500 stocks × 10 years takes minutes; NumPy does it in milliseconds. Why?",
        options: [
          "NumPy uses the GPU",
          "Vectorized ops run in compiled C over contiguous arrays instead of interpreting Python bytecode per element",
          "NumPy caches results between runs",
          "Python loops have a float bug",
        ],
        answer: 1,
        explain: "Same reason vectorized R beats R loops. In alpha research, vectorization is the difference between 'test 50 ideas today' and 'test 2'.",
      },
    ],
  },
  {
    id: 3,
    title: "Factor Models",
    subtitle: "CAPM, Fama-French, and the precise meaning of alpha",
    status: "completed",
    icon: "📐",
    concepts: ["CAPM", "Beta", "Alpha", "Fama-French 3-Factor", "R-squared"],
    mission: "Estimate alpha and beta from scratch with the covariance formula — then shrink the sample and watch your 'alpha' turn into noise.",
    explanation: `Home turf: factor models are the regressions you know from econometrics, pointed at returns. CAPM: \`r - rf = α + β(rm - rf) + ε\`.

- **Beta** = the slope — market exposure. AAPL β≈1.2 amplifies the market; a utility β≈0.5 mutes it.
- **Alpha** = the intercept — return NOT explained by risk exposure. Literally the thing your team hunts.
- **R²** = how much variance the factors explain. GME during the squeeze: near zero — pure idiosyncratic chaos.

**Fama-French** adds SMB (size) and HML (value). The brutal lesson: impressive CAPM alpha often vanishes under Fama-French — your "alpha" was a size tilt all along. Always test against the stronger model before pitching.`,
    rVsPython: [
      {
        label: "Run CAPM regression",
        r: `model <- lm(excess ~ mkt, data = df)\nsummary(model)\ncoef(model)  # intercept=alpha, slope=beta`,
        python: `import statsmodels.api as sm\nX = sm.add_constant(df["mkt"])\nmodel = sm.OLS(df["excess"], X).fit()\nmodel.params  # const=alpha`,
      },
      {
        label: "Fama-French 3-factor",
        r: `ff <- lm(excess ~ mkt + smb + hml,\n         data = df)`,
        python: `X = sm.add_constant(df[["mkt","smb","hml"]])\nff = sm.OLS(df["excess"], X).fit()\n# statsmodels needs add_constant —\n# R adds the intercept for you!`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# 60 months of simulated data — we KNOW the truth, can you recover it?
np.random.seed(42)
mkt = np.random.normal(0.008, 0.045, 60)
true_beta, true_alpha = 1.2, 0.003
stock = true_alpha + true_beta * mkt + np.random.normal(0, 0.03, 60)

# OLS by hand (what lm() does under the hood)
beta = np.cov(stock, mkt)[0, 1] / np.var(mkt)
alpha = stock.mean() - beta * mkt.mean()
resid = stock - (alpha + beta * mkt)
r_squared = 1 - resid.var() / stock.var()

print(f"Estimated beta:  {beta:.3f}   (true: {true_beta})")
print(f"Estimated alpha: {alpha*12:.2%} annualized (true: {true_alpha*12:.2%})")
print(f"R-squared:       {r_squared:.3f}")

# SIDE QUEST: cut the sample to 12 months — mkt[:12], stock[:12].
# Watch alpha swing wildly. THIS is why short backtests lie.`,
      hint: "beta = Cov(stock, market) / Var(market) — your econometrics slope formula, now meaning 'market exposure'.",
    },
    commonMistakes: [
      "Forgetting sm.add_constant() — R's lm() adds the intercept automatically; Python doesn't. Without it you've forced α=0.",
      "Reporting alpha without its p-value. A 4% alpha with p=0.4 is noise.",
      "Regressing raw returns instead of EXCESS returns (minus risk-free). With today's rates, that alone manufactures fake alpha.",
      "Stopping at CAPM. Most retail 'alpha' is a disguised size or value tilt — run Fama-French before pitching.",
    ],
    realWorld: `A teammate's small-cap momentum screen shows +6% CAPM alpha. You rerun against Fama-French: SMB loading 0.9, alpha drops to +0.8%, insignificant. It's a leveraged small-cap bet, not skill. You just saved the team from deploying capital on beta dressed up as alpha.`,
    quiz: [
      {
        q: "α = 5% (p<0.01) under CAPM but α = 0.3% (p=0.6) under Fama-French. The honest conclusion:",
        options: [
          "The strategy has 5% alpha — CAPM is the standard",
          "The returns are explained by size/value exposure — you could replicate them cheaply with factor ETFs",
          "Average the two alphas: ~2.6%",
          "Fama-French is overfitting with extra variables",
        ],
        answer: 1,
        explain: "If a cheap, known factor explains the returns, nobody pays for it as alpha. Real alpha must survive the strongest factor model you can throw at it.",
      },
      {
        q: "GME in Jan 2021 had R² near zero vs the market. What does that mean for a market-hedged GME position?",
        options: [
          "Zero R² means zero risk after hedging",
          "The hedge does almost nothing — virtually all the variance was idiosyncratic",
          "Beta must be zero, so no hedge needed",
          "Low R² means the data is wrong",
        ],
        answer: 1,
        explain: "Hedging removes factor risk only. With R²≈0 you keep ~100% of the risk after a perfect market hedge. Low-R² stocks are where stock-picking risk lives.",
      },
      {
        q: "β=1.4 estimated on 12 months with SE=0.6. A teammate wants to size a hedge off it. Your econometrics training says:",
        options: [
          "1.4 is the estimate, use it",
          "The 95% CI is roughly [0.2, 2.6] — nearly unidentified. Get more data or shrink toward 1",
          "Round to 1.5 for safety",
          "Use R² instead of beta for hedging",
        ],
        answer: 1,
        explain: "β ± 2·SE spans the whole plausible range. Practitioners shrink noisy betas toward 1 (Blume adjustment). Carrying standard-error instincts into finance is a real edge.",
      },
    ],
  },
  {
    id: 4,
    title: "Backtesting",
    subtitle: "MA crossovers, and the two ways backtests lie",
    status: "completed",
    icon: "⏪",
    concepts: ["MA Crossover", "Look-ahead Bias", "Whipsawing", "Cumulative Returns", "Signal Lag"],
    mission: "Backtest a moving-average crossover, then deliberately break it: remove the signal lag and measure your look-ahead bias as a real number.",
    explanation: `A backtest is a time machine with strict rules: at each date, use ONLY information that existed on that date. Break the rule → **look-ahead bias**, the most expensive bug in quant finance, because it always makes results look *better*. The classic: trading today's close on a signal computed from today's close. The fix is one shift — and it routinely halves a strategy's backtest return.

The MA crossover's known disease is **whipsawing**: sideways markets make the MAs cross back and forth, each flip losing a little plus costs. Trend strategies eat small losses in chop and get paid in trends — AAPL 2019-2021 was paradise; 2015 was a meat grinder.

Judge any backtest by its **cumulative return** curve vs buy-and-hold, after costs, without look-ahead. Otherwise it's not a strategy, it's a story.`,
    rVsPython: [
      {
        label: "Rolling MA + lagged signal",
        r: `ma50 <- zoo::rollmean(p, 50,\n  align = "right", fill = NA)\nsignal <- ifelse(ma50 > ma200, 1, 0)\nsignal <- dplyr::lag(signal)  # critical!`,
        python: `ma50 = prices.rolling(50).mean()\nsignal = (ma50 > ma200).astype(int)\nsignal = signal.shift(1)  # critical!\n# Trade the day AFTER the signal forms`,
      },
      {
        label: "Cumulative return curve",
        r: `equity <- cumprod(1 + strat_ret)`,
        python: `equity = (1 + strat_ret).cumprod()`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# 500 days: uptrend, then chop (whipsaw zone), then uptrend
np.random.seed(7)
trend = np.concatenate([
    np.random.normal(0.0025, 0.012, 200),
    np.random.normal(0.0,    0.014, 150),
    np.random.normal(0.0022, 0.012, 150)])
prices = 100 * np.cumprod(1 + trend)

def ma(x, n):
    out = np.full(len(x), np.nan)
    c = np.cumsum(x)
    out[n-1:] = (c[n-1:] - np.concatenate([[0], c[:-n]])) / n
    return out

fast, slow = ma(prices, 20), ma(prices, 50)
signal = (fast > slow).astype(float)

# THE critical line — trade the day AFTER the signal
signal_lagged = np.concatenate([[0], signal[:-1]])

daily_ret = np.concatenate([[0], prices[1:] / prices[:-1] - 1])
strat = signal_lagged * daily_ret

trades = int(np.abs(np.diff(signal_lagged)).sum())
print(f"Buy & hold:     {np.prod(1 + daily_ret) - 1:+.1%}")
print(f"MA crossover:   {np.prod(1 + strat) - 1:+.1%}")
print(f"Position flips: {trades}")

# BOSS CHALLENGE 1: use signal instead of signal_lagged.
#   The fake improvement = your look-ahead bias, quantified.
# BOSS CHALLENGE 2: windows (5, 15) — watch flips explode in the chop.`,
      hint: "Run it, then do Boss Challenge 1. Seeing look-ahead bias as a NUMBER — not a textbook warning — is the whole point.",
    },
    commonMistakes: [
      "Missing shift(1) — the #1 backtest bug. If removing one lag dramatically improves results, the improvement IS the bug.",
      "Ignoring transaction costs. At ~0.1% per flip, a marginal crossover strategy goes negative.",
      "Trying 30 parameter pairs and reporting the best — the best of 30 random strategies also looks great.",
      "Backtesting only a bull market. Trend strategies tested on AAPL 2019-2021 alone tell you nothing about the chop that kills them.",
    ],
    realWorld: `Your team almost deployed an MA strategy showing 31% backtest returns. Code review found the signal wasn't lagged. After shift(1): 14%. After costs: 9% — below buy-and-hold. Killed in review instead of in production. The teammate who catches that bug is worth more than the one who wrote ten new signals that week.`,
    quiz: [
      {
        q: "Returns drop from 28% to 12% after adding .shift(1) to the signal. What was the 16% gap?",
        options: [
          "Transaction costs",
          "Information you didn't have at trade time — the strategy was 'trading' on the same close that generated the signal",
          "Random variation between runs",
          "The shift introduced a bug; 28% was correct",
        ],
        answer: 1,
        explain: "Without the lag, the backtest buys at the very price that triggered the signal — impossible in reality. Look-ahead ALWAYS inflates results, which is why it survives unnoticed.",
      },
      {
        q: "Your crossover bleeds in sideways markets. A teammate says 'add a filter to skip choppy periods.' The risk:",
        options: [
          "Filters are not possible in Pandas",
          "Unless the filter is computable in real time, it's hindsight — and fitting it to the period that hurt you is overfitting",
          "Filters increase transaction costs",
          "Whipsawing is good for trend strategies",
        ],
        answer: 1,
        explain: "Two traps at once: the filter must use only past data, and designing it to fix the specific episode that hurt you is in-sample curve fitting. Define first, test out-of-sample after.",
      },
      {
        q: "Equity curve: +40% over 5 years, but flat the last 2 while buy-and-hold gained 25%. The key question before pitching:",
        options: [
          "What's the total return? 40% sounds fine",
          "Has the edge decayed? Recent performance matters more than the 5-year average for capital deployed TOMORROW",
          "Can we backtest 5 more years?",
          "What's the win rate?",
        ],
        answer: 1,
        explain: "Alpha decays — signals get crowded, regimes shift. '3 great years then dead' is a warning, not a pitch. Rolling-window performance belongs in every team memo.",
      },
    ],
  },
  {
    id: 5,
    title: "Time Series & EDA",
    subtitle: "Your first fight with real, messy data",
    status: "locked",
    icon: "🔍",
    concepts: ["EDA", "Seasonality", "Missing Data", "Outliers", "Zeros vs NaN"],
    mission: "Profile a messy sales dataset like you'd profile a new market: hunt down the missing days, the suspicious zeros, and the weekly rhythm hiding in the noise.",
    explanation: `Real data lies. The Kaggle Store Sales dataset (and every price feed your team will ever use) has holes, holidays, and zeros that might mean "closed", "no sales", or "data error" — three very different things.

EDA (exploratory data analysis) is reconnaissance before battle: count the missing, plot the seasonal rhythm, flag the outliers. A **zero** and a **NaN** are not the same — averaging in zeros from days a store was closed crushes your estimates, exactly like averaging in prices from days an exchange was shut.

The seasonality instinct transfers straight to finance: retail sales spike on weekends like volume spikes at the open and close. Find the rhythm first; whatever's left after removing it is the signal you actually care about.`,
    rVsPython: [
      {
        label: "Count missing + summarize",
        r: `colSums(is.na(df))\nsummary(df$sales)`,
        python: `df.isna().sum()\ndf["sales"].describe()`,
      },
      {
        label: "Group by weekday (seasonality)",
        r: `df %>%\n  group_by(weekday) %>%\n  summarise(mean(sales))`,
        python: `df.groupby("weekday")["sales"].mean()\n# groupby ≈ dplyr group_by + summarise`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# 8 weeks of daily store sales. Weekends boom. But the data is DIRTY:
# day 17 is missing (NaN), days 24-25 the store was closed (zeros).
np.random.seed(3)
weekly = np.array([100, 95, 98, 105, 130, 180, 160])  # Mon..Sun pattern
sales = np.tile(weekly, 8) + np.random.normal(0, 10, 56)
sales[17] = np.nan          # missing data
sales[24:26] = 0.0          # store closed — NOT missing!

# --- Recon report ---
print(f"Days: {len(sales)} | Missing: {np.isnan(sales).sum()} | Zeros: {(sales == 0).sum()}")

naive_mean = np.nanmean(sales)               # zeros pollute this!
clean = sales[(~np.isnan(sales)) & (sales > 0)]
print(f"Naive mean (zeros in):  {naive_mean:.1f}")
print(f"Clean mean (zeros out): {clean.mean():.1f}")

# --- Weekly seasonality: average by weekday ---
weekdays = np.arange(56) % 7
for d, name in enumerate(["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]):
    vals = sales[(weekdays == d) & (~np.isnan(sales)) & (sales > 0)]
    bar = "#" * int(vals.mean() / 8)
    print(f"{name}: {vals.mean():6.1f} {bar}")

# SIDE QUEST: set sales[10] = 900 (a fat-finger outlier).
# Which weekday's average gets wrecked? How would you auto-detect it?`,
      hint: "Look at how far the naive mean and clean mean diverge from just TWO zero days. Now imagine a year of them.",
    },
    commonMistakes: [
      "Treating zeros as missing or missing as zeros. A closed store (zero) and a lost record (NaN) need opposite handling.",
      "Computing statistics before looking at the data. describe() and isna().sum() take 10 seconds and catch 80% of disasters.",
      "Deleting outliers automatically. GME's +130% day was an outlier AND real. Investigate before you delete — some outliers are the trade.",
      "Ignoring the calendar. Sales data has weekends and holidays; price data has halts and half-days. Both will silently bias any rolling statistic.",
    ],
    realWorld: `Your team gets a new alt-data feed (credit card spending by retailer). Before anyone models it, you run this exact recon: missing days, zeros vs NaNs, day-of-week rhythm. You find the vendor backfills Mondays with zeros. Anyone who skipped EDA would have 'discovered' that retail spending crashes every Monday — and built a strategy on a data bug.`,
    quiz: [
      {
        q: "A store's sales column has 30 zeros. Before computing the average, the FIRST question is:",
        options: [
          "Should I use mean or median?",
          "Do these zeros mean 'closed', 'no sales', or 'missing data'? Each requires different handling",
          "Should I remove all zeros automatically?",
          "What's the standard deviation?",
        ],
        answer: 1,
        explain: "Zero is a value with a meaning, and you must find out which one. Closed days should usually be excluded; true zero-sales days are real signal; data errors need fixing upstream.",
      },
      {
        q: "Your daily price data shows a stock 'returning' +8% every January 2nd for 5 straight years. Most likely explanation:",
        options: [
          "A real calendar anomaly — trade it!",
          "A data artifact — probably returns computed across the New Year gap or a dividend adjustment bug. Verify the raw data before believing it",
          "The stock is seasonal like retail sales",
          "Five years proves statistical significance",
        ],
        answer: 1,
        explain: "Patterns that look too clean usually live in the data pipeline, not the market. Five observations prove nothing, and gap-spanning returns are a classic artifact. EDA instinct: suspicious regularity = check the plumbing first.",
      },
      {
        q: "Why does day-of-week seasonality matter for a rolling 7-day average of sales?",
        options: [
          "It doesn't — rolling averages remove all seasonality",
          "A 7-day window always contains exactly one of each weekday, so it's fine — but a 5-day window would oscillate with the weekly rhythm",
          "Rolling averages only work on prices",
          "Seasonality only matters for yearly data",
        ],
        answer: 1,
        explain: "Window length interacts with the seasonal period. 7-day windows align with weekly rhythm; any other length aliases it into fake oscillations. Same trap exists with 5-trading-day weeks in finance.",
      },
    ],
  },
  {
    id: 6,
    title: "Feature Engineering",
    subtitle: "Merging datasets, lag features, and leak-proofing",
    status: "locked",
    icon: "🛠️",
    concepts: ["Joins/Merges", "Lag Features", "Rolling Features", "Leakage"],
    mission: "Build lag and rolling features that a model could ACTUALLY have used on the day — and prove to yourself that one wrong shift leaks the future.",
    explanation: `Models are only as good as their features, and features are where the future leaks in. The iron rule: a feature for day T may only use data from day T-1 and earlier. Sound familiar? It's Lesson 4's look-ahead bias wearing a data-science costume.

**Lag features** (yesterday's sales, last week's return) are the bread and butter. **Rolling features** (7-day average) compress recent history into one number — but the window must END at T-1, not at T.

**Merging** is R's \`left_join\`: glue oil prices onto sales by date, fundamentals onto prices by ticker. The classic merge bug: the right-hand dataset is published with a delay (earnings come out WEEKS after the quarter ends), so joining on the period date instead of the publication date leaks the future.`,
    rVsPython: [
      {
        label: "Left join two tables",
        r: `df <- left_join(sales, oil,\n                by = "date")`,
        python: `df = sales.merge(oil, on="date",\n                 how="left")`,
      },
      {
        label: "Lag + rolling features (leak-proof)",
        r: `df %>% mutate(\n  lag1 = lag(sales, 1),\n  roll7 = lag(zoo::rollmean(\n    sales, 7, align="right",\n    fill=NA), 1))`,
        python: `df["lag1"] = df["sales"].shift(1)\ndf["roll7"] = (df["sales"]\n    .rolling(7).mean()\n    .shift(1))  # shift AFTER rolling!`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# 30 days of sales with strong momentum (yesterday predicts today)
np.random.seed(11)
sales = np.zeros(30)
sales[0] = 100
for t in range(1, 30):
    sales[t] = 0.7 * sales[t-1] + 30 + np.random.normal(0, 5)

def lag(x, k):
    out = np.full(len(x), np.nan)
    out[k:] = x[:-k]
    return out

# LEAK-PROOF feature: yesterday's sales
lag1 = lag(sales, 1)

# LEAKY "feature": today's own value sneaks in via a centered window
leaky = np.convolve(sales, np.ones(3)/3, mode="same")  # uses t-1, t, t+1 !!

def corr_with_today(feature):
    m = ~np.isnan(feature)
    return np.corrcoef(feature[m], sales[m])[0, 1]

print(f"Correlation of lag1 with today:        {corr_with_today(lag1):.3f}")
print(f"Correlation of LEAKY feat with today:  {corr_with_today(leaky):.3f}")
print()
print("The leaky feature looks AMAZING — because it contains the answer.")
print("In production it would not exist at prediction time. Score: fantasy.")

# SIDE QUEST: build roll7 = mean of the PREVIOUS 7 days (no day t!).
# Hint: lag the series first, then average. Check its correlation.`,
      hint: "The leaky feature wins the correlation contest by cheating — it literally contains today's value. Every leak looks like skill.",
    },
    commonMistakes: [
      "rolling().mean() without .shift(1) — the window includes today, so the feature knows the answer.",
      "Centered windows (align='center') on time series — they average in the FUTURE. Always right-align, then lag.",
      "Joining quarterly fundamentals on quarter-end date instead of publication date. Earnings are public weeks later — joining early is time travel.",
      "Filling NaNs from a merge with 0. A missing oil price isn't a zero oil price — forward-fill or flag it.",
    ],
    realWorld: `Your team merges short-interest data onto daily prices. It 'predicts' returns beautifully — until someone checks: the vendor publishes short interest with a 2-week delay, and the join used the report date, not the release date. The 'signal' was reading two weeks into the future. One join key, entire strategy invalidated. Now it's a checklist item in your team's code reviews.`,
    quiz: [
      {
        q: "A 7-day rolling mean feature computed with .rolling(7).mean() but WITHOUT .shift(1) gives an inflated backtest. Why?",
        options: [
          "Rolling means smooth too much",
          "The window includes day T itself, so the feature contains part of the value it's predicting",
          "7 is the wrong window length",
          "Rolling features always need normalization",
        ],
        answer: 1,
        explain: "The window [T-6, T] includes today. Your 'feature' partially IS the target. Shift after rolling so the window becomes [T-7, T-1] — only the past.",
      },
      {
        q: "You merge earnings data (quarter ending Mar 31, published May 5) onto prices using the Mar 31 date. The bug:",
        options: [
          "Should have used an inner join",
          "From Mar 31 to May 5 the model 'knows' earnings that weren't public yet — point-in-time data requires joining on publication date",
          "Quarterly data can't be merged with daily data",
          "There's no bug if the data is accurate",
        ],
        answer: 1,
        explain: "Accuracy isn't the issue — availability is. Point-in-time discipline (joining on when information became PUBLIC) is what separates professional backtests from fantasy ones.",
      },
      {
        q: "After a left join of sales onto oil prices, oil has NaN on weekends. Filling with 0 is wrong because:",
        options: [
          "You should always drop NaN rows",
          "Oil wasn't free on weekends — the price still existed, the market was just closed. Forward-fill carries the last real price",
          "NaN means the join failed",
          "Zeros are fine since weekends don't matter",
        ],
        answer: 1,
        explain: "A missing quote ≠ a zero price. Forward-fill says 'last known value still stands' — usually right for prices. Lesson 5's zeros-vs-NaN distinction, now in a merge.",
      },
    ],
  },
  {
    id: 7,
    title: "Building a Forecast Model",
    subtitle: "Regression forecasting with honest validation",
    status: "locked",
    icon: "📈",
    concepts: ["Time-Series CV", "Walk-Forward", "Baselines", "Error Metrics"],
    mission: "Train the same model twice — once validated with shuffled data, once walk-forward — and catch the shuffled version lying to you.",
    explanation: `Forecasting is regression with a time discipline — your econometrics pays off here. The model is the easy part. The hard part is the exam: **how you validate decides whether your score means anything.**

Random K-fold cross-validation shuffles time away — the model trains on Friday and gets 'tested' on the previous Tuesday. With any autocorrelation, neighboring days leak information and the score inflates. The honest exam is **walk-forward validation**: train on days 1-100, predict day 101+, slide forward. Always compare against a dumb **baseline** (yesterday's value, the historical mean) — a model that can't beat 'predict yesterday' is decoration.

This is THE transferable skill: every alpha signal your team tests gets validated exactly like this sales forecast. Shuffled CV on financial data is look-ahead bias with a lab coat on.`,
    rVsPython: [
      {
        label: "Fit linear regression",
        r: `fit <- lm(y ~ lag1 + roll7,\n          data = train)\npred <- predict(fit, test)`,
        python: `# numpy least squares (or sklearn)\nX = np.column_stack([ones, lag1, roll7])\ncoef, *_ = np.linalg.lstsq(X, y, rcond=None)\npred = X_test @ coef`,
      },
      {
        label: "Honest time split",
        r: `train <- df[df$date < "2017-01-01", ]\ntest  <- df[df$date >= "2017-01-01", ]\n# NEVER sample() on time series`,
        python: `train, test = df[:split], df[split:]\n# NEVER train_test_split(shuffle=True)\n# on time series`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# Autocorrelated daily series (like sales — or returns volatility)
np.random.seed(5)
n = 200
y = np.zeros(n); y[0] = 100
for t in range(1, n):
    y[t] = 0.8 * y[t-1] + 20 + np.random.normal(0, 6)

lag1 = np.concatenate([[np.nan], y[:-1]])   # leak-proof feature
X = np.column_stack([np.ones(n), lag1])[1:]  # drop NaN row
yy = y[1:]

def fit_predict(Xtr, ytr, Xte):
    coef, *_ = np.linalg.lstsq(Xtr, ytr, rcond=None)
    return Xte @ coef

def mae(a, b): return np.mean(np.abs(a - b))

# --- EXAM 1: SHUFFLED split (the lie) ---
np.random.seed(0)
idx = np.random.permutation(len(yy))
tr, te = idx[:150], idx[150:]
pred = fit_predict(X[tr], yy[tr], X[te])
print(f"Shuffled-CV MAE:     {mae(pred, yy[te]):6.2f}  <- flattering")

# --- EXAM 2: WALK-FORWARD (the truth) ---
pred = fit_predict(X[:150], yy[:150], X[150:])
print(f"Walk-forward MAE:    {mae(pred, yy[150:]):6.2f}  <- honest")

# --- BASELINE: predict yesterday's value ---
print(f"'Yesterday' baseline: {mae(yy[150:][1:], yy[150:][:-1]):6.2f}")
print()
print("If your model can't beat the baseline out-of-sample, it's decoration.")

# SIDE QUEST: strengthen autocorrelation to 0.95 — does the gap
# between the two exams grow or shrink? Why?`,
      hint: "Same model, same data — only the exam changed. The shuffled score is the one that gets people fired.",
    },
    commonMistakes: [
      "train_test_split(shuffle=True) on time series. The default shuffles! Pass shuffle=False or split by date.",
      "Skipping the baseline. RMSE of 42 means nothing until you know 'predict yesterday' scores 45.",
      "Fitting the scaler/normalizer on ALL data before splitting — the test set's statistics leak into training.",
      "Validating once on one split. Walk-forward with multiple folds shows whether the edge is stable or one lucky period.",
    ],
    realWorld: `A teammate's return-prediction model shows R²=0.15 in cross-validation — phenomenal for finance. You ask one question: 'shuffled or walk-forward?' Shuffled. Re-run walk-forward: R² = -0.01. The model was reading tomorrow's autocorrelated noise, not predicting. That one question is now asked in every research review your team runs.`,
    quiz: [
      {
        q: "Why does shuffled K-fold inflate scores on autocorrelated time series specifically?",
        options: [
          "Shuffling reduces the training set size",
          "Test points end up surrounded by training points from adjacent days — the model interpolates between near-copies of the answer",
          "K-fold uses too many folds",
          "It doesn't — shuffling is always fine if data is i.i.d.",
        ],
        answer: 1,
        explain: "Exactly because the data ISN'T i.i.d. — neighboring days are correlated. Training on Monday and Wednesday to 'predict' Tuesday is interpolation, not forecasting. (And note the trap: option D is true only under i.i.d., which time series violates by definition.)",
      },
      {
        q: "Your model's walk-forward MAE is 8.2. The 'predict yesterday' baseline scores 8.0. Verdict:",
        options: [
          "Ship it — 8.2 is a good MAE",
          "The model is worse than a one-line heuristic. It adds complexity and risk for negative value — kill it or fix it",
          "Average the model with the baseline",
          "Try a neural network",
        ],
        answer: 1,
        explain: "A model must beat the dumbest credible alternative to justify existing. In finance this discipline is survival: complex models that underperform 'buy and hold' still cost real money to run.",
      },
      {
        q: "You normalize features using the full dataset's mean/std, THEN split train/test. The problem:",
        options: [
          "Normalization should use the median",
          "The test set's statistics influenced training — a subtle leak. Fit the scaler on train only, apply to test",
          "No problem — normalization is deterministic",
          "You should normalize the target too",
        ],
        answer: 1,
        explain: "Any computation that sees test data before training is a leak, even an innocent-looking mean. Leak-proofing is a pipeline property, not just a model property.",
      },
    ],
  },
  {
    id: 8,
    title: "Factor-Based Stock Screening",
    subtitle: "Multi-factor ranking and your first long/short",
    status: "locked",
    icon: "🎯",
    concepts: ["Factor Scores", "Ranking", "Long/Short", "Decile Spread"],
    mission: "Rank 200 stocks on a composite value+momentum score, go long the top decile and short the bottom — and measure the spread that systematic funds live on.",
    explanation: `Now it gets real. Single-stock analysis doesn't scale; **ranking** does. The systematic playbook: score every stock on each factor (value, momentum, quality), convert scores to ranks (ranks are robust — a crazy outlier can't dominate), average the ranks into a **composite**, then go **long the top decile, short the bottom**.

The long/short construction is the beautiful part: being long winners AND short losers cancels the market out. Whether the index rises or crashes, you earn the **spread** between good and bad stocks. That's why it's called market-neutral — your P&L comes from ranking skill, not market direction (your beta from Lesson 3 should be ≈ 0).

The metric that matters: the decile spread — top-decile return minus bottom-decile return. If your composite ranks better than random, the spread is positive and stable. That spread IS the alpha your team hunts, industrialized.`,
    rVsPython: [
      {
        label: "Rank within a vector",
        r: `df$mom_rank <- rank(df$momentum)\ndf$val_rank <- rank(df$value)\ndf$score <- (df$mom_rank +\n             df$val_rank) / 2`,
        python: `df["mom_rank"] = df["momentum"].rank()\ndf["val_rank"] = df["value"].rank()\ndf["score"] = (df["mom_rank"] +\n               df["val_rank"]) / 2`,
      },
      {
        label: "Top / bottom decile",
        r: `q <- quantile(df$score,\n              c(0.1, 0.9))\nlongs  <- df[df$score >= q[2], ]\nshorts <- df[df$score <= q[1], ]`,
        python: `q10, q90 = df["score"].quantile(\n    [0.1, 0.9])\nlongs  = df[df["score"] >= q90]\nshorts = df[df["score"] <= q10]`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# 200 stocks. Each has a hidden "quality" that drives next-month return,
# and two noisy factors that partially see it: value and momentum.
np.random.seed(8)
n = 200
quality   = np.random.normal(0, 1, n)
value     = quality + np.random.normal(0, 1.2, n)   # noisy signal
momentum  = quality + np.random.normal(0, 1.2, n)   # noisy signal
next_ret  = 0.01 * quality + np.random.normal(0, 0.04, n)  # monthly

def to_rank(x):
    return x.argsort().argsort() / (len(x) - 1)  # 0..1 rank

composite = (to_rank(value) + to_rank(momentum)) / 2

deciles = (composite * 10).astype(int).clip(0, 9)
print("Decile | avg next-month return")
for d in range(10):
    r = next_ret[deciles == d].mean()
    print(f"  {d}    | {r:+.2%} {'#' * max(0, int((r + 0.01) * 800))}")

top    = next_ret[deciles == 9].mean()
bottom = next_ret[deciles == 0].mean()
print(f"\\nLong/short decile spread: {top - bottom:+.2%} per month")
print("Long the top, short the bottom — the market cancels out.")

# SIDE QUEST 1: use ONLY momentum as the composite. Spread shrinks — why?
# SIDE QUEST 2: add a third noisy factor. Does diversifying signals help?`,
      hint: "Two mediocre signals combined beat either alone — diversification works on SIGNALS, not just stocks. Watch the deciles staircase upward.",
    },
    commonMistakes: [
      "Ranking on raw values instead of ranks/z-scores. One stock with a P/E of 4000 shouldn't dominate the composite.",
      "Comparing factor scores across industries naively. A 'cheap' bank and a 'cheap' software company are different animals — rank within sectors.",
      "Forgetting that shorting costs money (borrow fees, margin) and some stocks can't be borrowed at all — paper spreads overstate live spreads.",
      "Rebalancing daily. Factor signals move slowly; daily rebalancing burns the spread in transaction costs.",
    ],
    realWorld: `This is your team's core machine. A 6-person shop can't read 500 annual reports, but it CAN rank 500 stocks on five factors every month and trade the extremes. Your job in that pipeline: make sure the ranking is point-in-time clean (Lesson 6), validated walk-forward (Lesson 7), and that the spread survives costs (Lesson 4). Every lesson so far is a component of this machine.`,
    quiz: [
      {
        q: "Why ranks instead of raw factor values in the composite?",
        options: [
          "Ranks compute faster",
          "Ranks are robust to outliers and put different factors on the same scale — a P/E of 4000 becomes just 'last place', not 100x the weight",
          "Raw values are illegal to use",
          "Ranks remove the need for clean data",
        ],
        answer: 1,
        explain: "Averaging a P/E with a 12-month return is meaningless — different units, wild outliers. Ranks make factors comparable and cap any single stock's influence.",
      },
      {
        q: "Your long/short portfolio is up 2% in a month when the market dropped 8%. This demonstrates:",
        options: [
          "Luck — nothing is up when markets crash",
          "Market neutrality: long winners + short losers cancels market exposure, so P&L comes from the spread, not direction",
          "The portfolio must be secretly long bonds",
          "Shorts always profit in crashes",
        ],
        answer: 1,
        explain: "The shorts' gains in the crash offset the longs' losses; what remains is the relative performance of good vs bad ranks. That independence from market direction is why funds pay for it.",
      },
      {
        q: "Combining two factors that each correlate ~0.5 with future returns gives a better spread than either alone because:",
        options: [
          "More factors always means more return",
          "Their ERRORS are partly independent — where value is wrong, momentum is often right, so the composite's noise partially cancels",
          "Ranks add linearly",
          "It doesn't — the best single factor always wins",
        ],
        answer: 1,
        explain: "Diversification math applied to signals: combining noisy estimates with independent errors raises the signal-to-noise ratio. Same theorem as Lesson 9's portfolio diversification — one level up the stack.",
      },
    ],
  },
  {
    id: 9,
    title: "Portfolio Construction & Risk",
    subtitle: "Position sizing, diversification math, Sharpe optimization",
    status: "locked",
    icon: "⚖️",
    concepts: ["Position Sizing", "Correlation", "Max Drawdown", "Kelly Criterion"],
    mission: "Prove the only free lunch in finance: combine two so-so strategies into a portfolio with a better Sharpe than either — then find the sizing that maximizes it.",
    explanation: `A good signal with bad sizing still blows up. This mission is the math of not blowing up.

The free-lunch theorem: combining strategies with **low correlation** reduces risk more than it reduces return. Two strategies each with Sharpe 0.8 and correlation 0.2 combine into roughly Sharpe 1.1 — alchemy, except it's just \`Var(aX + bY) = a²σ²ₓ + b²σ²ᵧ + 2ab·Cov(X,Y)\`, the formula from your econometrics exams, now making money.

**Position sizing**: the Kelly criterion gives the growth-optimal bet size, but full Kelly assumes you know the true edge (you don't — Lesson 3's standard errors). Pros run half-Kelly or less. **Max drawdown** — the worst peak-to-trough fall — is the risk number that matters most psychologically: it's the moment your team debates abandoning the strategy right before it recovers.`,
    rVsPython: [
      {
        label: "Correlation + portfolio variance",
        r: `rho <- cor(ret_a, ret_b)\nport <- 0.5*ret_a + 0.5*ret_b\nsd(port)  # < average of sd's!`,
        python: `rho = np.corrcoef(ret_a, ret_b)[0,1]\nport = 0.5*ret_a + 0.5*ret_b\nport.std()  # < average of stds!`,
      },
      {
        label: "Max drawdown",
        r: `equity <- cumprod(1 + ret)\ndd <- equity / cummax(equity) - 1\nmin(dd)`,
        python: `equity = np.cumprod(1 + ret)\ndd = equity / np.maximum.accumulate(\n    equity) - 1\ndd.min()`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# Two mediocre strategies, mostly uncorrelated (rho ~ 0.2)
np.random.seed(9)
n = 1000
common = np.random.normal(0, 0.004, n)            # shared market noise
strat_a = 0.0005 + common + np.random.normal(0, 0.009, n)
strat_b = 0.0005 + common + np.random.normal(0, 0.009, n)

def sharpe(r): return r.mean() / r.std() * np.sqrt(252)
def max_dd(r):
    eq = np.cumprod(1 + r)
    return (eq / np.maximum.accumulate(eq) - 1).min()

rho = np.corrcoef(strat_a, strat_b)[0, 1]
print(f"Correlation: {rho:.2f}")
print(f"A alone:  Sharpe {sharpe(strat_a):.2f} | MaxDD {max_dd(strat_a):.1%}")
print(f"B alone:  Sharpe {sharpe(strat_b):.2f} | MaxDD {max_dd(strat_b):.1%}")

# The free lunch: 50/50 blend
blend = 0.5 * strat_a + 0.5 * strat_b
print(f"50/50:    Sharpe {sharpe(blend):.2f} | MaxDD {max_dd(blend):.1%}")

# Sweep the weight — where is Sharpe maximized?
print("\\nweight in A | blend Sharpe")
for w in [0.0, 0.25, 0.5, 0.75, 1.0]:
    p = w * strat_a + (1 - w) * strat_b
    print(f"   {w:.2f}     |   {sharpe(p):.2f}")

# SIDE QUEST: crank the common-noise vol to 0.012 (high correlation).
# Watch the free lunch disappear. Diversification needs INDEPENDENCE.`,
      hint: "Neither strategy improved — only the combination did. That's the only free lunch in finance, and it's pure covariance algebra.",
    },
    commonMistakes: [
      "Sizing positions by conviction instead of risk. A 'sure thing' at 10x size is how accounts die — see every blown-up GME short.",
      "Using full Kelly with estimated (noisy) edges. Estimation error makes full Kelly violently over-bet; half-Kelly is the pro default.",
      "Trusting correlations from calm periods. In crashes, correlations spike toward 1 exactly when you need diversification most.",
      "Optimizing weights on the same data used to estimate returns. The 'optimal' portfolio overfits — robust 1/N weighting often wins live.",
    ],
    realWorld: `Your team runs three signals: a value screen, a momentum overlay, and a mean-reversion daytrader. Individually: Sharpes of 0.7, 0.8, 0.6. Pairwise correlations under 0.3. Blended with equal risk: portfolio Sharpe ~1.3, max drawdown halved. The blend is the product — no single signal needed to be brilliant. This is why your team diversifies RESEARCH effort, not just positions.`,
    quiz: [
      {
        q: "Two strategies each have Sharpe 0.8. Blended 50/50 with correlation 0.2, the portfolio Sharpe is ~1.05. Where did the extra come from?",
        options: [
          "Returns added together",
          "Returns average, but volatility grows slower than linearly when correlation < 1 — risk partially cancels while return doesn't",
          "Rebalancing bonus",
          "It's a calculation error — Sharpe can't exceed the best component",
        ],
        answer: 1,
        explain: "Var(½X+½Y) = ¼σ²x + ¼σ²y + ½Cov. With low covariance, blend vol ≈ 0.77 of component vol while return stays the same — Sharpe rises mechanically. The only free lunch.",
      },
      {
        q: "Kelly says bet 40% of capital on your edge. The team should probably bet ~20% or less because:",
        options: [
          "Kelly is outdated",
          "The edge is ESTIMATED with error, and Kelly's penalty for over-betting is brutal (over-betting full Kelly can guarantee ruin) — uncertainty demands shrinkage",
          "40% is illegal under margin rules",
          "Half Kelly doubles the growth rate",
        ],
        answer: 1,
        explain: "Kelly is optimal only if the edge estimate is exact. Bet 2x true Kelly and growth goes NEGATIVE. Since estimates are noisy (Lesson 3's standard errors!), pros shade down. Half-Kelly gives ~75% of the growth at half the variance.",
      },
      {
        q: "A strategy has great Sharpe but a 45% max drawdown in backtest. The practical problem:",
        options: [
          "Drawdown doesn't matter if Sharpe is high",
          "No team (or investor) actually holds through -45% — the strategy gets abandoned at the bottom, converting paper drawdown into realized loss",
          "Max drawdown is just one unlucky path",
          "45% drawdowns are statistically impossible with high Sharpe",
        ],
        answer: 1,
        explain: "Risk management is partly psychology management. The backtest assumes you held; humans don't. Sizing to survivable drawdowns (then levering the smoother blend if needed) keeps the strategy alive long enough to work.",
      },
    ],
  },
  {
    id: 10,
    title: "Alpha Research Framework",
    subtitle: "Hypothesis testing, overfitting defense, the team memo",
    status: "locked",
    icon: "🏆",
    concepts: ["Hypothesis Testing", "Multiple Testing", "Out-of-Sample", "Research Memo"],
    mission: "Generate 20 completely random 'signals', pick the best one in-sample, and watch it crumble out-of-sample. Then never trust a single backtest again.",
    explanation: `The final boss is yourself. Test enough random ideas and one WILL look brilliant — that's not alpha, that's order statistics. The best of 20 coin-flippers calls 14 of 20 flips right; would you give them your money?

The professional defense, in order:
1. **Pre-register the hypothesis.** Write down WHY before computing WHAT — 'value stocks outperform after panics because forced sellers misprice them', not 'I tried 50 things'.
2. **Count every test.** If you tried 20 variants, your best p-value needs adjusting (Bonferroni: multiply by 20). The tests you don't report still count — the market doesn't forget them.
3. **Hold out data you NEVER touch** until the very end. One look, one verdict.
4. **Write the memo.** One page: hypothesis, evidence, what would prove it wrong, costs, capacity. Five skeptical teammates poking holes is your best overfitting defense.

Every tool from Missions 1-9 converges here. This framework is the difference between a quant team and six people with yfinance.`,
    rVsPython: [
      {
        label: "Adjust p-values for multiple tests",
        r: `p.adjust(pvals,\n         method = "bonferroni")\np.adjust(pvals, method = "BH")`,
        python: `from statsmodels.stats.multitest \\\n    import multipletests\nrej, p_adj, *_ = multipletests(\n    pvals, method="bonferroni")`,
      },
      {
        label: "Sacred holdout",
        r: `dev  <- df[df$date < "2022-01-01", ]\nhold <- df[df$date >= "2022-01-01", ]\n# touch holdout ONCE, at the end`,
        python: `dev  = df[df.date <  "2022-01-01"]\nhold = df[df.date >= "2022-01-01"]\n# touch holdout ONCE, at the end`,
      },
    ],
    sandbox: {
      packages: ["numpy"],
      starterCode: `import numpy as np

# 20 "signals" that are PURE NOISE — zero real predictive power.
# 500 days in-sample, 250 days out-of-sample.
np.random.seed(10)
returns = np.random.normal(0.0004, 0.012, 750)   # the market
signals = np.random.normal(0, 1, (20, 750))      # 20 random signals

def strat_sharpe(sig, ret):
    pos = np.sign(np.concatenate([[0], sig[:-1]]))  # lagged, of course
    pnl = pos * ret
    return pnl.mean() / pnl.std() * np.sqrt(252)

in_s  = [strat_sharpe(s[:500], returns[:500]) for s in signals]
best  = int(np.argmax(in_s))

print("In-sample Sharpe of all 20 random signals:")
print(" ".join(f"{s:+.1f}" for s in in_s))
print(f"\\nBest signal: #{best}, in-sample Sharpe {in_s[best]:+.2f}  <- looks like alpha!")

oos = strat_sharpe(signals[best][500:], returns[500:])
print(f"Same signal out-of-sample:       {oos:+.2f}  <- the truth")
print()
print("Pick the best of 20 coin flips and you'll 'find' a Sharpe ~1.")
print("That's not alpha. That's order statistics.")

# SIDE QUEST 1: try 100 signals. How good does the in-sample 'best' get?
# SIDE QUEST 2: rerun with different seeds — does the best EVER hold up?`,
      hint: "Every signal here is provably worthless, yet one always shines in-sample. Burn this into memory before your next 'discovery'.",
    },
    commonMistakes: [
      "Reporting the best backtest and quietly forgetting the 19 failures. The market remembers — out-of-sample will collect.",
      "Peeking at the holdout 'just once to check'. Each peek converts holdout into in-sample. One look, one verdict, then it's spent.",
      "A hypothesis invented AFTER seeing the result ('it works because...'). Post-hoc stories fit any noise.",
      "Measuring research productivity in backtests run. The metric is validated, deployable edges — usually 1-2 per year for a small team.",
    ],
    realWorld: `Your team adopts the framework: a shared doc where every hypothesis is registered BEFORE testing, a test counter per idea, and a sacred 2024-2025 holdout nobody touches. Six months in, idea #14 — your post-earnings-drift screen — survives pre-registration, Bonferroni, costs, AND the holdout. It's the team's first deployed signal with real money. The framework didn't slow the team down; it's the reason the one winner was trustable.`,
    quiz: [
      {
        q: "A researcher tests 50 strategy variants; the best has p = 0.01. Roughly how surprising is that under pure noise?",
        options: [
          "Very — p=0.01 means 99% certain it's real",
          "Not at all — with 50 tries you EXPECT about one p<0.02 result from noise alone. Bonferroni-adjusted, p becomes ~0.5: a coin flip",
          "Surprising only if the strategies are uncorrelated",
          "p-values don't apply to backtests",
        ],
        answer: 1,
        explain: "Multiple testing is THE silent killer of quant research. 50 shots at a 1%-likely target ≈ 40% chance of at least one 'hit'. Every test you ran — including the ones you forgot — debases the survivors.",
      },
      {
        q: "Why must the holdout be touched only ONCE?",
        options: [
          "Computing on it twice is expensive",
          "Each evaluation leaks information — if you iterate until the holdout looks good, you've fit to it, and it silently became training data",
          "Data licenses limit usage",
          "Twice is fine if you don't change the model",
        ],
        answer: 1,
        explain: "The holdout's value is its innocence. Use it as a feedback signal even twice and your 'out-of-sample' result is partially in-sample. Spent holdouts must be replaced with NEW data — which takes years to accumulate. Spend wisely.",
      },
      {
        q: "Your memo's strongest section for convincing five skeptical teammates is:",
        options: [
          "The equity curve — a great chart sells itself",
          "'What would prove this wrong' — falsifiability plus the full test count shows the result survived honest attempts to kill it",
          "Comparisons to famous funds using similar signals",
          "Maximum backtest length",
        ],
        answer: 1,
        explain: "Anyone can show a good backtest (Mission 10's sandbox literally generates them from noise). What's rare is evidence the idea survived attempted falsification: pre-registered, all tests counted, holdout intact. That's what skeptics — and capital — respond to.",
      },
    ],
  },
];
