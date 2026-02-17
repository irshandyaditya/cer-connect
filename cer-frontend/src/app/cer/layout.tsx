import type { Metadata } from "next";


export default function CerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-white shadow">
        <h1 className="text-xl font-bold">CER Board</h1>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
