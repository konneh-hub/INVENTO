import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./styles.css";

function Placeholder({ title }: { title: string }) {
  return (
    <main>
      <p>Inventory Platform / Business Web</p>
      <h1>{title}</h1>
      <Link to="/">Return home</Link>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Web foundation" />} />
      <Route path="/login" element={<Placeholder title="Login route placeholder" />} />
      <Route path="/dashboard" element={<Placeholder title="Dashboard route placeholder" />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
