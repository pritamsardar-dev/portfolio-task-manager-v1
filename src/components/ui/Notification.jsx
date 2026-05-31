import { useEffect } from "react";

import clsx from "clsx";

function Notification({ message, type, onClose }) {
  // Auto close after display duration
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={clsx(
        "fixed bottom-5 right-5 z-50",
        "rounded-2xl border px-5 py-4",
        "shadow-xl backdrop-blur-md",
        "transition-all duration-300",
        type === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-400"
          : "border-green-500/30 bg-green-500/10 text-green-400",
      )}
    >
      {message}
    </div>
  );
}

export default Notification;
