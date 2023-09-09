import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { CurrentUserProvider } from "./contexts/CurrentUserContext";

const root = document.getElementById("root");

const reactRoot = ReactDOM.createRoot(root);

reactRoot.render(
  <Router>
    <CurrentUserProvider>
    <App />
    </CurrentUserProvider>
  </Router>
);
