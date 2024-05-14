import AppRoutes from "./Routes/Routes";
import { getRouteConfig } from "./Routes/routesConfig";

function App() {
  return (
    <>
      <AppRoutes routesConfig={getRouteConfig()} />
    </>
  );
}

export default App;
