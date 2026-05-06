import AppHeader from "@/components/app-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CER Connect",
};

export default function MapsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      <main>{children}</main>
    </div>
  );
}