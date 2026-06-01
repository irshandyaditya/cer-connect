import type { Metadata } from "next";
import MapsClient from "./maps-client";

export const metadata: Metadata = {
  title: "Daftar Map — CER Connect",
};

export default function MapsPage() {
  return <MapsClient />;
}