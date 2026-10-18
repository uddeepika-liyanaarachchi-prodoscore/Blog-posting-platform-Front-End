export const notify = {
  success: (message) => {
    Toastify({
      text: message,
      duration: 3500,
      gravity: "top", 
      position: "right", 
      close: true,
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #10b981, #059669)", // Modern Green
        color: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        fontSize: "0.9rem",
      },
    }).showToast();
  },

  error: (message) => {
    Toastify({
      text: message,
      duration: 4000,
      gravity: "top",
      position: "right",
      close: true,
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #ef4444, #dc2626)", // Modern Red
        color: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        fontSize: "0.9rem",
      },
    }).showToast();
  },

  info: (message) => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      close: true,
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #6366f1, #4f46e5)", // Indigo / Purple
        color: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
        fontSize: "0.9rem",
      },
    }).showToast();
  },
};
