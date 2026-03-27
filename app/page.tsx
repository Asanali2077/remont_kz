"use client";

import { Footer } from "@/components/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  MessageSquare,
  Search,
  ClipboardList,
  Car,
  Home,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const isCompany = user?.role === "company";
  const catalogHref = isCompany ? "/company/catalog" : "/repair";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <main className="mx-auto max-w-6xl px-4">

        {/* Hero */}
        <section className="py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find a master or company<br className="hidden md:block" /> for any repair
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Automobiles, real estate, appliances — hundreds of verified service providers
            in your city. Submit a request and get a direct response.
          </p>
          <Link href={catalogHref}>
            <Button size="lg" className="px-10 text-base">
              Open catalog
            </Button>
          </Link>
        </section>

        {/* Popular categories */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Popular categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {isCompany ? (
              <>
                <Card className="opacity-50 cursor-not-allowed h-full">
                  <CardHeader className="text-center">
                    <Car className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">Automobiles</CardTitle>
                    <CardDescription>
                      Repair, maintenance, detailing, tuning, and diagnostics
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="opacity-50 cursor-not-allowed h-full">
                  <CardHeader className="text-center">
                    <Home className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">Real Estate</CardTitle>
                    <CardDescription>
                      Apartment renovation, plumbing, electrical, cleaning, and moving
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="opacity-50 cursor-not-allowed h-full">
                  <CardHeader className="text-center">
                    <Wrench className="h-10 w-10 mx-auto text-primary mb-2" />
                    <CardTitle className="text-lg">Other</CardTitle>
                    <CardDescription>
                      Gadgets, appliances, furniture, clothing, and any other repair
                    </CardDescription>
                  </CardHeader>
                </Card>
              </>
            ) : (
              <>
                <Link href="/repair?category=AUTOMOBILES">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="text-center">
                      <Car className="h-10 w-10 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">Automobiles</CardTitle>
                      <CardDescription>
                        Repair, maintenance, detailing, tuning, and diagnostics
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/repair?category=REAL_ESTATE">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="text-center">
                      <Home className="h-10 w-10 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">Real Estate</CardTitle>
                      <CardDescription>
                        Apartment renovation, plumbing, electrical, cleaning, and moving
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/repair?category=OTHER">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="text-center">
                      <Wrench className="h-10 w-10 mx-auto text-primary mb-2" />
                      <CardTitle className="text-lg">Other</CardTitle>
                      <CardDescription>
                        Gadgets, appliances, furniture, clothing, and any other repair
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* For clients */}
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">For clients</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Find a service</div>
                    <div className="text-sm text-muted-foreground">
                      Use filters by category, city, and price
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Submit a request</div>
                    <div className="text-sm text-muted-foreground">
                      Describe your task — the company will respond directly
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Chat and track status</div>
                    <div className="text-sm text-muted-foreground">
                      Chat with the company and track work stages
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* For companies */}
            <div className="bg-muted/30 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">For companies</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Register as a company</div>
                    <div className="text-sm text-muted-foreground">
                      Create a profile and add your services
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Receive client requests</div>
                    <div className="text-sm text-muted-foreground">
                      Browse the request catalog and accept suitable ones
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">Chat and complete work</div>
                    <div className="text-sm text-muted-foreground">
                      Chat with the client and manage request statuses
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="pb-16">
          <div className="bg-muted/30 rounded-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">15+</div>
                <div className="text-sm text-muted-foreground mt-1">Cities</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground mt-1">Companies</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground mt-1">Services</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.7</div>
                <div className="text-sm text-muted-foreground mt-1">Average rating</div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
