'use client';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import ToastSetter from './ToastSetter';

type Props = { children: React.ReactNode };

export default function ToastProvider({ children }: Props) {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={4000}
      preventDuplicate
    >
      <ToastSetter />
      {children}
    </SnackbarProvider>
  );
}
