import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ServiceCategory, UserRole, RequestStatus } from "@prisma/client";
import { Pool } from "pg";
import { hashPassword } from "../lib/auth";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const COMPANY_EMAILS = [
  "stroymast@remont.kz",
  "autocity@remont.kz",
  "electroserv@remont.kz",
  "plumbing@remont.kz",
  "cleanpro@remont.kz",
];
const CLIENT_EMAILS = [
  "asel@remont.kz",
  "dmitry@remont.kz",
  "zarina@remont.kz",
  "arman@remont.kz",
];

async function main() {
  console.log("🌱 Seeding database…");

  /* ── Clean slate ── */
  await prisma.message.deleteMany({});
  await prisma.requestOffer.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.serviceImage.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: [...COMPANY_EMAILS, ...CLIENT_EMAILS] } } });

  const pw = await hashPassword("password123");

  /* ── Companies ── */
  const companies = await Promise.all([
    prisma.user.create({ data: { email: "stroymast@remont.kz", password: pw, role: UserRole.COMPANY, name: "StroiMaster", phone: "+7 701 100 1001", address: "Almaty, Abay 10", emailVerified: true } }),
    prisma.user.create({ data: { email: "autocity@remont.kz",  password: pw, role: UserRole.COMPANY, name: "AutoCity KZ",  phone: "+7 701 100 1002", address: "Astana, Saryarka 5",  emailVerified: true } }),
    prisma.user.create({ data: { email: "electroserv@remont.kz", password: pw, role: UserRole.COMPANY, name: "ElectroServ", phone: "+7 701 100 1003", address: "Almaty, Dostyk 22",  emailVerified: true } }),
    prisma.user.create({ data: { email: "plumbing@remont.kz",  password: pw, role: UserRole.COMPANY, name: "PlumbingKZ",  phone: "+7 701 100 1004", address: "Astana, Kerey 8",    emailVerified: true } }),
    prisma.user.create({ data: { email: "cleanpro@remont.kz",  password: pw, role: UserRole.COMPANY, name: "CleanPro",    phone: "+7 701 100 1005", address: "Almaty, Tole bi 30", emailVerified: true } }),
  ]);

  /* ── Clients ── */
  const clients = await Promise.all([
    prisma.user.create({ data: { email: "asel@remont.kz",   password: pw, role: UserRole.CLIENT, name: "Asel M.",   phone: "+7 705 200 0001", emailVerified: true } }),
    prisma.user.create({ data: { email: "dmitry@remont.kz", password: pw, role: UserRole.CLIENT, name: "Dmitry K.", phone: "+7 705 200 0002", emailVerified: true } }),
    prisma.user.create({ data: { email: "zarina@remont.kz", password: pw, role: UserRole.CLIENT, name: "Zarina T.", phone: "+7 705 200 0003", emailVerified: true } }),
    prisma.user.create({ data: { email: "arman@remont.kz",  password: pw, role: UserRole.CLIENT, name: "Arman S.",  phone: "+7 705 200 0004", emailVerified: true } }),
  ]);

  const [stroymast, autocity, electroserv, plumbing, cleanpro] = companies;
  const [asel, dmitry, zarina, arman] = clients;

  /* ── Services ── */
  const services = await Promise.all([
    // StroiMaster — Real Estate
    prisma.service.create({
      data: {
        name: "Apartment renovation (turnkey)",
        category: ServiceCategory.REAL_ESTATE,
        description: "Full apartment renovation: design, demolition, rough and finish work, plumbing, electrical, flooring, painting. We work with all types of apartments in Almaty. Free estimate on-site.",
        priceFrom: 150000, priceTo: 800000, city: "Almaty", address: "Almaty, Abay 10",
        rating: 4.8, active: true, companyId: stroymast.id,
        tags: ["renovation", "turnkey", "design", "plumbing"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", order: 0 },
          { url: "https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=800&q=80", order: 1 },
        ]},
      },
    }),
    prisma.service.create({
      data: {
        name: "Bathroom renovation",
        category: ServiceCategory.REAL_ESTATE,
        description: "Complete bathroom renovation: tile work, plumbing fixtures replacement, waterproofing, ventilation. Work in Almaty and surrounding areas. 1-year warranty on all work.",
        priceFrom: 80000, priceTo: 300000, city: "Almaty", address: "Almaty, Abay 10",
        rating: 4.9, active: true, companyId: stroymast.id,
        tags: ["bathroom", "tiles", "plumbing", "waterproofing"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80", order: 0 },
        ]},
      },
    }),
    // AutoCity — Automobiles
    prisma.service.create({
      data: {
        name: "Auto body repair & painting",
        category: ServiceCategory.AUTOMOBILES,
        description: "Professional body repair of any complexity: dents, scratches, corrosion removal, full or partial painting. Color matching guarantee. Working with all car makes.",
        priceFrom: 30000, priceTo: 500000, city: "Astana", address: "Astana, Saryarka 5",
        rating: 4.7, active: true, companyId: autocity.id,
        tags: ["body repair", "painting", "dents", "scratches"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80", order: 0 },
          { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", order: 1 },
        ]},
      },
    }),
    prisma.service.create({
      data: {
        name: "Engine diagnostics & repair",
        category: ServiceCategory.AUTOMOBILES,
        description: "Computer diagnostics of any car brand. Engine repair, transmission service, suspension check. Experienced mechanics, original and quality parts. Quick turnaround.",
        priceFrom: 15000, priceTo: 200000, city: "Astana", address: "Astana, Saryarka 5",
        rating: 4.6, active: true, companyId: autocity.id,
        tags: ["diagnostics", "engine", "transmission", "suspension"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", order: 0 },
        ]},
      },
    }),
    // ElectroServ — Other
    prisma.service.create({
      data: {
        name: "Electrical wiring installation",
        category: ServiceCategory.OTHER,
        description: "Installation and replacement of electrical wiring in apartments, houses and offices. Switchboard installation, socket and light fitting, grounding. All work done to code with documentation.",
        priceFrom: 50000, priceTo: 400000, city: "Almaty", address: "Almaty, Dostyk 22",
        rating: 4.9, active: true, companyId: electroserv.id,
        tags: ["electrical", "wiring", "switchboard", "sockets"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80", order: 0 },
        ]},
      },
    }),
    prisma.service.create({
      data: {
        name: "Appliance repair (washing machines, refrigerators)",
        category: ServiceCategory.OTHER,
        description: "On-site repair of washing machines, refrigerators, dishwashers, microwaves. Diagnostics within the day. Genuine parts. 6-month warranty on repairs.",
        priceFrom: 8000, priceTo: 60000, city: "Almaty",
        rating: 4.5, active: true, companyId: electroserv.id,
        tags: ["appliances", "washing machine", "refrigerator", "on-site repair"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80", order: 0 },
        ]},
      },
    }),
    // PlumbingKZ
    prisma.service.create({
      data: {
        name: "Plumbing repair & installation",
        category: ServiceCategory.REAL_ESTATE,
        description: "Emergency and planned plumbing: pipe replacement, faucet repair, toilet installation, water heater connection. Available 24/7 for emergencies. Serving all districts of Astana.",
        priceFrom: 10000, priceTo: 150000, city: "Astana", address: "Astana, Kerey 8",
        rating: 4.7, active: true, companyId: plumbing.id,
        tags: ["plumbing", "pipes", "toilet", "water heater", "emergency"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80", order: 0 },
        ]},
      },
    }),
    // CleanPro
    prisma.service.create({
      data: {
        name: "Post-construction cleaning",
        category: ServiceCategory.OTHER,
        description: "Professional cleaning after renovation: removal of dust, construction debris, cement residue from windows and floors. Work with industrial equipment. Eco-friendly products. Result guaranteed.",
        priceFrom: 20000, priceTo: 120000, city: "Almaty", address: "Almaty, Tole bi 30",
        rating: 4.8, active: true, companyId: cleanpro.id,
        tags: ["cleaning", "post-renovation", "deep clean"],
        images: { create: [
          { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80", order: 0 },
        ]},
      },
    }),
  ]);

  const [svcRenovation, svcBathroom, svcBody, svcEngine, svcElectric, svcAppliance, svcPlumbing, svcCleaning] = services;

  /* ── Requests (completed with reviews) ── */
  const req1 = await prisma.request.create({
    data: {
      clientId: asel.id, serviceId: svcRenovation.id, companyId: stroymast.id,
      description: "Need full renovation of 2-bedroom apartment, ~60 sqm. Demolition + rough work + finish. Budget is flexible for quality work.",
      category: ServiceCategory.REAL_ESTATE, city: "Almaty", status: RequestStatus.COMPLETED,
      budgetFrom: 400000, budgetTo: 700000,
      rating: 5, review: "Excellent work! StroiMaster team did a fantastic job on our apartment. Clean, on time, and the quality exceeded expectations. Highly recommend!",
      companyReply: "Thank you so much, Asel! It was a pleasure working on your apartment. We wish you many happy years in your new home!",
    },
  });

  const req2 = await prisma.request.create({
    data: {
      clientId: dmitry.id, serviceId: svcBody.id, companyId: autocity.id,
      description: "My Toyota Camry has a large dent on the front bumper and scratches on the driver door. Need body repair and spot painting.",
      category: ServiceCategory.AUTOMOBILES, city: "Astana", status: RequestStatus.COMPLETED,
      budgetFrom: 50000, budgetTo: 150000,
      rating: 5, review: "AutoCity did an amazing job. The car looks brand new, you can't even tell where the dent was. Fair price and quick turnaround — 3 days instead of the quoted 5.",
    },
  });

  const req3 = await prisma.request.create({
    data: {
      clientId: zarina.id, serviceId: svcElectric.id, companyId: electroserv.id,
      description: "Complete rewiring of a 3-room apartment. Old wiring needs full replacement, new switchboard, install 15 outlets and 8 light points.",
      category: ServiceCategory.OTHER, city: "Almaty", status: RequestStatus.COMPLETED,
      budgetFrom: 150000, budgetTo: 300000,
      rating: 4, review: "Good work, everything done neatly. Took slightly longer than planned but the quality is excellent. All certificates provided.",
    },
  });

  const req4 = await prisma.request.create({
    data: {
      clientId: arman.id, serviceId: svcPlumbing.id, companyId: plumbing.id,
      description: "Emergency call — burst pipe in bathroom. Need immediate repair.",
      category: ServiceCategory.REAL_ESTATE, city: "Astana", status: RequestStatus.COMPLETED,
      rating: 5, review: "They arrived within 40 minutes at midnight! Fixed everything quickly and cleanly. Real professionals. Will only call PlumbingKZ going forward.",
      companyReply: "Thank you Arman! Emergency calls are our specialty. We're glad we could help quickly!",
    },
  });

  /* ── Active requests (in progress / new) ── */
  const req5 = await prisma.request.create({
    data: {
      clientId: asel.id, serviceId: svcBathroom.id, companyId: stroymast.id,
      description: "Bathroom renovation: replace all tiles, new shower, toilet and sink. Approximately 5 sqm.",
      category: ServiceCategory.REAL_ESTATE, city: "Almaty",
      status: RequestStatus.IN_PROGRESS, budgetFrom: 120000, budgetTo: 250000,
    },
  });

  const req6 = await prisma.request.create({
    data: {
      clientId: dmitry.id,
      description: "Need appliance repair — washing machine Bosch Serie 4 doesn't spin, error E18.",
      category: ServiceCategory.OTHER, city: "Almaty",
      status: RequestStatus.NEW, budgetFrom: 15000, budgetTo: 40000,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  /* ── Update service ratings based on reviews ── */
  await prisma.service.update({ where: { id: svcRenovation.id }, data: { rating: 4.8 } });
  await prisma.service.update({ where: { id: svcBody.id }, data: { rating: 4.9 } });
  await prisma.service.update({ where: { id: svcElectric.id }, data: { rating: 4.7 } });
  await prisma.service.update({ where: { id: svcPlumbing.id }, data: { rating: 4.9 } });

  /* ── Chat messages for active request ── */
  await prisma.message.createMany({
    data: [
      { requestId: req5.id, senderId: stroymast.id, receiverId: asel.id, content: "Hello Asel! We've started work on your bathroom. Tiles have been removed, starting waterproofing tomorrow." },
      { requestId: req5.id, senderId: asel.id, receiverId: stroymast.id, content: "Great, thank you! Can we choose the new tiles this week?" },
      { requestId: req5.id, senderId: stroymast.id, receiverId: asel.id, content: "Of course! We can visit the showroom on Thursday at 11:00. Does that work?" },
    ],
  });

  /* ── Admin account ── */
  await prisma.user.upsert({
    where: { email: "admin@remont.kz" },
    update: {},
    create: {
      email: "admin@remont.kz",
      password: await hashPassword("Admin123!"),
      role: "ADMIN",
      name: "Admin",
      emailVerified: true,
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Companies: ${companies.length}`);
  console.log(`   Clients:   ${clients.length}`);
  console.log(`   Services:  ${services.length}`);
  console.log(`   Requests:  6 (4 completed, 1 in-progress, 1 new)`);
  console.log("\nDemo accounts (password: password123):");
  console.log("  Company: stroymast@remont.kz");
  console.log("  Company: autocity@remont.kz");
  console.log("  Client:  asel@remont.kz");
  console.log("  Client:  dmitry@remont.kz");
  console.log("  Admin:   admin@remont.kz  (password: Admin123!)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
