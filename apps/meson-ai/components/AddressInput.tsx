"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "./Input";

export type AddressParts = {
  address: string;
  suburb: string;
  state: string;
  country: string;
  postcode: string;
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties: {
    name?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    district?: string;
    locality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    type?: string;
    osm_id?: number;
  };
};

const AU_STATE_ABBR: Record<string, string> = {
  "new south wales": "NSW",
  victoria: "VIC",
  queensland: "QLD",
  "western australia": "WA",
  "south australia": "SA",
  tasmania: "TAS",
  "australian capital territory": "ACT",
  "northern territory": "NT",
};

function abbreviateState(state: string | undefined, country: string | undefined): string {
  if (!state) return "";
  if ((country ?? "").toLowerCase() === "australia") {
    return AU_STATE_ABBR[state.toLowerCase()] ?? state;
  }
  return state;
}

function partsFromPhoton(f: PhotonFeature): AddressParts {
  const p = f.properties;
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const address = street || p.name || "";
  const country = p.country || "Australia";
  return {
    address,
    suburb: p.city || p.district || p.locality || p.county || "",
    state: abbreviateState(p.state, country),
    country,
    postcode: p.postcode || "",
  };
}

function labelForFeature(f: PhotonFeature): string {
  const p = f.properties;
  const street = [p.housenumber, p.street].filter(Boolean).join(" ");
  const head = street || p.name || "";
  const tail = [p.city || p.district, p.state, p.postcode, p.country]
    .filter(Boolean)
    .join(", ");
  return [head, tail].filter(Boolean).join(" · ");
}

async function searchPhoton(
  query: string,
  signal: AbortSignal
): Promise<PhotonFeature[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(
    query
  )}&limit=6&lang=en`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: PhotonFeature[] };
  return (data.features ?? []).filter((f) => {
    const t = f.properties.type;
    // Drop non-address entries (continents, countries-only, etc.)
    return t !== "country" && t !== "continent" && t !== "state";
  });
}

export function AddressInput({
  value,
  onChange,
  onSelect,
  placeholder = "Start typing your address…",
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (parts: AddressParts) => void;
  placeholder?: string;
}) {
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<string>("");

  useEffect(() => {
    const q = value.trim();
    if (q.length < 3 || q === lastSelectedRef.current) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const features = await searchPhoton(q, controller.signal);
        setResults(features);
        setOpen(features.length > 0);
        setHighlight(-1);
      } catch {
        // aborted or network error — leave previous results
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (f: PhotonFeature) => {
    const parts = partsFromPhoton(f);
    lastSelectedRef.current = parts.address;
    onChange(parts.address);
    onSelect?.(parts);
    setOpen(false);
    setResults([]);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (lastSelectedRef.current && e.target.value !== lastSelectedRef.current) {
            lastSelectedRef.current = "";
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading && (
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-block h-3.5 w-3.5 animate-spin rounded-full"
          style={{
            border: "2px solid var(--surface-2)",
            borderTopColor: "var(--accent)",
          }}
        />
      )}
      {open && results.length > 0 && (
        <ul
          className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-[260px] overflow-auto rounded-[12px] p-1.5"
          style={{
            background: "var(--surface-modal)",
            border: "1px solid var(--border-strong)",
            boxShadow: "var(--shadow)",
          }}
        >
          {results.map((f, i) => {
            const active = i === highlight;
            return (
              <li key={`${f.properties.osm_id ?? i}`}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(f)}
                  onMouseEnter={() => setHighlight(i)}
                  className="block w-full cursor-pointer rounded-[9px] px-3 py-2 text-left text-[13px]"
                  style={{
                    background: active ? "var(--surface-2)" : "transparent",
                    color: "var(--text)",
                  }}
                >
                  {labelForFeature(f)}
                </button>
              </li>
            );
          })}
          <li
            className="px-3 pt-1.5 pb-1 text-[10.5px]"
            style={{ color: "var(--text-faint)" }}
          >
            Powered by OpenStreetMap · Photon
          </li>
        </ul>
      )}
    </div>
  );
}
