import { useEffect } from "react";
import GeneralRoutes from "../routes/generalRoutes";
import { initTheme } from "../utils/themeManager";
import { Toast } from "../components/atoms/Toast";

function App() {
  useEffect(() => {
    // Inicializa tema una sola vez al montar
    initTheme();
  }, []);

  return (
    <>
      <Toast />
      <GeneralRoutes />
    </>
  );
}

export default App;
