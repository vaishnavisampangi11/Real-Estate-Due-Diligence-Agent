import Swal from "sweetalert2";

// Helper function to check if dark mode is active
const isDarkMode = () => document.documentElement.classList.contains("dark");

/**
 * Get dynamic SweetAlert2 custom classes based on theme
 */
const getCustomClass = () => ({
  popup: isDarkMode()
    ? "rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-100 p-6 font-sans"
    : "rounded-2xl bg-white border border-slate-200 shadow-2xl text-slate-900 p-6 font-sans",
  title: isDarkMode()
    ? "text-xl font-bold text-slate-100 tracking-tight"
    : "text-xl font-bold text-slate-900 tracking-tight",
  htmlContainer: isDarkMode()
    ? "text-slate-300 text-sm mt-2 leading-relaxed"
    : "text-slate-600 text-sm mt-2 leading-relaxed",
  confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer mx-2 text-sm",
  cancelButton: isDarkMode()
    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-5 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer mx-2 text-sm"
    : "bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-5 py-2.5 rounded-xl border border-slate-200 transition-colors cursor-pointer mx-2 text-sm",
  denyButton: "bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer mx-2 text-sm",
});

/**
 * Show a success alert
 */
export const showSuccessAlert = (title = "Success", text = "") => {
  const dark = isDarkMode();
  return Swal.fire({
    icon: "success",
    title,
    text,
    background: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f8fafc" : "#0f172a",
    confirmButtonColor: "#2563eb",
    customClass: getCustomClass(),
    buttonsStyling: false,
  });
};

/**
 * Show an error alert
 */
export const showErrorAlert = (title = "Error", text = "Something went wrong.") => {
  const dark = isDarkMode();
  return Swal.fire({
    icon: "error",
    title,
    text,
    background: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f8fafc" : "#0f172a",
    confirmButtonColor: "#dc2626",
    customClass: getCustomClass(),
    buttonsStyling: false,
  });
};

/**
 * Show a warning alert
 */
export const showWarningAlert = (title = "Warning", text = "") => {
  const dark = isDarkMode();
  return Swal.fire({
    icon: "warning",
    title,
    text,
    background: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f8fafc" : "#0f172a",
    confirmButtonColor: "#f59e0b",
    customClass: getCustomClass(),
    buttonsStyling: false,
  });
};

/**
 * Show a confirmation modal dialog
 */
export const showConfirmDialog = async ({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmButtonText = "Yes, proceed",
  cancelButtonText = "Cancel",
  icon = "warning",
}) => {
  const dark = isDarkMode();
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    background: dark ? "#0f172a" : "#ffffff",
    color: dark ? "#f8fafc" : "#0f172a",
    customClass: getCustomClass(),
    buttonsStyling: false,
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export const showConfirmAlert = (title, text) => showConfirmDialog({ title, text });

/**
 * Toast Notification (Top-Right)
 */
export const showToast = (title = "Notification", icon = "success") => {
  const dark = isDarkMode();
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    background: dark ? "#1e293b" : "#0f172a",
    color: "#ffffff",
    customClass: {
      popup: "rounded-xl text-white shadow-xl p-3.5 border border-slate-700",
      title: "text-xs font-semibold text-slate-100",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  return Toast.fire({
    icon,
    title,
  });
};

export default {
  showSuccessAlert,
  showErrorAlert,
  showWarningAlert,
  showConfirmDialog,
  showToast,
};
