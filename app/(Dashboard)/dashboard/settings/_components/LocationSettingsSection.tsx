"use client";

import React, { useState } from "react";
import { LocationData, PlaceSelectedData } from "@/lib/types";
import { APP_URL } from "@/lib/ProjectId";
import { Toast } from "@/app/(Dashboard)/_components/Toast";
import PlaceSearchMap from "@/components/map/PlaceSearchMap";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Save,
  Navigation,
  RotateCcw,
  CheckCircle2,
  Building2,
  Compass,
} from "lucide-react";

interface LocationSettingsSectionProps {
  initialData?: LocationData | null;
  token: string;
}

export default function LocationSettingsSection({
  initialData,
  token,
}: LocationSettingsSectionProps) {
  const [formData, setFormData] = useState<LocationData>({
    name: initialData?.name || "",
    address: initialData?.address || "",
    latitude:
      initialData?.latitude !== undefined && initialData?.latitude !== null
        ? initialData.latitude
        : null,
    longitude:
      initialData?.longitude !== undefined && initialData?.longitude !== null
        ? initialData.longitude
        : null,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] =
    useState<boolean>(false);

  // Handle updates from PlaceSearchMap autocomplete or map clicks
  const handleMapLocationChange = (place: PlaceSelectedData) => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name ? prev.name : place.name,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
    setIsSavedSuccessfully(false);
  };

  // Handle manual input field updates
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "latitude" || name === "longitude"
          ? value === ""
            ? null
            : parseFloat(value)
          : value,
    }));
    setIsSavedSuccessfully(false);
  };

  // Clear coordinates
  const handleClearCoordinates = () => {
    setFormData((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
    }));
    setIsSavedSuccessfully(false);
  };

  // Save location to backend using PUT /api/admin/location
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim() || undefined,
        address: formData.address.trim() || undefined,
        latitude:
          formData.latitude !== null && !isNaN(Number(formData.latitude))
            ? Number(formData.latitude)
            : null,
        longitude:
          formData.longitude !== null && !isNaN(Number(formData.longitude))
            ? Number(formData.longitude)
            : null,
      };

      const res = await fetch(`${APP_URL}/api/admin/location`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        if (json.data) {
          setFormData({
            id: json.data.id,
            name: json.data.name || "",
            address: json.data.address || "",
            latitude: json.data.latitude ?? null,
            longitude: json.data.longitude ?? null,
          });
        }
        setIsSavedSuccessfully(true);
        Toast({
          icon: "success",
          message: "تم حفظ بيانات الموقع الجغرافي بنجاح",
        });
      } else {
        Toast({
          icon: "error",
          message: json.message || "فشل حفظ بيانات الموقع",
        });
      }
    } catch (err: unknown) {
      console.error("Location update failed:", err);
      const errorMsg =
        err instanceof Error ? err.message : "حدث خطأ في الاتصال بالخادم";
      Toast({
        icon: "error",
        message: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {/* Location Card */}
      <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                الموقع الجغرافي والفرع الرئيسي
              </h2>
              <p className="text-xs text-gray-500">
                ابحث باللغة العربية عن المكان وحدد موقعه بدقة على الخريطة ليظهر
                في واجهة الموقع
              </p>
            </div>
          </div>

          {isSavedSuccessfully && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>تم الحفظ</span>
            </div>
          )}
        </div>

        {/* Map + Autocomplete Search Component */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>البحث عن مكان / تحديد النقطة على الخريطة</span>
            </label>
            {formData.latitude !== null && formData.longitude !== null && (
              <span className="text-xs text-gray-400">
                محدد: {formData.latitude.toFixed(4)},{" "}
                {formData.longitude.toFixed(4)}
              </span>
            )}
          </div>

          <PlaceSearchMap
            value={{
              name: formData.name,
              address: formData.address,
              latitude: formData.latitude,
              longitude: formData.longitude,
            }}
            onChange={handleMapLocationChange}
            country="sa"
            language="ar"
            defaultCenter={[46.6753, 24.7136]}
            placeholder="ابحث عن مكان، حي، أو عنوان في السعودية بالعربية..."
            disabled={isLoading}
            height="420px"
          />
        </div>

        {/* Form Inputs (Name, Address, Lat, Lng) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Location Name */}
          <div className="space-y-2">
            <label
              htmlFor="locationName"
              className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>اسم المقر أو الفرع</span>
            </label>
            <Input
              id="locationName"
              name="name"
              placeholder="مثال: المقر الرئيسي - الرياض"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="text-sm"
            />
            <p className="text-[11px] text-gray-400">
              الاسم التوضيحي الذي سيظهر للزوار في واجهة الموقع أو التذييل.
            </p>
          </div>

          {/* Detailed Address */}
          <div className="space-y-2">
            <label
              htmlFor="locationAddress"
              className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-gray-400" />
              <span>العنوان التفصيلي</span>
            </label>
            <Textarea
              id="locationAddress"
              name="address"
              placeholder="مثال: طريق الملك فهد، حي العليا، الرياض، المملكة العربية السعودية"
              value={formData.address}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Latitude */}
          <div className="space-y-2">
            <label
              htmlFor="latitude"
              className="block text-sm font-semibold text-gray-700">
              خط العرض (Latitude)
            </label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              dir="ltr"
              placeholder="مثال: 24.7136"
              value={formData.latitude !== null ? formData.latitude : ""}
              onChange={handleInputChange}
              disabled={isLoading}
              className="text-sm font-mono text-left"
            />
            <p className="text-[11px] text-gray-400">
              قيمة رقمية بين -90 و 90 درجة.
            </p>
          </div>

          {/* Longitude */}
          <div className="space-y-2">
            <label
              htmlFor="longitude"
              className="block text-sm font-semibold text-gray-700">
              خط الطول (Longitude)
            </label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              dir="ltr"
              placeholder="مثال: 46.6753"
              value={formData.longitude !== null ? formData.longitude : ""}
              onChange={handleInputChange}
              disabled={isLoading}
              className="text-sm font-mono text-left"
            />
            <p className="text-[11px] text-gray-400">
              قيمة رقمية بين -180 و 180 درجة.
            </p>
          </div>
        </div>

        {/* Clear coordinates button */}
        {(formData.latitude !== null || formData.longitude !== null) && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClearCoordinates}
              disabled={isLoading}
              className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء الإحداثيات المحددة</span>
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-start">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-6 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg cursor-pointer">
          <Save className="w-5 h-5" />
          {isLoading ? "جاري الحفظ..." : "حفظ بيانات الموقع"}
        </Button>
      </div>
    </form>
  );
}
