"use client";

import { useEffect } from "react";
import { trackPointer } from "@/lib/hooks";
import { getPrefs, initPrefs } from "@/lib/prefs";
import { startSound } from "@/lib/sound";

// Reads the visitor's saved preferences once, and resumes music if they left it on.
export default function PrefsBoot() {
  useEffect(() => {
    initPrefs();
    trackPointer();
    if (getPrefs().sound) startSound();
  }, []);

  return null;
}
