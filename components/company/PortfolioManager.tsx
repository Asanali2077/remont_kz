"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Upload, Loader2, ImagePlus } from "lucide-react";

type Photo = {
  id: string;
  url: string;
  caption: string | null;
  order: number;
};

export function PortfolioManager({ companyId }: { companyId: string }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const r = await fetch(`/api/portfolio?companyId=${companyId}`);
      setPhotos(await r.json());
    } catch {
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch("/api/portfolio", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: form,
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error ?? "Upload failed");
      }
      toast.success("Photo added");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!user?.token) return;
    setDeletingId(id);
    try {
      const r = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!r.ok) throw new Error("Delete failed");
      toast.success("Photo removed");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{photos.length}/20 photos</p>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl gap-2"
          disabled={uploading || photos.length >= 20}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Add photo"}
        </Button>
        <Input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {photos.length === 0 ? (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-10 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ImagePlus className="h-8 w-8" />
          <p className="text-sm font-medium">Upload your first portfolio photo</p>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden border border-border/50">
              <Image
                src={photo.url}
                alt={photo.caption ?? "Portfolio photo"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5">
                  <p className="text-xs text-white truncate">{photo.caption}</p>
                </div>
              )}
              <button
                onClick={() => void handleDelete(photo.id)}
                disabled={deletingId === photo.id}
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all"
              >
                {deletingId === photo.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
