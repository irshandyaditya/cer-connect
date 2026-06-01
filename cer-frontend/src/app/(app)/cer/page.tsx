"use client";

import Board from "./components/board";
import { Suspense } from "react";

export default function CerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <Board/>
    </Suspense>
  )
}