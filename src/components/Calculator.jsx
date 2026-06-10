import { useMemo, useState } from "react";

const parse = (s) =>
  s.split(/[\s,;]+/).map(Number).filter((x) => Number.isFinite(x));

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const std = (a) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length);
};

const DEFAULT_STRAT = "0.012, -0.008, 0.021, -0.003, 0.015, 0.007, -0.011, 0.018, 0.004, -0.006, 0.009, 0.013, -0.002, 0.016, -0.009";
const DEFAULT_MKT = "0.008, -0.005, 0.014, -0.001, 0.010, 0.006, -0.009, 0.012, 0.002, -0.004, 0.007, 0.009, -0.003, 0.011, -0.007";

export default function Calculator() {
  const [stratText, setStratText] = useState(DEFAULT_STRAT);
  const [mktText, setMktText] = useState(DEFAULT_MKT);
  const [rfAnnual, setRfAnnual] = useState("0.04");

  const m = useMemo(() => {
    const r = parse(stratText);
    const mkt = parse(mktText);
    if (r.length < 2) return null;

    const rfDaily = (Number(rfAnnual) || 0) / 252;
    const excess = r.map((x) => x - rfDaily);

    const wins = r.filter((x) => x > 0);
    const losses = r.filter((x) => x < 0);
    const grossWin = wins.reduce((s, x) => s + x, 0);
    const grossLoss = Math.abs(losses.reduce((s, x) => s + x, 0));

    const out = {
      n: r.length,
      total: r.reduce((p, x) => p * (1 + x), 1) - 1,
      sharpe: std(excess) > 0 ? (mean(excess) / std(excess)) * Math.sqrt(252) : NaN,
      winRate: wins.length / r.length,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : Infinity,
      vol: std(r) * Math.sqrt(252),
    };

    if (mkt.length === r.length && mkt.length > 2) {
      const mE = mkt.map((x) => x - rfDaily);
      const mm = mean(mE), rm = mean(excess);
      const cov = mE.reduce((s, x, i) => s + (x - mm) * (excess[i] - rm), 0) / mkt.length;
      const varM = std(mE) ** 2;
      out.beta = varM > 0 ? cov / varM : NaN;
      out.alpha = (rm - out.beta * mm) * 252; // annualized
    }
    return out;
  }, [stratText, mktText, rfAnnual]);

  const fmt = (x, pct = false, d = 2) =>
    !Number.isFinite(x) ? "—"
      : pct ? `${(x * 100).toFixed(d)}%`
      : Number.isInteger(x) ? String(x)
      : x.toFixed(d);

  const Metric = ({ label, value, pct, note, goodAbove = 0 }) => {
    const num = m?.[value];
    return (
      <div className="metric-card">
        <div className="label">{label}</div>
        <div className={`value ${Number.isFinite(num) ? (num >= goodAbove ? "pos" : "neg") : ""}`}>
          {fmt(num, pct)}
        </div>
        <div className="note">{note}</div>
      </div>
    );
  };

  return (
    <div>
      <div className="hero">
        <h1>Quant Metrics <em>Calculator</em></h1>
        <p>
          Paste any return series (decimals — 0.01 = 1%) and get the numbers your team asks for first.
          Paste matching market returns to estimate alpha and beta via CAPM.
        </p>
      </div>
      <div className="calc-grid">
        <div>
          <div className="field-row">
            <label>Strategy / stock daily returns (comma, space, or newline separated)</label>
            <textarea value={stratText} onChange={(e) => setStratText(e.target.value)} spellCheck={false} />
          </div>
          <div className="field-row">
            <label>Market (e.g. SPY) daily returns — same length, for alpha & beta. Optional.</label>
            <textarea value={mktText} onChange={(e) => setMktText(e.target.value)} spellCheck={false} style={{ minHeight: 110 }} />
          </div>
          <div className="field-row">
            <label>Annual risk-free rate (decimal, e.g. 0.04 for 4%)</label>
            <input value={rfAnnual} onChange={(e) => setRfAnnual(e.target.value)} />
          </div>
        </div>
        <div>
          {!m ? (
            <p style={{ color: "var(--text-dim)" }}>Enter at least 2 returns to compute metrics.</p>
          ) : (
            <>
              <div className="metric-grid">
                <Metric label="Annualized Sharpe" value="sharpe" goodAbove={1} note="Excess return / vol × √252. >1 good, >2 bring it to the team." />
                <Metric label="Win Rate" value="winRate" pct goodAbove={0.5} note="Up periods ÷ total. Meaningless without profit factor →" />
                <Metric label="Profit Factor" value="profitFactor" goodAbove={1} note="Gross wins ÷ gross losses. >1 = winners outweigh losers in money." />
                <Metric label="Total Return" value="total" pct goodAbove={0} note="Compounded: (1+r) multiplied through, not summed." />
                <Metric label="Annualized Vol" value="vol" pct goodAbove={Infinity} note="Daily std × √252 — the risk denominator of Sharpe." />
                <Metric label="Beta (vs market)" value="beta" goodAbove={-Infinity} note="CAPM slope. Needs market series of equal length." />
                <Metric label="Alpha (annualized)" value="alpha" pct goodAbove={0} note="CAPM intercept × 252. The number your team hunts — check significance before celebrating." />
                <Metric label="Observations" value="n" goodAbove={-Infinity} note="Short samples → wide error bars on everything above." />
              </div>
              <p style={{ color: "var(--text-dim)", fontSize: 12.5, marginTop: 12 }}>
                Assumes daily returns (252 trading days/yr). Remember Lesson 3: an alpha estimate
                from {m.n} observations has enormous standard errors — treat it as a hint, not a finding.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
