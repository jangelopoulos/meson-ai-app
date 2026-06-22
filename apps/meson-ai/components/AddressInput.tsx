"use client";

import { useEffect, useRef } from "react";
import { Input } from "./Input";

export type AddressParts = {
  address: string;
  suburb: string;
  state: string;
  country: string;
  postcode: string;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: Record<string, unknown>
          ) => GooglePlacesAutocomplete;
        };
      };
    };
  }
}

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePlacesAutocomplete = {
  addListener: (event: string, cb: () => void) => void;
  getPlace: () => { address_components?: GoogleAddressComponent[] };
};

function loadGooglePlaces(apiKey: string): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const id = "gmaps-places-script";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps"))
      );
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
}

function partsFromComponents(
  components: GoogleAddressComponent[]
): AddressParts {
  const get = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? "";
  const street = [get("street_number"), get("route")].filter(Boolean).join(" ");
  return {
    address: street,
    suburb: get("locality") || get("postal_town") || get("sublocality"),
    state: get("administrative_area_level_1"),
    country: get("country") || "Australia",
    postcode: get("postal_code"),
  };
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
  const ref = useRef<HTMLInputElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    if (!apiKey || !ref.current) return;
    let widget: GooglePlacesAutocomplete | null = null;
    loadGooglePlaces(apiKey)
      .then(() => {
        if (!ref.current || !window.google?.maps?.places) return;
        widget = new window.google.maps.places.Autocomplete(ref.current, {
          types: ["address"],
          fields: ["address_components"],
        });
        widget.addListener("place_changed", () => {
          const place = widget?.getPlace();
          if (!place?.address_components) return;
          const parts = partsFromComponents(place.address_components);
          onChange(parts.address);
          onSelect?.(parts);
        });
      })
      .catch(() => {
        /* fall back silently to plain text input */
      });
  }, [apiKey, onChange, onSelect]);

  return (
    <Input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="street-address"
    />
  );
}
