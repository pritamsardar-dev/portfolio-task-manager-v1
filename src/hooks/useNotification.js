import { useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification({ message: "", type: "success" });
  };

  return {
    notification,
    showNotification,
    clearNotification,
  };
}
