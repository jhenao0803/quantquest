import { useState } from "react";
import Sandbox from "./Sandbox.jsx";
import Quiz from "./Quiz.jsx";

// Minimal markdown: **bold** and `code`, paragraph per blank line.
function Rich({ text }) {
  return text.split(/\n\n+/).map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, j) => {
      if (p.startsWith("**")) return <strong key={j}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("`")) return <code key={j}>{p.slice(1, -1)}</code>;
      return p;
    });
    return <p key={i}>{parts}</p>;
  });
}

const STEPS = ["🎯 Briefing", "⚔️ Code Arena", "💥 Trap Room", "🏆 Boss Quiz"];

export default function LessonView({ lesson, unlocked, cleared, goHome, progress, onQuizPass, onFirstRun, forceOpen }) {
  const [step, setStep] = useState(1); // land directly in the Code Arena — learn by doing
  const [ranCode, setRanCode] = useState(false);

  if (!unlocked) {
    return (
      <div>
        <button className="back" onClick={goHome}>← Mission map</button>
        <div className="locked-view">
          <div className="big-icon">🔒</div>
          <h1>Mission {lesson.id}: {lesson.title}</h1>
          <p style={{ color: "var(--purple)", fontWeight: 800 }}>{lesson.subtitle}</p>
          <p>{lesson.preview || lesson.mission}</p>
          <p style={{ fontSize: 13 }}>
            Unlocks when you clear Mission {lesson.id - 1}'s boss quiz. Coming up:{" "}
            {lesson.concepts.join(" · ")}
          </p>
          <button className="force-open" onClick={forceOpen}>
            ⚡ Open anyway — I know what I'm doing
          </button>
        </div>
      </div>
    );
  }

  const goto = (s) => { setStep(s); window.scrollTo(0, 0); };

  return (
    <div>
      <div className="lesson-header">
        <button className="back" onClick={goHome}>← Mission map</button>
        <h1>{lesson.icon} Mission {lesson.id}: {lesson.title} {cleared && "✅"}</h1>
        <div className="subtitle">{lesson.subtitle}</div>
        <div className="concept-chips">
          {lesson.concepts.map((c) => <span className="chip" key={c}>{c}</span>)}
        </div>
      </div>

      <div className="steps">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`step-pill ${step === i ? "active" : ""} ${i === 3 && progress.quizPassed[lesson.id] ? "done-step" : ""}`}
            onClick={() => goto(i)}
          >
            {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="panel">
          <div className="mission-brief">
            <span className="mb-label">YOUR MISSION</span>
            {lesson.mission}
          </div>
          <div className="realworld" style={{ marginBottom: 14 }}>
            <strong>💼 Why your team cares:</strong> {lesson.realWorld}
          </div>
          <details className="intel">
            <summary>📖 Full intel — the concept explained (optional reading)</summary>
            <div className="intel-body explanation"><Rich text={lesson.explanation} /></div>
          </details>
          <div className="wizard-nav">
            <span />
            <button className="btn next-btn" onClick={() => goto(1)}>Enter the Code Arena →</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="panel">
          <h2>⚔️ Code Arena <span className="tag">+15 XP first run</span></h2>
          <div className="mission-brief" style={{ fontSize: 15 }}>
            <span className="mb-label">YOUR MISSION</span>
            {lesson.mission}
          </div>
          {ranCode && (
            <div className="celebrate">
              🎉 <strong>That output is real Python from YOUR code.</strong> Same workflow you'll
              use to evaluate signals for the team. Try the side quests in the comments!
            </div>
          )}
          <Sandbox
            sandbox={lesson.sandbox}
            onFirstRun={() => { setRanCode(true); onFirstRun(); }}
          />
          <details className="intel" style={{ marginTop: 14 }}>
            <summary>🔁 Stuck? R → Python cheat sheet</summary>
            <div className="intel-body">
              {lesson.rVsPython.map((block) => (
                <div className="compare-block" key={block.label}>
                  <div className="compare-label">{block.label}</div>
                  <div className="compare-grid">
                    <div className="code-pane r">
                      <div className="pane-title">R — WHAT YOU KNOW</div>
                      <pre>{block.r}</pre>
                    </div>
                    <div className="code-pane py">
                      <div className="pane-title">PYTHON — WHAT YOU'RE LEARNING</div>
                      <pre>{block.python}</pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>
          <details className="intel">
            <summary>📖 Full intel — the concept explained (optional reading)</summary>
            <div className="intel-body explanation"><Rich text={lesson.explanation} /></div>
          </details>
          <div className="wizard-nav">
            <button className="btn ghost" onClick={() => goto(0)}>← Briefing</button>
            <button className="btn next-btn" onClick={() => goto(2)}>Survive the Trap Room →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="panel">
          <h2>💥 Trap Room — mistakes that cost real money</h2>
          <ul className="mistake-list">
            {lesson.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
          <div className="realworld" style={{ marginTop: 14 }}>
            <strong>💼 On the team:</strong> {lesson.realWorld}
          </div>
          <div className="wizard-nav" style={{ marginTop: 16 }}>
            <button className="btn ghost" onClick={() => goto(1)}>← Code Arena</button>
            <button className="btn next-btn" onClick={() => goto(3)}>Fight the Boss →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="panel">
          <h2>🏆 Boss Quiz <span className="tag">+40 XP perfect score</span></h2>
          {progress.quizPassed[lesson.id] && (
            <div className="celebrate">
              👑 <strong>Boss already defeated.</strong> Replay for practice — the XP stays banked.
            </div>
          )}
          <Quiz questions={lesson.quiz} lessonId={lesson.id} onPass={onQuizPass} />
          <div className="wizard-nav">
            <button className="btn ghost" onClick={() => goto(2)}>← Trap Room</button>
            <button className="btn next-btn" onClick={goHome}>Mission map →</button>
          </div>
        </div>
      )}
    </div>
  );
}
