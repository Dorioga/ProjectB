import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./pages/App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SchoolProvider } from "./lib/context/SchoolContext.jsx";
import { AuthProvider } from "./lib/context/AuthContext.jsx";
import { StudentProvider } from "./lib/context/StudentContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <StudentProvider>
            <App />
          </StudentProvider>
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
