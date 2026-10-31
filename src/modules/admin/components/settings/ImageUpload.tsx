"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "../../icons";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../../constants";
import { useToast } from "../providers/ToastProvider";

export function ImageUpload({
  kind,
  label,
  onUploaded,
  onUploadingChange,
  disabled,
  small,
}: {
  kind: "logo" | "qris";
  label: string;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
  small?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format gambar harus PNG atau JPG.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Ukuran gambar maksimal 2 MB.");
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch(`/admin/pengaturan/upload?kind=${kind}`, {
        method: "POST",
        body,
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        toast.error(result.error ?? "Gagal mengupload gambar.");
        return;
      }
      onUploaded(result.url);
      toast.success("Gambar berhasil diupload. Simpan perubahan untuk menerapkan.");
    } catch {
      toast.error("Gagal mengupload gambar. Coba lagi.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        hidden
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        className={small ? "adm-btn adm-btn-out adm-btn-sm" : "adm-btn adm-btn-out"}
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <Loader2 size={17} className="adm-spin" />
        ) : (
          <Upload size={17} />
        )}
        {uploading ? "Mengupload..." : label}
      </button>
    </>
  );
}
