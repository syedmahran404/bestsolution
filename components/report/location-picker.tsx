"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  Search,
  Navigation,
  X,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n/provider";

interface LocationValue {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}

interface LocationPickerProps {
  value: LocationValue;
  onChange: (v: LocationValue) => void;
  error?: string;
}

interface Prediction {
  description: string;
  placeId: string;
}

/**
 * Location picker (V2.1). Citizens search an address or tap "Use my location";
 * coordinates are captured silently and an address is shown — never lat/lng.
 * A manual-coordinates fallback is collapsed for power users / offline cases.
 */
export function LocationPicker({
  value,
  onChange,
  error,
}: LocationPickerProps) {
  const t = useT();
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasLocation = value.latitude !== null && value.longitude !== null;

  // Debounced autocomplete.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (query.trim().length < 3) {
      setPredictions([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/geo/autocomplete?q=${encodeURIComponent(query)}`,
          { cache: "no-store" },
        );
        const data = (await res.json()) as { predictions?: Prediction[] };
        setPredictions(data.predictions ?? []);
      } catch {
        setPredictions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [query]);

  async function selectPrediction(p: Prediction) {
    setResolving(true);
    setNotice(null);
    try {
      const res = await fetch(
        `/api/geo/place?placeId=${encodeURIComponent(p.placeId)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        place?: { lat: number; lng: number; formattedAddress: string | null };
      };
      if (data.place) {
        onChange({
          latitude: Number(data.place.lat.toFixed(6)),
          longitude: Number(data.place.lng.toFixed(6)),
          address: data.place.formattedAddress ?? p.description,
        });
        setQuery("");
        setPredictions([]);
      } else {
        setNotice("Couldn't resolve that place. Try another or use GPS.");
      }
    } catch {
      setNotice("Location lookup failed. Try again or use GPS.");
    } finally {
      setResolving(false);
    }
  }

  function useMyLocation() {
    setNotice(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setNotice("Geolocation isn't supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        let address: string | null = null;
        try {
          const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`, {
            cache: "no-store",
          });
          const data = (await res.json()) as {
            address?: { formattedAddress: string | null };
          };
          address = data.address?.formattedAddress ?? null;
        } catch {
          /* keep coords; address optional */
        }
        onChange({ latitude: lat, longitude: lng, address });
        setLocating(false);
      },
      (err) => {
        setNotice(err.message || "Unable to get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function clearLocation() {
    onChange({ latitude: null, longitude: null, address: null });
    setQuery("");
  }

  return (
    <div className="space-y-2">
      <Label>{t("report.location")}</Label>

      {/* Selected location card (address, never coordinates) */}
      {hasLocation ? (
        <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/40 p-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="text-sm">
              <p className="font-medium">
                {value.address ?? "Pinned location"}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("report.locationCaptured")}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLocation}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Change
          </Button>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("report.locationSearchPlaceholder")}
              className="pl-9"
              aria-label={t("report.locationSearchAria")}
            />
            {(searching || resolving) && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {predictions.length > 0 && (
            <ul className="overflow-hidden rounded-md border">
              {predictions.map((p) => (
                <li key={p.placeId}>
                  <button
                    type="button"
                    onClick={() => selectPrediction(p)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {p.description}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useMyLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="mr-1.5 h-4 w-4" />
              )}
              Use my location
            </Button>
            <button
              type="button"
              onClick={() => setManualOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${manualOpen ? "rotate-180" : ""}`}
              />
              Enter coordinates manually
            </button>
          </div>

          {manualOpen && (
            <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/20 p-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("report.latitude")}
                </Label>
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="12.9716"
                  value={value.latitude ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      latitude:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("report.longitude")}
                </Label>
                <Input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  placeholder="77.5946"
                  value={value.longitude ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      longitude:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
        </>
      )}

      {notice && <p className="text-xs text-warning">{notice}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
