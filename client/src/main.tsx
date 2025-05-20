import React from 'react';
import { createRoot } from "react-dom/client";
import SimpleApp from './components/SimpleApp';
import "./index.css";

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>
  );
}