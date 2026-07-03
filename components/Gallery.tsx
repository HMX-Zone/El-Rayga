"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function Gallery({ photos, name }: { photos: string[]; name: string }) {
  const t = useTranslations("room");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="room-gallery">
        {photos.map((p, i) => (
          <figure key={p} onClick={() => setOpen(p)} data-reveal-img className={i === 0 ? "revealed" : ""}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt={`${name} — ${i + 1}`} loading={i > 1 ? "lazy" : "eager"} />
            {i === photos.length - 1 && (
              <span className="more">{t("photosZoom", { count: photos.length })}</span>
            )}
          </figure>
        ))}
      </div>
      {open && (
        <div className="lightbox" role="dialog" aria-label={name} onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={open} alt={name} />
        </div>
      )}
    </>
  );
}
