import { Button } from "@/components/ui/button";
import { Home, Building2, Phone, Car, Package } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Building2 className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Remont.kz</h1>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/automobiles">
              <Button variant="ghost" className="gap-2">
                <Car className="h-4 w-4" />
                Авто
              </Button>
            </Link>
            <Link href="/real-estate">
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Недвижимость
              </Button>
            </Link>
            <Link href="/other">
              <Button variant="ghost" className="gap-2">
                <Package className="h-4 w-4" />
                Другое
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="ghost" className="gap-2">
                <Phone className="h-4 w-4" />
                Контакты
              </Button>
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link href="/favorites" className="text-sm hover:underline">Избранное</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
