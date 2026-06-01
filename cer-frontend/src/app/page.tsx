import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <a href="/cer">CER</a> |
      <a href="/cer-react-flow">CER React Flow</a>
    </div>
  );
}
