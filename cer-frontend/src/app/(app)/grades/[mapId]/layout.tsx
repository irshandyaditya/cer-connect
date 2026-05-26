import AppHeader from "@/components/app-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rekap Nilai — CER Connect",
};

export default function GradesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}