/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "@/i18n/routing";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SettingsSidebar } from "@/components/SettingsSidebar";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const { user, loading: authLoading, updateUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !user) router.push("/"); }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const p = await api.getProfile();
        setName(p.name ?? ""); setPhone(p.phone ?? "");
        setAddress(p.address ?? ""); setAvatarUrl(p.avatarUrl);
        setCreatedAt(p.createdAt);
      } catch { toast.error("Failed to load profile"); }
      finally { setLoaded(true); }
    })();
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const { url } = await api.uploadAvatar(file);
      setAvatarUrl(url); toast.success("Photo updated");
    } catch { toast.error("Failed to upload photo"); setAvatarPreview(null); }
    finally { setUploading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name: name.trim() || undefined, phone: phone.trim() || null, avatarUrl, address: address.trim() || null });
      updateUser({ name: updated.name, phone: updated.phone });
      toast.success("Profile saved");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSaving(false); }
  }

  if (authLoading || !loaded) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }
  if (!user) return null;

  const displayAvatar = avatarPreview ?? avatarUrl;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex gap-6 items-start">
          <SettingsSidebar active="profile" />

          <div className="flex-1 min-w-0 space-y-4">
            {/* Avatar card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">{t("avatar")}</h2>
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border border-border" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-border flex items-center justify-center">
                      <span className="text-2xl font-black text-primary">{(user.name?.[0] ?? user.email[0]).toUpperCase()}</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    <Camera className="h-3.5 w-3.5" /> {t("avatar")}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, WEBP · max 5 MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void handleAvatarChange(e)} />
              </div>
            </div>

            {/* Info card */}
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-5">{t("title")}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("email")}</label>
                    <Input value={user.email} disabled className="bg-muted/50 rounded-xl h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("title")}</label>
                    <Input value={user.role === "company" ? "Company" : "Client"} disabled className="bg-muted/50 rounded-xl h-10 capitalize" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("name")}</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="rounded-xl h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t("phone")}</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (777) 000-00-00" className="rounded-xl h-10" />
                  </div>
                </div>
                {user.role === "company" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {t("address")}
                    </label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, street, building" className="rounded-xl h-10" />
                  </div>
                )}
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between">
              {createdAt && (
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(createdAt).toLocaleDateString("en", { year: "numeric", month: "long" })}
                </p>
              )}
              <Button onClick={() => void handleSave()} disabled={saving || uploading} className="rounded-xl px-6">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />{tCommon("loading")}</> : t("saveChanges")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
