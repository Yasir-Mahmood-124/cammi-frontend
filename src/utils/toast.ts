//utils/toast

export type EnqueueFn = (message: string, options?: any) => void;

let enqueueSnackbarRef: EnqueueFn | null = null;

export const setEnqueueSnackbar = (fn: EnqueueFn) => {
  enqueueSnackbarRef = fn;
};

export const toast = (message: string, options?: any) => {
  if (enqueueSnackbarRef) {
    enqueueSnackbarRef(message, options);
  } else {
    // fallback (provider not mounted yet)
    // you can buffer messages here if you want
    // for now just log
    // eslint-disable-next-line no-console
    console.warn('[toast] provider not mounted yet:', message, options);
  }
};
