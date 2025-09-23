'use client';
import React, { useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { setEnqueueSnackbar } from '../utils/toast';

export default function ToastSetter() {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setEnqueueSnackbar(enqueueSnackbar);
    // cleanup (optional)
    return () => setEnqueueSnackbar(() => {});
  }, [enqueueSnackbar]);

  return null;
}
