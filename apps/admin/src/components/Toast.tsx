import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgClass = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-info',
  }[type];

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 11 }}
    >
      <div className={`toast show ${bgClass} text-white`} role="alert">
        <div className="toast-body d-flex justify-content-between align-items-center">
          <span>{message}</span>
          <button
            type="button"
            className="btn-close btn-close-white ms-3"
            onClick={onClose}
          ></button>
        </div>
      </div>
    </div>
  );
}
