import React, { useEffect } from "react";

const CustomAlert = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className="custom-alert">{message}</div>;
};

export default CustomAlert;
