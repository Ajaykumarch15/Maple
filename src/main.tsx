import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QuotesProvider } from "./store/quotes";
import { ThemeProvider } from "./theme";
import "./index.css";

const basename =
  import.meta.env.BASE_URL === "/"
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/+$/, "");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QuotesProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </QuotesProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
