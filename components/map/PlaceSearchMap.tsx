"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Search,
  MapPin,
  Loader2,
  X,
  AlertCircle,
  KeyRound,
  Crosshair,
  Sparkles,
  Info,
} from "lucide-react";

export interface PlaceSearchValue {
  name?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PlaceSelectedData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface PlaceSearchMapProps {
  /** Selected place value */
  value?: PlaceSearchValue;
  /** Callback fired when a place is selected or marker is adjusted */
  onChange?: (place: PlaceSelectedData) => void;
  /** Mapbox access token (defaults to NEXT_PUBLIC_MAPBOX_TOKEN env var) */
  mapboxToken?: string;
  /** Country code filter for geocoding search (defaults to 'sa' for Saudi Arabia) */
  country?: string;
  /** Geocoding and map language (defaults to 'ar' for Arabic) */
  language?: string;
  /** Default center coordinates [lng, lat] (defaults to Riyadh, Saudi Arabia: [46.6753, 24.7136]) */
  defaultCenter?: [number, number];
  /** Initial zoom level (defaults to 12) */
  initialZoom?: number;
  /** Height of the map container (defaults to '440px') */
  height?: string;
  /** Input placeholder in Arabic */
  placeholder?: string;
  /** Disable user interaction */
  disabled?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Show quick suggestion chips for popular places/cities */
  showQuickPresets?: boolean;
  /** Allow clicking on map to pick coordinates */
  allowMapClick?: boolean;
  /** Additional container CSS class */
  className?: string;
}

interface MapboxFeature {
  id: string;
  text: string;
  place_name: string;
  place_name_ar?: string;
  center: [number, number]; // [lng, lat]
  properties?: {
    address?: string;
  };
}

// Popular Saudi Arabia destinations for quick selection
const SAUDI_PRESETS = [
  { label: "الرياض", query: "الرياض", center: [46.6753, 24.7136] as [number, number] },
  { label: "جدة", query: "جدة", center: [39.1979, 21.5433] as [number, number] },
  { label: "مكة المكرمة", query: "مكة المكرمة", center: [39.8262, 21.3891] as [number, number] },
  { label: "المدينة المنورة", query: "المدينة المنورة", center: [39.6122, 24.5247] as [number, number] },
  { label: "الدمام", query: "الدمام", center: [50.1033, 26.4207] as [number, number] },
  { label: "الخبر", query: "الخبر", center: [50.2084, 26.2818] as [number, number] },
  { label: "حي العليا", query: "حي العليا الرياض", center: [46.6853, 24.6977] as [number, number] },
];

// Popular Egyptian destinations for quick selection
const EGYPT_PRESETS = [
  { label: "القاهرة", query: "القاهرة", center: [31.2357, 30.0444] as [number, number] },
  { label: "الجيزة", query: "الجيزة", center: [31.2089, 30.0131] as [number, number] },
  { label: "الإسكندرية", query: "الإسكندرية", center: [29.9187, 31.2001] as [number, number] },
  { label: "التجمع الخامس", query: "التجمع الخامس القاهرة الجديدة", center: [31.4385, 30.0074] as [number, number] },
  { label: "الشيخ زايد", query: "مدينة الشيخ زايد الجيزة", center: [30.9575, 30.0494] as [number, number] },
  { label: "مدينة نصر", query: "مدينة نصر القاهرة", center: [31.3394, 30.0636] as [number, number] },
  { label: "المنصورة", query: "المنصورة الدقهلية", center: [31.3807, 31.0409] as [number, number] },
];

export default function PlaceSearchMap({
  value,
  onChange,
  mapboxToken: customToken,
  country = "sa",
  language = "ar",
  defaultCenter = [46.6753, 24.7136], // Riyadh, Saudi Arabia
  initialZoom = 12,
  height = "440px",
  placeholder,
  disabled = false,
  readOnly = false,
  showQuickPresets = true,
  allowMapClick = true,
  className = "",
}: PlaceSearchMapProps) {
  const isSaudi = country.toLowerCase() === "sa";
  const activePresets = isSaudi ? SAUDI_PRESETS : EGYPT_PRESETS;
  const resolvedPlaceholder =
    placeholder ||
    (isSaudi
      ? "ابحث عن مكان، حي، أو عنوان في السعودية بالعربية..."
      : "ابحث عن مكان، حي، أو عنوان بالعربية...");
  // Token resolution (prop > env > temporary user input)
  const envToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const [activeToken, setActiveToken] = useState<string>(customToken || envToken);
  const [manualTokenInput, setManualTokenInput] = useState<string>("");
  const [showTokenPrompt, setShowTokenPrompt] = useState<boolean>(!activeToken);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>(value?.name || value?.address || "");
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Active coordinates
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(() => {
    if (
      value?.latitude !== undefined &&
      value?.latitude !== null &&
      value?.longitude !== undefined &&
      value?.longitude !== null &&
      !isNaN(Number(value.latitude)) &&
      !isNaN(Number(value.longitude))
    ) {
      return { lat: Number(value.latitude), lng: Number(value.longitude) };
    }
    return null;
  });

  // Reverse geocoding status
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);

  // Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const markerInstanceRef = useRef<mapboxgl.Marker | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize internal coordinates when external value updates
  useEffect(() => {
    if (
      value?.latitude !== undefined &&
      value?.latitude !== null &&
      value?.longitude !== undefined &&
      value?.longitude !== null &&
      !isNaN(Number(value.latitude)) &&
      !isNaN(Number(value.longitude))
    ) {
      const newLat = Number(value.latitude);
      const newLng = Number(value.longitude);
      setCoordinates((prev) => {
        if (prev?.lat === newLat && prev?.lng === newLng) return prev;
        return { lat: newLat, lng: newLng };
      });
    }
    if (value?.address || value?.name) {
      setSearchQuery(value.name || value.address || "");
    }
  }, [value?.latitude, value?.longitude, value?.name, value?.address]);

  // Handle external token prop change
  useEffect(() => {
    if (customToken) {
      setActiveToken(customToken);
      setShowTokenPrompt(false);
    }
  }, [customToken]);

  // Reverse geocode to get Arabic address when marker is dragged or map is clicked
  const reverseGeocode = useCallback(
    async (lng: number, lat: number) => {
      if (!activeToken) return;
      setIsReverseGeocoding(true);
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${activeToken}&language=${language}&country=${country}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("فشل استرجاع اسم الموقع");
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const topFeature = data.features[0];
          const placeName = topFeature.text || topFeature.place_name || "";
          const fullAddress = topFeature.place_name || placeName;

          setSearchQuery(placeName);

          if (onChange) {
            onChange({
              name: placeName,
              address: fullAddress,
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
            });
          }
        } else if (onChange) {
          onChange({
            name: value?.name || "موقع محدد على الخريطة",
            address: value?.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
          });
        }
      } catch (err) {
        console.error("Reverse geocoding error:", err);
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [activeToken, country, language, onChange, value?.address, value?.name]
  );

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || !activeToken) return;

    mapboxgl.accessToken = activeToken;

    const initialLng = coordinates ? coordinates.lng : defaultCenter[0];
    const initialLat = coordinates ? coordinates.lat : defaultCenter[1];

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [initialLng, initialLat],
        zoom: coordinates ? 14 : initialZoom,
        attributionControl: false,
      });
    } catch (err) {
      console.error("Error creating Mapbox instance:", err);
      return;
    }

    mapInstanceRef.current = map;

    // Add navigation controls (zoom in/out, compass)
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-left");

    // Add scale control
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    // Create marker if coordinates exist
    if (coordinates) {
      const marker = new mapboxgl.Marker({
        color: "#059669", // Emerald-600 to match theme
        draggable: !readOnly && !disabled,
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        const nextCoords = { lat: lngLat.lat, lng: lngLat.lng };
        setCoordinates(nextCoords);
        reverseGeocode(lngLat.lng, lngLat.lat);
      });

      markerInstanceRef.current = marker;
    }

    // Map click handler to place/move marker
    if (allowMapClick && !readOnly && !disabled) {
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        const nextCoords = { lat, lng };
        setCoordinates(nextCoords);

        if (markerInstanceRef.current) {
          markerInstanceRef.current.setLngLat([lng, lat]);
        } else {
          const marker = new mapboxgl.Marker({
            color: "#059669",
            draggable: true,
          })
            .setLngLat([lng, lat])
            .addTo(map);

          marker.on("dragend", () => {
            const pos = marker.getLngLat();
            setCoordinates({ lat: pos.lat, lng: pos.lng });
            reverseGeocode(pos.lng, pos.lat);
          });

          markerInstanceRef.current = marker;
        }

        reverseGeocode(lng, lat);
      });
    }

    return () => {
      if (markerInstanceRef.current) {
        markerInstanceRef.current.remove();
        markerInstanceRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeToken]); // Re-init when token changes

  // Update marker position or create marker when coordinates change
  useEffect(() => {
    if (!mapInstanceRef.current || !coordinates) return;

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLngLat([coordinates.lng, coordinates.lat]);
    } else {
      const marker = new mapboxgl.Marker({
        color: "#059669",
        draggable: !readOnly && !disabled,
      })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(mapInstanceRef.current);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        reverseGeocode(lngLat.lng, lngLat.lat);
      });

      markerInstanceRef.current = marker;
    }
  }, [coordinates, disabled, readOnly, reverseGeocode]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mapbox Geocoding Autocomplete Search
  const fetchPlaces = useCallback(
    async (query: string) => {
      if (!query.trim() || !activeToken) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const encodedQuery = encodeURIComponent(query.trim());
        // Mapbox Places Geocoding API with Arabic language and Egypt country filter
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${activeToken}&language=${language}&country=${country}&autocomplete=true&types=country,region,postcode,district,place,locality,neighborhood,address,poi&limit=7`;

        const res = await fetch(endpoint);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "تعذر إتمام البحث عبر خرائط Mapbox");
        }

        const data = await res.json();
        const features: MapboxFeature[] = data.features || [];
        setSearchResults(features);
        setIsDropdownOpen(true);
        setHighlightedIndex(-1);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "حدث خطأ أثناء البحث";
        console.error("Geocoding search failed:", err);
        setSearchError(message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [activeToken, country, language]
  );

  // Debounce search query input
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchPlaces(val);
    }, 300);
  };

  // Select place from dropdown
  const handleSelectPlace = (feature: MapboxFeature) => {
    const [lng, lat] = feature.center;
    const placeName = feature.text || feature.place_name;
    const fullAddress = feature.place_name || placeName;

    setSearchQuery(placeName);
    setIsDropdownOpen(false);
    setCoordinates({ lat, lng });

    // Fly to location on map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 15,
        essential: true,
        duration: 1600,
      });
    }

    // Trigger parent callback
    if (onChange) {
      onChange({
        name: placeName,
        address: fullAddress,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
      });
    }
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectPlace(searchResults[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  // Quick preset click
  const handlePresetClick = (preset: (typeof EGYPT_PRESETS)[0]) => {
    setSearchQuery(preset.label);
    fetchPlaces(preset.query);
  };

  // Clear search selection
  const handleClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  // Apply manual token input for testing or when env is missing
  const handleApplyToken = () => {
    if (manualTokenInput.trim()) {
      setActiveToken(manualTokenInput.trim());
      setShowTokenPrompt(false);
    }
  };

  // Recenter map on active marker
  const handleRecenter = () => {
    if (mapInstanceRef.current && coordinates) {
      mapInstanceRef.current.flyTo({
        center: [coordinates.lng, coordinates.lat],
        zoom: 15,
        essential: true,
      });
    }
  };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-3 font-sans ${className}`} dir="rtl">
      {/* Missing Token Banner with setup guidance */}
      {(!activeToken || showTokenPrompt) && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-sm space-y-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">رمز وصول Mapbox غير مُعيّن (Mapbox Access Token)</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                لاستخدام الخرائط والبحث الفوري عن الأماكن بالعربية، يُرجى إضافة المفتاح إلى ملف{" "}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">.env</code> باسم{" "}
                <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  NEXT_PUBLIC_MAPBOX_TOKEN
                </code>
                ، أو إدخاله مؤقتاً بالأسفل.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="pk.eyJ1Ijoi..."
              value={manualTokenInput}
              onChange={(e) => setManualTokenInput(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleApplyToken}
              className="px-4 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              تفعيل المفتاح
            </button>
          </div>
        </div>
      )}

      {/* Autocomplete Search Bar */}
      <div className="relative z-30">
        <div className="relative flex items-center">
          <div className="absolute right-3.5 text-gray-400 pointer-events-none">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Search className="w-4 h-4 text-gray-400" />
            )}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleQueryChange}
            onFocus={() => {
              if (searchResults.length > 0) setIsDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled || readOnly || !activeToken}
            placeholder={resolvedPlaceholder}
            className="w-full pr-10 pl-24 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          <div className="absolute left-3 flex items-center gap-1.5">
            {searchQuery && !disabled && !readOnly && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {coordinates && (
              <button
                type="button"
                onClick={handleRecenter}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                title="التركيز على النقطة المحددة"
              >
                <Crosshair className="w-3 h-3 text-emerald-600" />
                <span className="hidden sm:inline">توسيط</span>
              </button>
            )}
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            {searchError ? (
              <div className="p-3 text-xs text-red-600 flex items-center gap-2 bg-red-50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                {isSaudi
                  ? "لم يتم العثور على نتائج مطابقة في المملكة العربية السعودية"
                  : "لم يتم العثور على نتائج مطابقة"}
              </div>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                {searchResults.map((feature, idx) => {
                  const isHighlighted = idx === highlightedIndex;
                  return (
                    <li
                      key={feature.id}
                      onClick={() => handleSelectPlace(feature)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors text-right ${
                        isHighlighted ? "bg-emerald-50 text-emerald-950" : "hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <MapPin
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isHighlighted ? "text-emerald-600" : "text-gray-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {feature.text || feature.place_name}
                        </div>
                        {feature.place_name && feature.place_name !== feature.text && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {feature.place_name}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Quick Location Chips */}
      {showQuickPresets && !disabled && !readOnly && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1 ml-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            أماكن شائعة:
          </span>
          {activePresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-600 border border-gray-200 hover:border-emerald-200 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Map Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-slate-100">
        <div
          ref={mapContainerRef}
          style={{ height }}
          className="w-full relative z-0"
        />

        {/* Map interaction tooltip badge */}
        {!disabled && !readOnly && (
          <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-gray-700 text-[11px] shadow-sm border border-gray-200/80">
              <Info className="w-3 h-3 text-emerald-600" />
              <span>انقر على الخريطة أو اسحب العلامة لتحديد الموقع بدقة</span>
            </div>
          </div>
        )}

        {/* Selected Coordinates Readout Badge */}
        {coordinates && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-xs text-xs font-mono shadow-md border border-gray-200 text-gray-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span dir="ltr">
                {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
              </span>
              {isReverseGeocoding && (
                <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
