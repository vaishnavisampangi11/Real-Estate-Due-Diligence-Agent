import React from "react";
import { AlertCircle } from "lucide-react";

function ErrorMessage({ message = "Something went wrong. Please try again later." }) {
  return (
    <div className="flex items-center gap-3 bg-rose-50/90 border border-rose-200 text-rose-700 px-5 py-4 rounded-xl shadow-xs my-4">
      <AlertCircle size={20} className="shrink-0 text-rose-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default ErrorMessage;