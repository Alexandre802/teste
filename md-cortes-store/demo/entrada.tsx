import { createRoot } from "react-dom/client";
import App from "./App";

// O CSS não passa pelo empacotador: a CLI do Tailwind gera demo/saida/app.css
// a partir de demo/estilo.css, e o HTML final o embute inteiro.
const raiz = document.getElementById("app");
if (raiz) createRoot(raiz).render(<App />);
