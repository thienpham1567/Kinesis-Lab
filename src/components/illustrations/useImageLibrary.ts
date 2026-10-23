"use client";
import { useEffect, useState } from "react";
import { listImages, subscribeLibrary } from "@/lib/illustrations/library";
import type { LibraryImage } from "@/lib/illustrations/catalog";

export function useImageLibrary() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true,
      revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const items = await listImages();
        if (active && current === revision) {
          setImages(items);
          setError("");
        }
      } catch (err) {
        if (active && current === revision)
          setError(
            err instanceof Error ? err.message : "Chưa đọc được thư viện.",
          );
      } finally {
        if (active && current === revision) setLoading(false);
      }
    };
    const off = subscribeLibrary(() => {
      void refresh();
    });
    void refresh();
    return () => {
      active = false;
      off();
    };
  }, []);
  return { images, error, loading };
}
export function useBlobUrl(blob: Blob) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    // Decode the stored raster before displaying it; release the bitmap and URL.
    createImageBitmap(blob)
      .then((bitmap) => {
        bitmap.close();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setUrl("");
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [blob]);
  return url;
}
