import { useState } from "react";

export default function Quiz({ questions, lessonId, onPass }) {
  const [answers, setAnswers] = useState({}); // qIndex -> chosen option index
  const answered = Object.keys(answers).length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const done = answered === questions.length;
  const pass = done && correct === questions.length;

  const choose = (qi, oi) => {
    if (answers[qi] !== undefined) return;
    const next = { ...answers, [qi]: oi };
    setAnswers(next);
    const allDone = Object.keys(next).length === questions.length;
    const allRight = questions.every((q, i) => next[i] === q.answer);
    if (allDone && allRight) onPass?.(lessonId);
  };

  return (
    <div>
      {questions.map((q, qi) => (
        <div className="quiz-q" key={qi}>
          <div className="qtext">Q{qi + 1}. {q.q}</div>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              const picked = answers[qi];
              let cls = "";
              if (picked !== undefined) {
                if (oi === q.answer) cls = "correct";
                else if (oi === picked) cls = "wrong";
              }
              return (
                <button key={oi} className={cls} disabled={picked !== undefined} onClick={() => choose(qi, oi)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {answers[qi] !== undefined && (
            <div className="quiz-explain">
              {answers[qi] === q.answer ? "✅ Correct. " : "❌ Not quite. "}
              {q.explain}
            </div>
          )}
        </div>
      ))}
      {done && (
        <div className={`quiz-result ${pass ? "pass" : ""}`}>
          <div className="big">{pass ? "🏆" : "📚"}</div>
          <strong>{correct} / {questions.length} correct</strong>
          <p style={{ color: "var(--text-dim)", marginTop: 6 }}>
            {pass
              ? "Perfect score — this is exactly the reasoning your team needs in research reviews."
              : "Reread the explanations above — these questions test the judgment calls that come up in real alpha research."}
          </p>
          {!pass && (
            <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setAnswers({})}>
              Retry quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
