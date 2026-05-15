"use client";

import { useEffect, useState } from "react";

const LG_MAX_PX = 1023;

/** True when viewport width is below Tailwind's `lg` breakpoint (mobile / tablet). */
export function useBelowLgViewport(): boolean {
  const [belowLg, setBelowLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LG_MAX_PX}px)`);
    const apply = () => setBelowLg(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return belowLg;
}
