import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Payment from "./Payment";
import "./styles.css";
import "./payment.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Payment />
  </StrictMode>,
);
