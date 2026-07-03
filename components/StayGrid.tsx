"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import RoomCard from "./RoomCard";
import type { DbRoom } from "@/lib/supabase";

const KINDS = ["all", "hut", "room", "dorm"] as const;

export default function StayGrid({ rooms }: { rooms: DbRoom[] }) {
  const t = useTranslations();
  const params = useSearchParams();
  const initial = (["hut", "room", "dorm"].includes(params.get("kind") ?? "") ? params.get("kind") : "all") as string;
  const [kind, setKind] = useState(initial);

  const list = kind === "all" ? rooms : rooms.filter((r) => r.kind === kind);

  return (
    <>
      <div className="filters" style={{ marginBottom: "2.4rem" }}>
        {KINDS.map((k) => (
          <button
            key={k}
            data-kind={k}
            className={kind === k ? "active" : ""}
            onClick={() => {
              setKind(k);
              history.replaceState(null, "", k === "all" ? "?" : `?kind=${k}`);
            }}
          >
            {k === "all" ? t("stay.filterAll") : t(`common.kind_${k}_plural`)}
          </button>
        ))}
      </div>
      <div className="stay-grid">
        {list.map((r) => <RoomCard key={r.slug} room={r} />)}
      </div>
    </>
  );
}
