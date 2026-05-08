"use client";

import { Toaster } from "sonner";

export function AuthToaster() {
  return (
    <Toaster
      richColors
      position="top-center"
      toastOptions={{ className: "font-sans" }}
    />
  );
}
