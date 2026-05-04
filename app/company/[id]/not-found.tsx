import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function CompanyNotFound() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 text-center bg-muted/30">
      <div className="space-y-5 max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="text-6xl font-black text-primary/20 select-none">404</div>
        <div>
          <h1 className="text-xl font-bold mb-1">Company not found</h1>
          <p className="text-sm text-muted-foreground">
            This company doesn&apos;t exist or may have been removed.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/companies"><Button className="rounded-xl">Browse Companies</Button></Link>
          <Link href="/repair"><Button variant="outline" className="rounded-xl">View Services</Button></Link>
        </div>
      </div>
    </div>
  );
}
