"use client";

import { ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import theme from "./index";
import { store, persistor } from "@/redux/store";
import "typeface-glacial-indifference";
import ToastProvider from "@/providers/ToastProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
}