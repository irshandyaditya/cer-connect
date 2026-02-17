"use client";

import dynamic from "next/dynamic";
import { ConnectionType } from "../types";

const Xarrow = dynamic(() => import("react-xarrows"), {
  ssr: false,
});

export default function ConnectionsLayer({
  connections,
}: {
  connections: ConnectionType[];
}) {
  return (
    <>
      {connections.map((conn) => (
        <Xarrow
          key={conn.id}
          start={conn.fromId}
          end={conn.toId}
          strokeWidth={2}
        />
      ))}
    </>
  );
}
