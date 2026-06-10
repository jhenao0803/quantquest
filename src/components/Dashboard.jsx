import { lessons } from "../data/lessons.js";
import { glossary } from "../data/glossary.js";
import { LEVEL_TITLES, levelFromXp } from "../App.jsx";

export default function Dashboard({ progress, isCleared, isUnlocked, openLesson }) {
  const cleared = lessons.filter(isCleared).length;
  const nextLesson = lessons.find((l) => !isCleared(l));
  const level = levelFromXp(progress.xp);
  const xpIntoLevel = progress.xp % 75;
  const conceptCount = lessons.filter(isCleared).reduce((n, l) => n + l.concepts.length, 0);

  return (
    <div>
      <div className="player-bar">
        <div className="level-badge">
          <div className="lvl-num">{level}</div>
          <div className="lvl-word">LEVEL</div>
        </div>
        <div className="player-meta">
          <div className="player-title">
            <em>Jorge</em> · {LEVEL_TITLES[level - 1]}
          </div>
          <div className="xp-bar">
            <div className="xp-fill" style={{ width: `${(xpIntoLevel / 75) * 100}%` }} />
          </div>
          <div className="xp-label">
            ⚡ {progress.xp} XP total — {75 - xpIntoLevel} XP to {LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)]}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 800 }}>
          {nextLesson
            ? <>🎯 Next mission: <span style={{ color: "var(--purple)" }}>{nextLesson.title}</span></>
            : <>👑 All missions cleared!</>}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Missions cleared</div>
          <div className="value">{cleared}/{lessons.length}</div>
          <div className="sub">earn 40 XP per boss quiz</div>
        </div>
        <div className="stat-card">
          <div className="label">Concepts mastered</div>
          <div className="value">{conceptCount}</div>
          <div className="sub">{glossary.length} terms in the glossary</div>
        </div>
        <div className="stat-card">
          <div className="label">Code runs</div>
          <div className="value">{Object.keys(progress.ranLessons).length}</div>
          <div className="sub">arenas where you ran code</div>
        </div>
        <div className="stat-card">
          <div className="label">Streak</div>
          <div className="value">{progress.streak} 🔥</div>
          <div className="sub">days in a row</div>
        </div>
      </div>

      <div className="map-title">🗺️ Mission Map</div>
      <div className="roadmap">
        {lessons.map((l) => {
          const done = isCleared(l);
          const open = isUnlocked(l);
          const ready = !done && open;
          return (
            <button
              key={l.id}
              className={`lesson-row ${done ? "cleared" : ready ? "ready" : "locked"}`}
              onClick={() => openLesson(l.id)}
            >
              <div className="icon">{l.icon}</div>
              <div className="meta">
                <div className="title">Mission {l.id}: {l.title}</div>
                <div className="subtitle">{l.subtitle}</div>
              </div>
              {done
                ? <span className="badge done">✓ CLEARED</span>
                : ready
                  ? <span className="badge next">🎯 PLAY</span>
                  : <span className="badge locked">🔒 LOCKED</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
