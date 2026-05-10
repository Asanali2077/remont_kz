import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-8xl font-black text-primary/20 select-none">404</div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Page not found</h1>
          <p className="text-muted-foreground">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
          <Link href="/repair">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Browse Services
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
