"use client";

import { Footer } from "@/components/Footer";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { ORGS } from "@/lib/data";
import { OrgCard } from "@/components/OrgCard";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const ids = Array.from(favorites.values());
  const list = ORGS.filter((o) => ids.includes(o.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Избранное</h1>
        <p className="text-muted-foreground mb-6">Сохраненные исполнители</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((org) => (
            <OrgCard key={org.id} org={org} />
          ))}
        </div>
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">У вас пока нет избранных карточек.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}


