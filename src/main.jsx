import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// MUI Theme
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* ensures dark background and resets default styles */}
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
