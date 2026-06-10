import { useEffect, useState } from "react";
import { lessons } from "./data/lessons.js";
import Dashboard from "./components/Dashboard.jsx";
import LessonView from "./components/LessonView.jsx";
import Glossary from "./components/Glossary.jsx";
import Calculator from "./components/Calculator.jsx";

const STORAGE_KEY = "quantquest-progress";

export const LEVEL_TITLES = [
  "Data Intern", "Junior Quant", "Backtest Wrangler", "Signal Hunter",
  "Alpha Hunter", "Risk Boss", "Portfolio Chief", "Quant Legend",
];
export const levelFromXp = (xp) => Math.min(Math.floor(xp / 75) + 1, LEVEL_TITLES.length);

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const today = new Date().toDateString();
    let streak = saved.streak || 1;
    if (saved.lastVisit && saved.lastVisit !== today) {
      const diff = (new Date(today) - new Date(saved.lastVisit)) / 86400000;
      streak = diff === 1 ? streak + 1 : 1;
    }
    return {
      xp: saved.xp || 0,
      quizPassed: saved.quizPassed || {},
      ranLessons: saved.ranLessons || {},
      forcedOpen: saved.forcedOpen || {},
      streak,
      lastVisit: today,
    };
  } catch {
    return { xp: 0, quizPassed: {}, ranLessons: {}, forcedOpen: {}, streak: 1, lastVisit: new Date().toDateString() };
  }
}

export default function App() {
  const [view, setView] = useState("home");
  const [lessonId, setLessonId] = useState(null);
  const [progress, setProgress] = useState(loadProgress);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const award = (amount, label) => {
    setProgress((p) => ({ ...p, xp: p.xp + amount }));
    setToast(`+${amount} XP — ${label}`);
  };

  // Everyone starts at Mission 1 — a lesson is cleared only by acing its boss quiz.
  const isCleared = (l) => !!progress.quizPassed[l.id];
  // Unlocked = first lesson, previous cleared, or force-opened.
  const isUnlocked = (l) =>
    l.id === 1 || isCleared(l) || isCleared(lessons[l.id - 2]) || !!progress.forcedOpen[l.id];

  const onFirstRun = (id) => {
    if (progress.ranLessons[id]) return;
    setProgress((p) => ({ ...p, ranLessons: { ...p.ranLessons, [id]: true } }));
    award(15, "code executed");
  };

  const onQuizPass = (id) => {
    if (progress.quizPassed[id]) return;
    setProgress((p) => ({ ...p, quizPassed: { ...p.quizPassed, [id]: true } }));
    award(40, "boss quiz cleared");
  };

  const forceOpen = (id) => {
    setProgress((p) => ({ ...p, forcedOpen: { ...p.forcedOpen, [id]: true } }));
  };

  const lesson = lessonId ? lessons.find((l) => l.id === lessonId) : null;
  const nav = (v) => { setView(v); setLessonId(null); window.scrollTo(0, 0); };

  return (
    <>
      <header className="topbar">
        <div className="logo" onClick={() => nav("home")}>
          QUANT<span>QUEST</span>
        </div>
        <nav>
          <button className={view === "home" && !lesson ? "active" : ""} onClick={() => nav("home")}>🗺️ Missions</button>
          <button className={view === "glossary" ? "active" : ""} onClick={() => nav("glossary")}>📖 Glossary</button>
          <button className={view === "calculator" ? "active" : ""} onClick={() => nav("calculator")}>🧮 Calculator</button>
        </nav>
      </header>

      {lesson ? (
        <LessonView
          lesson={lesson}
          unlocked={isUnlocked(lesson)}
          cleared={isCleared(lesson)}
          goHome={() => { setLessonId(null); window.scrollTo(0, 0); }}
          progress={progress}
          onQuizPass={onQuizPass}
          onFirstRun={() => onFirstRun(lesson.id)}
          forceOpen={() => forceOpen(lesson.id)}
        />
      ) : view === "glossary" ? (
        <Glossary />
      ) : view === "calculator" ? (
        <Calculator />
      ) : (
        <Dashboard
          progress={progress}
          isCleared={isCleared}
          isUnlocked={isUnlocked}
          openLesson={(id) => { setLessonId(id); window.scrollTo(0, 0); }}
        />
      )}

      {toast && <div className="xp-toast">⚡ {toast}</div>}
    </>
  );
}
