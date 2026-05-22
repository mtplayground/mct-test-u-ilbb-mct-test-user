import "./App.css";

const appTitle = import.meta.env.VITE_APP_TITLE || "MCT Playground";

export function App() {
  return (
    <main className="app">
      <section className="app__intro" aria-labelledby="app-title">
        <p className="app__eyebrow">Vite + React + TypeScript</p>
        <h1 id="app-title">{appTitle}</h1>
        <p>
          The playground foundation is ready for the editor, preview, routing,
          persistence, and sharing features tracked in the remaining issues.
        </p>
      </section>
    </main>
  );
}
