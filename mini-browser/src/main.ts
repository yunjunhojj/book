import "./style.css";
import { createMiniBrowser } from "./app";

createMiniBrowser(document.querySelector<HTMLDivElement>("#app")!);
