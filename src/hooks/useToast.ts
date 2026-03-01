import { useState, useCallback } from 'react';

export type ToastType = 'error' | 'success' | 'info';

export type ToastState = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'error',
    visible: false,
  });

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    setToast({ message, type, visible: true });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
