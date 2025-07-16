import { useCallback } from "react";

// type Toast = {
//   id: number;
//   message: string;
//   type?: "success" | "error" | "info";
// };

export function useToast() {
  // This is a simple placeholder. Replace with your toast logic or connect to a context/provider.
  const showToast = useCallback(
    (message: string, type?: "success" | "error" | "info") => {
      // Implement your toast logic here, e.g., update state, call a toast library, etc.
      alert(`${type ? `[${type}] ` : ""}${message}`);
    },
    []
  );

  return { showToast };
}
