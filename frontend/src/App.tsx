import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

export default function App(): React.ReactElement {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
}
