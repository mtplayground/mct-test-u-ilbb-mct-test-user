export type Project = {
  id: string;
  title: string;
  html: string;
  css: string;
  js: string;
  updatedAt: string;
};

export const starterProject: Project = {
  id: "starter",
  title: "Starter Project",
  updatedAt: "2026-01-01T00:00:00.000Z",
  html: `<section class="starter-card">
  <h1>Hello playground</h1>
  <p id="starter-message">Edit the HTML, CSS, and JavaScript to make this your own.</p>
  <button id="starter-button" type="button">Click me</button>
</section>`,
  css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f6f8fb;
  color: #172033;
  font-family: Inter, system-ui, sans-serif;
}

.starter-card {
  max-width: 32rem;
  padding: 2rem;
  border: 1px solid #d7dfeb;
  border-radius: 12px;
  background: white;
  box-shadow: 0 18px 45px rgb(23 32 51 / 0.08);
}

.starter-card h1 {
  margin: 0 0 0.75rem;
}

.starter-card p {
  color: #3e4a5f;
  line-height: 1.6;
}

.starter-card button {
  border: 0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  background: #0d87ad;
  color: white;
  cursor: pointer;
}`,
  js: `const button = document.querySelector("#starter-button");
const message = document.querySelector("#starter-message");

let clicks = 0;

button?.addEventListener("click", () => {
  clicks += 1;

  if (message) {
    message.textContent = \`You clicked the starter button \${clicks} time\${clicks === 1 ? "" : "s"}.\`;
  }
});`,
};
