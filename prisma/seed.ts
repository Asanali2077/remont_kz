import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ServiceCategory,
  UserRole,
} from "@prisma/client";
import { Pool } from "pg";
import { hashPassword } from "../lib/auth";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  console.log("Starting seed...");

  const seedEmails = [
    "stroymast@remont.kz",
    "autocity@remont.kz",
    "cleanpro@remont.kz",
    "electroserv@remont.kz",
    "plumbing@remont.kz",
  ];

  await prisma.message.deleteMany({
    where: {
      OR: [
        { sender: { email: { in: seedEmails } } },
        { receiver: { email: { in: seedEmails } } },
      ],
    },
  });

  await prisma.request.deleteMany({
    where: {
      OR: [
        { client: { email: { in: seedEmails } } },
        { company: { email: { in: seedEmails } } },
      ],
    },
  });

  await prisma.serviceImage.deleteMany({
    where: {
      service: { company: { email: { in: seedEmails } } },
    },
  });

  await prisma.service.deleteMany({
    where: {
      company: { email: { in: seedEmails } },
    },
  });

  const password = await hashPassword("Company123!");

  const stroymast = await prisma.user.upsert({
    where: { email: "stroymast@remont.kz" },
    update: {},
    create: {
      email: "stroymast@remont.kz",
      password,
      role: UserRole.COMPANY,
      name: "СтройМастер KZ",
      phone: "+7 727 210 55 44",
    },
  });

  const autocity = await prisma.user.upsert({
    where: { email: "autocity@remont.kz" },
    update: {},
    create: {
      email: "autocity@remont.kz",
      password,
      role: UserRole.COMPANY,
      name: "AutoCity",
      phone: "+7 717 330 77 11",
    },
  });

  const cleanpro = await prisma.user.upsert({
    where: { email: "cleanpro@remont.kz" },
    update: {},
    create: {
      email: "cleanpro@remont.kz",
      password,
      role: UserRole.COMPANY,
      name: "CleanPro",
      phone: "+7 725 440 88 22",
    },
  });

  const electroserv = await prisma.user.upsert({
    where: { email: "electroserv@remont.kz" },
    update: {},
    create: {
      email: "electroserv@remont.kz",
      password,
      role: UserRole.COMPANY,
      name: "ЭлектроСервис",
      phone: "+7 721 550 99 33",
    },
  });

  const plumbing = await prisma.user.upsert({
    where: { email: "plumbing@remont.kz" },
    update: {},
    create: {
      email: "plumbing@remont.kz",
      password,
      role: UserRole.COMPANY,
      name: "АкваМастер",
      phone: "+7 727 660 11 44",
    },
  });

  console.log("Companies ready");

  const servicesData = [
    // СтройМастер KZ
    {
      companyId: stroymast.id,
      name: "Apartment renovation turnkey",
      category: ServiceCategory.REAL_ESTATE,
      description:
        "Full apartment renovation: demolition, levelling, electrical, plumbing, finishing, and furnishing. Fixed-price contract with warranty.",
      priceFrom: 250000,
      priceTo: 800000,
      city: "Almaty",
      rating: 4.9,
      licensed: true,
      availabilityDays: 14,
      urgency: "medium",
      tags: ["warranty", "contract", "turnkey", "finishing"],
      customAttributes: { warranty: "24 months", payment: "30% prepayment" },
      images: [
        "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136",
        "https://images.unsplash.com/photo-1560185007-cde436f6a4d0",
      ],
    },
    {
      companyId: stroymast.id,
      name: "Tile and flooring installation",
      category: ServiceCategory.REAL_ESTATE,
      description:
        "Professional tile laying for bathroom, kitchen, and hallway. Large format tiles, heated floor systems, grouting.",
      priceFrom: 80000,
      priceTo: 200000,
      city: "Almaty",
      rating: 4.7,
      licensed: true,
      availabilityDays: 5,
      urgency: "medium",
      tags: ["tile", "flooring", "bathroom", "warranty"],
      customAttributes: { grout: "Mapei", levelling: "Self-levelling compound" },
      images: [
        "https://images.unsplash.com/photo-1615529162924-f8605388461d",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
      ],
    },
    // AutoCity
    {
      companyId: autocity.id,
      name: "Car diagnostics and service",
      category: ServiceCategory.AUTOMOBILES,
      description:
        "Full computer diagnostics, oil change, filters, spark plugs, and suspension check. All car makes and models.",
      priceFrom: 15000,
      priceTo: 50000,
      city: "Astana",
      rating: 4.8,
      licensed: true,
      availabilityDays: 2,
      urgency: "high",
      tags: ["diagnostics", "oil change", "warranty", "OEM parts"],
      customAttributes: { parts: "OEM / original", warranty: "6 months" },
      images: [
        "https://images.unsplash.com/photo-1625047509168-a7026f36de04",
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3",
      ],
    },
    {
      companyId: autocity.id,
      name: "Body repair and painting",
      category: ServiceCategory.AUTOMOBILES,
      description:
        "Dent removal, panel replacement, and full or partial repainting. Computer colour matching, guaranteed colour uniformity.",
      priceFrom: 60000,
      priceTo: 300000,
      city: "Astana",
      rating: 4.6,
      licensed: true,
      availabilityDays: 7,
      urgency: "medium",
      tags: ["body repair", "painting", "dent removal", "warranty"],
      customAttributes: { colour: "Computer matching", warranty: "12 months" },
      images: [
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
      ],
    },
    // CleanPro
    {
      companyId: cleanpro.id,
      name: "Deep apartment cleaning",
      category: ServiceCategory.OTHER,
      description:
        "General cleaning: washing windows, cleaning appliances inside and out, sanitising bathroom, mopping, and removing stubborn stains.",
      priceFrom: 20000,
      priceTo: 60000,
      city: "Shymkent",
      rating: 4.7,
      licensed: false,
      availabilityDays: 1,
      urgency: "high",
      tags: ["deep cleaning", "eco products", "fast arrival"],
      customAttributes: { crew: "2–3 people", products: "Eco-friendly" },
      images: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac",
      ],
    },
    {
      companyId: cleanpro.id,
      name: "Dry cleaning of furniture and carpets",
      category: ServiceCategory.OTHER,
      description:
        "Professional dry cleaning of sofas, armchairs, mattresses, and carpets. Removes stains and odours, quick drying.",
      priceFrom: 15000,
      priceTo: 45000,
      city: "Shymkent",
      rating: 4.5,
      licensed: false,
      availabilityDays: 2,
      urgency: "medium",
      tags: ["dry cleaning", "upholstery", "carpet", "odour removal"],
      customAttributes: { drying: "2–4 hours", stain: "Any stains" },
      images: [
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c",
      ],
    },
    // ЭлектроСервис
    {
      companyId: electroserv.id,
      name: "Electrical wiring in apartment",
      category: ServiceCategory.REAL_ESTATE,
      description:
        "Complete replacement or partial upgrade of electrical wiring, installation of sockets, breakers, and distribution boards. Licensed specialists.",
      priceFrom: 50000,
      priceTo: 180000,
      city: "Karaganda",
      rating: 4.8,
      licensed: true,
      availabilityDays: 5,
      urgency: "medium",
      tags: ["electrical", "wiring", "licensed", "warranty"],
      customAttributes: { licence: "State licensed", warranty: "18 months" },
      images: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
      ],
    },
    {
      companyId: electroserv.id,
      name: "Smart home installation",
      category: ServiceCategory.OTHER,
      description:
        "Turnkey smart home: lighting control, smart sockets, security cameras, alarm, and app integration.",
      priceFrom: 100000,
      priceTo: 400000,
      city: "Karaganda",
      rating: 4.6,
      licensed: true,
      availabilityDays: 10,
      urgency: "low",
      tags: ["smart home", "automation", "security", "warranty"],
      customAttributes: { system: "Tuya / Google Home / Yandex", warranty: "12 months" },
      images: [
        "https://images.unsplash.com/photo-1558002038-1055907df827",
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd",
      ],
    },
    // АкваМастер
    {
      companyId: plumbing.id,
      name: "Pipe and plumbing replacement",
      category: ServiceCategory.REAL_ESTATE,
      description:
        "Replacing old pipes with modern polypropylene or copper, installing toilets, sinks, showers, and bathtubs. All work comes with warranty.",
      priceFrom: 30000,
      priceTo: 150000,
      city: "Almaty",
      rating: 4.7,
      licensed: true,
      availabilityDays: 3,
      urgency: "high",
      tags: ["plumbing", "pipes", "bathroom", "warranty"],
      customAttributes: { material: "PPR / copper", warranty: "12 months" },
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd",
      ],
    },
    {
      companyId: plumbing.id,
      name: "Water heater installation",
      category: ServiceCategory.OTHER,
      description:
        "Installation and connection of storage or flow-through water heaters. Any brands, fast installation on the same day.",
      priceFrom: 20000,
      priceTo: 60000,
      city: "Almaty",
      rating: 4.5,
      licensed: false,
      availabilityDays: 1,
      urgency: "high",
      tags: ["water heater", "fast arrival", "any brand"],
      customAttributes: { type: "Storage / flow-through", visit: "Same day" },
      images: [
        "https://images.unsplash.com/photo-1585771724684-38269d6639fd",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a",
      ],
    },
  ];

  for (const item of servicesData) {
    await prisma.service.create({
      data: {
        name: item.name,
        category: item.category,
        description: item.description,
        priceFrom: item.priceFrom,
        priceTo: item.priceTo,
        city: item.city,
        rating: item.rating,
        licensed: item.licensed,
        availabilityDays: item.availabilityDays,
        urgency: item.urgency,
        tags: item.tags,
        customAttributes: item.customAttributes,
        companyId: item.companyId,
        images: {
          create: item.images.map((url, order) => ({ url, order })),
        },
      },
    });
  }

  console.log("Services seeded (10 total)");
  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
