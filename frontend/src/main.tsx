// frontens/src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeProvider, createTheme } from "@mui/material";
import { FontSizeProvider } from "./context/FontSizeContext.tsx";
const theme = createTheme({
  // cssVariables: true,
  colorSchemes: {
    light: true,
    dark: true,
  },

  cssVariables: {
    colorSchemeSelector: "class",
  },
});
const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <FontSizeProvider>
          <App />
          <Toaster />
        </FontSizeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
