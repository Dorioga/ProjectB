import { useEffect } from "react";
import GeneralRoutes from "../routes/generalRoutes";
import { initTheme } from "../utils/themeManager";

function App() {
  useEffect(() => {
    // Inicializa tema una sola vez al montar
    initTheme();
  }, []);

  return <GeneralRoutes />;
}

export default App;
