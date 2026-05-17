"use client";

import { useState } from "react";
import { CameraOff } from "lucide-react";
import { resolveReportPhotoUrl } from "@/lib/reports/reportImageUrl";

export type SecureImageProps = {
  filename?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

export default function SecureImage({
  filename,
  alt,
  className = "w-full rounded-xl border border-slate-200 object-cover",
  fallbackClassName = "mt-2 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500",
}: SecureImageProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveReportPhotoUrl(filename);

  if (!src || failed) {
    return (
      <div className={fallbackClassName} role="img" aria-label={alt}>
        <CameraOff className="h-8 w-8 shrink-0 opacity-60" aria-hidden />
        <span className="text-sm font-medium">Aucune image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
