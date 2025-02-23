import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faPerson, faPersonDress, faBottleWater, faShoePrints, faRug } from "@fortawesome/free-solid-svg-icons";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { Toaster } from "./components/ui/toaster.jsx";
import { HelmetProvider } from "react-helmet-async";

// Add FontAwesome icons to library
library.add(faPerson, faPersonDress, faBottleWater, faShoePrints, faRug);

createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <Toaster />
      </Provider>
    </BrowserRouter>
  </HelmetProvider>
);
