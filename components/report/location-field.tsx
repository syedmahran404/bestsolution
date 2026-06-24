"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationFieldProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  error?: string;
}

/**
 * Location capture: one-tap browser Geolocation with manual lat/lng inputs as
 * a fallback (per Phase 2 spec). Coordinates are lifted to the parent form.
 */
export function LocationField({
  latitude,
  longitude,
  onChange,
  error,
}: LocationFieldProps) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function detect() {
    setGeoError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6)),
        );
        setLocating(false);
      },
      (err) => {
        setGeoError(err.message || "Unable to retrieve your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Location</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={detect}
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="mr-1.5 h-4 w-4" />
          )}
          Use my location
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="latitude" className="text-xs text-muted-foreground">
            Latitude
          </Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="e.g. 12.9716"
            value={latitude ?? ""}
            onChange={(e) =>
              onChange(
                e.target.value === "" ? null : Number(e.target.value),
                longitude,
              )
            }
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="longitude" className="text-xs text-muted-foreground">
            Longitude
          </Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            inputMode="decimal"
            placeholder="e.g. 77.5946"
            value={longitude ?? ""}
            onChange={(e) =>
              onChange(
                latitude,
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </div>
      </div>

      {geoError && <p className="text-xs text-destructive">{geoError}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
