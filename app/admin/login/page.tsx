import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioLogin } from "@/components/admin/FormularioLogin";

export const metadata: Metadata = {
  title: "Painel administrativo",
  robots: { index: false, follow: false },
};

export default function PaginaLogin() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-nevoa px-4 py-10">
      <Suspense fallback={null}>
        <FormularioLogin />
      </Suspense>
    </main>
  );
}
