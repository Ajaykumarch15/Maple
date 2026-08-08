import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QuotesProvider } from "./store/quotes";
import { ThemeProvider } from "./theme";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QuotesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QuotesProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
