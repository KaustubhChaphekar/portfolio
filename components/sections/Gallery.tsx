"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/data";

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback((dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => show(i)}
            className="group relative mb-4 block w-full overflow-hidden rounded-2xl border border-line"
            aria-label={`Open photo: ${p.alt}`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              width={p.width}
              height={p.height}
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
              className="h-auto w-full transition duration-500 group-hover:scale-[1.04]"
            />
            {p.place && (
              <span className="absolute bottom-2 left-2 rounded-full bg-bg/70 px-2.5 py-1 font-mono text-[10px] text-ink/90 backdrop-blur">{p.place}</span>
            )}
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && close()}
        className="m-auto max-h-[92vh] max-w-[92vw] overflow-visible bg-transparent p-0 backdrop:bg-bg/90 backdrop:backdrop-blur"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {current && (
          <figure className="relative">
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              sizes="92vw"
              className="max-h-[82vh] w-auto rounded-2xl object-contain"
            />
            <figcaption className="mt-3 flex items-center justify-between gap-4 text-sm text-muted">
              <span>
                {current.alt}
                {current.place && <span className="text-faint"> · {current.place}</span>}
              </span>
              <span className="font-mono text-xs text-faint">
                {(open ?? 0) + 1} / {photos.length}
              </span>
            </figcaption>
            <div className="absolute -top-12 right-0 flex gap-2">
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} className="h-10 w-10 rounded-full border border-line-strong bg-bg/70 text-ink" aria-label="Previous photo">
                    ←
                  </button>
                  <button type="button" onClick={() => step(1)} className="h-10 w-10 rounded-full border border-line-strong bg-bg/70 text-ink" aria-label="Next photo">
                    →
                  </button>
                </>
              )}
              <button type="button" onClick={close} className="h-10 w-10 rounded-full border border-line-strong bg-bg/70 text-ink" aria-label="Close">
                ✕
              </button>
            </div>
          </figure>
        )}
      </dialog>
    </>
  );
}
