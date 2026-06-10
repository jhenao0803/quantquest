import { useState } from "react";
import { glossary } from "../data/glossary.js";

export default function Glossary() {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const hits = glossary
    .filter((g) =>
      !needle ||
      g.term.toLowerCase().includes(needle) ||
      g.def.toLowerCase().includes(needle) ||
      g.example.toLowerCase().includes(needle)
    )
    .sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div>
      <div className="hero">
        <h1>Key Concepts <em>Glossary</em></h1>
        <p>Every term from the lessons — plain English first, finance example second.</p>
      </div>
      <input
        className="search-box"
        placeholder='Search terms, definitions, or examples… try "bias" or "GME"'
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {hits.length === 0 && <p style={{ color: "var(--text-dim)" }}>No matches for “{q}”.</p>}
      {hits.map((g) => (
        <div className="gloss-card" key={g.term}>
          <span className="term">{g.term}</span>
          <span className="lesson-tag">Lesson {g.lesson}</span>
          <div className="def">{g.def}</div>
          <div className="example">📈 {g.example}</div>
        </div>
      ))}
    </div>
  );
}
