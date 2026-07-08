"use client";

import dynamic from "next/dynamic";
import { WhoopDevice } from "@/components/graphics";

/**
 * Three.js is a heavy import, so the 3D strap loads after first paint and
 * only on the client. The 2D strap stands in while it downloads, so the
 * hero never shows a hole.
 */
const Whoop3D = dynamic(() => import("@/components/whoop-3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <WhoopDevice className="h-3/4 opacity-70" />
    </div>
  ),
});

export function Whoop3DLazy({ className }: { className?: string }) {
  return <Whoop3D className={className} />;
}
