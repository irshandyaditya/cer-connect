"use client";

type Props = {
  message: string;
};

export default function Toast({ message }: Props) {
  return (
    <>
      <div
        className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[200] px-5 py-2.5 rounded-full
          text-white text-sm font-semibold pointer-events-none"
        style={{
          background: "#1a1a2e",
          animation: "toastIn 0.2s ease",
        }}
      >
        {message}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}