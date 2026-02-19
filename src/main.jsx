import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import App from "./pages/App.jsx";
import logoColor from "./assets/img/LogoColor.png";

// Establecer favicon usando el asset procesado por Vite (funciona en dev y build)
try {
  const existing = document.querySelector("link[rel~='icon']");
  if (existing) {
    existing.href = logoColor;
  } else {
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = logoColor;
    document.head.appendChild(link);
  }
} catch (err) {
  /* no bloquear la app por favicon */
  console.warn("No fue posible actualizar el favicon:", err);
}
import { BrowserRouter } from "react-router-dom";
import { SchoolProvider } from "./lib/context/SchoolContext.jsx";
import { TeacherProvider } from "./lib/context/TeacherContext.jsx";
import { AuthProvider } from "./lib/context/AuthContext.jsx";
import { StudentProvider } from "./lib/context/StudentContext.jsx";
import { DataProvider } from "./lib/context/DataContext.jsx";
import { NotificationProvider } from "./lib/context/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <DataProvider>
            <SchoolProvider>
              <TeacherProvider>
                <StudentProvider>
                  <App />
                </StudentProvider>
              </TeacherProvider>
            </SchoolProvider>
          </DataProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
);
