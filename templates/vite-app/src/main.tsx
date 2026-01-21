import { createRoot } from "react-dom/client";

import App from "./App";
import "./styles/global.scss";
import "@humyn/ui/dist/styles.css";

createRoot(document.getElementById("root")!).render(<App />);
