import { useState, useRef } from "react";

// Real Python in the browser via Pyodide (loaded lazily from CDN on first run).
let pyodidePromise = null;

function loadPyodideOnce() {
  if (!pyodidePromise) {
    pyodidePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
      script.onload = async () => {
        try {
          resolve(await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
          }));
        } catch (e) { reject(e); }
      };
      script.onerror = () => reject(new Error("Could not load the Python runtime (check your internet connection)."));
      document.head.appendChild(script);
    });
  }
  return pyodidePromise;
}

export default function Sandbox({ sandbox, onFirstRun }) {
  const [code, setCode] = useState(sandbox.starterCode);
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | running
  const [isError, setIsError] = useState(false);
  const ranOnce = useRef(false);

  const run = async () => {
    setIsError(false);
    setStatus("loading");
    setOutput("Starting Python runtime…");
    try {
      const py = await loadPyodideOnce();
      if (sandbox.packages?.length) {
        setOutput(`Loading ${sandbox.packages.join(", ")}…`);
        await py.loadPackage(sandbox.packages);
      }
      setStatus("running");
      setOutput("Running…");
      await py.runPythonAsync(
        "import sys, io\nsys.stdout = io.StringIO()\nsys.stderr = sys.stdout"
      );
      try {
        await py.runPythonAsync(code);
        const out = await py.runPythonAsync("sys.stdout.getvalue()");
        setOutput(out || "(no output — add a print() to see results)");
        if (!ranOnce.current) { ranOnce.current = true; onFirstRun?.(); }
      } catch (err) {
        const out = await py.runPythonAsync("sys.stdout.getvalue()").catch(() => "");
        setIsError(true);
        setOutput((out ? out + "\n" : "") + String(err.message || err).split("\n").slice(-12).join("\n"));
      }
    } catch (err) {
      setIsError(true);
      setOutput(String(err.message || err));
    }
    setStatus("idle");
  };

  return (
    <div className="sandbox">
      <div className="hint">💡 {sandbox.hint}</div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="toolbar">
        <button className="btn" onClick={run} disabled={status !== "idle"}>
          {status === "idle" ? "▶ Run Python" : status === "loading" ? "Loading runtime…" : "Running…"}
        </button>
        <button className="btn ghost" onClick={() => { setCode(sandbox.starterCode); setOutput(null); setIsError(false); }}>
          Reset code
        </button>
      </div>
      {output !== null && (
        <div className={`output ${isError ? "error" : ""}`}>{output}</div>
      )}
      {output === null && (
        <div className="output"><span className="dim">Output appears here. Real Python runs in your browser — edit anything and experiment.</span></div>
      )}
    </div>
  );
}
