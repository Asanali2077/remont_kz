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
  "kazweld@remont.kz",
  "roofpro@remont.kz",
  "paintmaster@remont.kz",
  "renovkz@remont.kz",
  "techmaster@remont.kz",
];
const CLIENT_EMAILS = [
  "asel@remont.kz",
  "dmitry@remont.kz",
  "zarina@remont.kz",
  "arman@remont.kz",
  "aibek@remont.kz",
  "nurgul@remont.kz",
];

async function main() {
  console.log("🌱 Seeding database…");

  await prisma.message.deleteMany({});
  await prisma.requestOffer.deleteMany({});
  await prisma.request.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.serviceImage.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.user.deleteMany({ where: { email: { in: [...COMPANY_EMAILS, ...CLIENT_EMAILS] } } });

  const pw = await hashPassword("password123");

  /* ── Companies (all 10 categories covered) ── */
  const companies = await Promise.all([
    // REAL_ESTATE
    prisma.user.create({ data: { email: "stroymast@remont.kz",   password: pw, role: UserRole.COMPANY, name: "StroiMaster",    phone: "+7 701 100 1001", address: "Almaty, Abay 10",        emailVerified: true } }),
    // AUTOMOBILES
    prisma.user.create({ data: { email: "autocity@remont.kz",    password: pw, role: UserRole.COMPANY, name: "AutoCity KZ",    phone: "+7 701 100 1002", address: "Astana, Saryarka 5",     emailVerified: true } }),
    // ELECTRICAL
    prisma.user.create({ data: { email: "electroserv@remont.kz", password: pw, role: UserRole.COMPANY, name: "ElectroServ",    phone: "+7 701 100 1003", address: "Almaty, Dostyk 22",      emailVerified: true } }),
    // PLUMBING
    prisma.user.create({ data: { email: "plumbing@remont.kz",    password: pw, role: UserRole.COMPANY, name: "PlumbingKZ",     phone: "+7 701 100 1004", address: "Astana, Kerey 8",        emailVerified: true } }),
    // CLEANING
    prisma.user.create({ data: { email: "cleanpro@remont.kz",    password: pw, role: UserRole.COMPANY, name: "CleanPro",       phone: "+7 701 100 1005", address: "Almaty, Tole bi 30",     emailVerified: true } }),
    // WELDING
    prisma.user.create({ data: { email: "kazweld@remont.kz",     password: pw, role: UserRole.COMPANY, name: "KazWeld",        phone: "+7 701 100 1006", address: "Almaty, Raiymbek 45",    emailVerified: true } }),
    // ROOFING
    prisma.user.create({ data: { email: "roofpro@remont.kz",     password: pw, role: UserRole.COMPANY, name: "RoofPro KZ",     phone: "+7 701 100 1007", address: "Astana, Mangilik El 12", emailVerified: true } }),
    // PAINTING
    prisma.user.create({ data: { email: "paintmaster@remont.kz", password: pw, role: UserRole.COMPANY, name: "PaintMaster",    phone: "+7 701 100 1008", address: "Almaty, Seifullin 88",   emailVerified: true } }),
    // RENOVATION
    prisma.user.create({ data: { email: "renovkz@remont.kz",     password: pw, role: UserRole.COMPANY, name: "RenovKZ",        phone: "+7 701 100 1009", address: "Shymkent, Tauke Han 5",  emailVerified: true } }),
    // OTHER
    prisma.user.create({ data: { email: "techmaster@remont.kz",  password: pw, role: UserRole.COMPANY, name: "TechMaster KZ",  phone: "+7 701 100 1010", address: "Almaty, Alatau 3",       emailVerified: true } }),
  ]);

  /* ── Clients ── */
  const clients = await Promise.all([
    prisma.user.create({ data: { email: "asel@remont.kz",   password: pw, role: UserRole.CLIENT, name: "Asel M.",   phone: "+7 705 200 0001", emailVerified: true } }),
    prisma.user.create({ data: { email: "dmitry@remont.kz", password: pw, role: UserRole.CLIENT, name: "Dmitry K.", phone: "+7 705 200 0002", emailVerified: true } }),
    prisma.user.create({ data: { email: "zarina@remont.kz", password: pw, role: UserRole.CLIENT, name: "Zarina T.", phone: "+7 705 200 0003", emailVerified: true } }),
    prisma.user.create({ data: { email: "arman@remont.kz",  password: pw, role: UserRole.CLIENT, name: "Arman S.",  phone: "+7 705 200 0004", emailVerified: true } }),
    prisma.user.create({ data: { email: "aibek@remont.kz",  password: pw, role: UserRole.CLIENT, name: "Aibek N.",  phone: "+7 705 200 0005", emailVerified: true } }),
    prisma.user.create({ data: { email: "nurgul@remont.kz", password: pw, role: UserRole.CLIENT, name: "Nurgul B.", phone: "+7 705 200 0006", emailVerified: true } }),
  ]);

  const [stroymast, autocity, electroserv, plumbing, cleanpro, kazweld, roofpro, paintmaster, renovkz, techmaster] = companies;
  const [asel, dmitry, zarina, arman, aibek, nurgul] = clients;

  /* ── Services ── */
  const services = await Promise.all([

    // ── REAL_ESTATE — StroiMaster ──
    prisma.service.create({ data: {
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
    }}),
    prisma.service.create({ data: {
      name: "Bathroom renovation",
      category: ServiceCategory.REAL_ESTATE,
      description: "Complete bathroom renovation: tile work, plumbing fixtures replacement, waterproofing, ventilation. Work in Almaty and surrounding areas. 1-year warranty on all work.",
      priceFrom: 80000, priceTo: 300000, city: "Almaty", address: "Almaty, Abay 10",
      rating: 4.9, active: true, companyId: stroymast.id,
      tags: ["bathroom", "tiles", "plumbing", "waterproofing"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80", order: 1 },
      ]},
    }}),

    // ── AUTOMOBILES — AutoCity KZ ──
    prisma.service.create({ data: {
      name: "Auto body repair & painting",
      category: ServiceCategory.AUTOMOBILES,
      description: "Professional body repair of any complexity: dents, scratches, corrosion removal, full or partial painting. Color matching guarantee. Working with all car makes.",
      priceFrom: 30000, priceTo: 500000, city: "Astana", address: "Astana, Saryarka 5",
      rating: 4.9, active: true, companyId: autocity.id,
      tags: ["body repair", "painting", "dents", "scratches"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Engine diagnostics & repair",
      category: ServiceCategory.AUTOMOBILES,
      description: "Computer diagnostics of any car brand. Engine repair, transmission service, suspension check. Experienced mechanics, original and quality parts. Quick turnaround.",
      priceFrom: 15000, priceTo: 200000, city: "Astana", address: "Astana, Saryarka 5",
      rating: 4.6, active: true, companyId: autocity.id,
      tags: ["diagnostics", "engine", "transmission", "suspension"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── ELECTRICAL — ElectroServ ──
    prisma.service.create({ data: {
      name: "Electrical wiring installation",
      category: ServiceCategory.ELECTRICAL,
      description: "Installation and replacement of electrical wiring in apartments, houses and offices. Switchboard installation, socket and light fitting, grounding. All work done to code with documentation.",
      priceFrom: 50000, priceTo: 400000, city: "Almaty", address: "Almaty, Dostyk 22",
      rating: 4.9, active: true, companyId: electroserv.id,
      tags: ["electrical", "wiring", "switchboard", "sockets"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Smart home & security systems",
      category: ServiceCategory.ELECTRICAL,
      description: "Installation of smart home systems: lighting control, smart sockets, security cameras, alarm systems, video intercoms. Full setup and configuration included.",
      priceFrom: 40000, priceTo: 300000, city: "Almaty", address: "Almaty, Dostyk 22",
      rating: 4.7, active: true, companyId: electroserv.id,
      tags: ["smart home", "security", "cameras", "automation"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── PLUMBING — PlumbingKZ ──
    prisma.service.create({ data: {
      name: "Plumbing repair & installation",
      category: ServiceCategory.PLUMBING,
      description: "Emergency and planned plumbing: pipe replacement, faucet repair, toilet installation, water heater connection. Available 24/7 for emergencies. Serving all districts of Astana.",
      priceFrom: 10000, priceTo: 150000, city: "Astana", address: "Astana, Kerey 8",
      rating: 4.7, active: true, companyId: plumbing.id,
      tags: ["plumbing", "pipes", "toilet", "water heater", "emergency"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Pipe replacement & heating systems",
      category: ServiceCategory.PLUMBING,
      description: "Full pipe replacement in apartments and houses: hot and cold water, heating risers. Installation of radiators, underfloor heating systems. Working with polypropylene and metal-plastic pipes.",
      priceFrom: 25000, priceTo: 250000, city: "Astana", address: "Astana, Kerey 8",
      rating: 4.8, active: true, companyId: plumbing.id,
      tags: ["pipes", "heating", "radiators", "underfloor heating"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1558618047-3c6c7a01c2b0?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── CLEANING — CleanPro ──
    prisma.service.create({ data: {
      name: "Post-construction cleaning",
      category: ServiceCategory.CLEANING,
      description: "Professional cleaning after renovation: removal of dust, construction debris, cement residue from windows and floors. Work with industrial equipment. Eco-friendly products. Result guaranteed.",
      priceFrom: 20000, priceTo: 120000, city: "Almaty", address: "Almaty, Tole bi 30",
      rating: 4.8, active: true, companyId: cleanpro.id,
      tags: ["cleaning", "post-renovation", "deep clean"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Regular home & office cleaning",
      category: ServiceCategory.CLEANING,
      description: "Weekly and bi-weekly home and office cleaning. Thorough vacuuming, mopping, kitchen and bathroom cleaning, window washing. Trusted staff, flexible schedule, affordable rates.",
      priceFrom: 8000, priceTo: 40000, city: "Almaty", address: "Almaty, Tole bi 30",
      rating: 4.7, active: true, companyId: cleanpro.id,
      tags: ["cleaning", "regular", "office", "home"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── WELDING — KazWeld ──
    prisma.service.create({ data: {
      name: "Metal gates & fences",
      category: ServiceCategory.WELDING,
      description: "Custom fabrication and installation of metal gates, fences, railings and barriers. Work with any steel profiles and pipes. Powder coating available. Measurement and installation included.",
      priceFrom: 35000, priceTo: 500000, city: "Almaty", address: "Almaty, Raiymbek 45",
      rating: 4.8, active: true, companyId: kazweld.id,
      tags: ["welding", "gates", "fences", "metal", "fabrication"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1565895405227-31cffdc9cef3?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Staircase & balcony railing welding",
      category: ServiceCategory.WELDING,
      description: "Fabrication and installation of staircases, balcony and terrace railings, metal frames for furniture. Custom designs, any complexity. We work with round, square and profile pipes.",
      priceFrom: 20000, priceTo: 300000, city: "Almaty", address: "Almaty, Raiymbek 45",
      rating: 4.6, active: true, companyId: kazweld.id,
      tags: ["welding", "staircase", "railings", "balcony", "custom"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── ROOFING — RoofPro KZ ──
    prisma.service.create({ data: {
      name: "Roof installation & repair",
      category: ServiceCategory.ROOFING,
      description: "Professional roofing services: installation of metal tile, corrugated sheets, soft roofing. Repair of any roof types, leak elimination, gutter installation. Work with warranty.",
      priceFrom: 80000, priceTo: 800000, city: "Astana", address: "Astana, Mangilik El 12",
      rating: 4.7, active: true, companyId: roofpro.id,
      tags: ["roofing", "metal tile", "repair", "leak", "gutters"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1592928302636-c83cf1169a03?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Flat roof waterproofing",
      category: ServiceCategory.ROOFING,
      description: "Waterproofing of flat roofs for apartment buildings, offices and industrial facilities. Materials: bitumen membranes, liquid rubber, TPO membranes. 5-year warranty on materials and work.",
      priceFrom: 50000, priceTo: 600000, city: "Astana", address: "Astana, Mangilik El 12",
      rating: 4.9, active: true, companyId: roofpro.id,
      tags: ["roofing", "waterproofing", "flat roof", "bitumen"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1558618047-3c6c7a01c2b0?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── PAINTING — PaintMaster ──
    prisma.service.create({ data: {
      name: "Interior painting & wallpapering",
      category: ServiceCategory.PAINTING,
      description: "Professional interior painting: walls, ceilings, doors and trim. Wallpaper hanging of any type. Surface preparation, priming, plaster leveling included. Clean work with dust covers.",
      priceFrom: 15000, priceTo: 200000, city: "Almaty", address: "Almaty, Seifullin 88",
      rating: 4.8, active: true, companyId: paintmaster.id,
      tags: ["painting", "wallpaper", "interior", "walls", "ceiling"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Facade & exterior painting",
      category: ServiceCategory.PAINTING,
      description: "Exterior painting of facades, foundations, fences and outbuildings. We use weather-resistant paints for Kazakhstan's climate. High-rise work with scaffolding or rope access.",
      priceFrom: 30000, priceTo: 500000, city: "Almaty", address: "Almaty, Seifullin 88",
      rating: 4.7, active: true, companyId: paintmaster.id,
      tags: ["painting", "facade", "exterior", "high-rise", "weather-resistant"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── RENOVATION — RenovKZ ──
    prisma.service.create({ data: {
      name: "Kitchen renovation",
      category: ServiceCategory.RENOVATION,
      description: "Full kitchen renovation: demolition, leveling, tiling, installation of kitchen furniture and appliances, plumbing and electrical connections. Modern materials and finishes. Works in Shymkent and region.",
      priceFrom: 100000, priceTo: 600000, city: "Shymkent", address: "Shymkent, Tauke Han 5",
      rating: 4.8, active: true, companyId: renovkz.id,
      tags: ["renovation", "kitchen", "tiles", "furniture", "turnkey"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80", order: 0 },
        { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", order: 1 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Office renovation",
      category: ServiceCategory.RENOVATION,
      description: "Office and commercial space renovation: open-plan offices, meeting rooms, receptions. Stretch ceilings, partition walls, flooring, lighting. We work on weekends to minimize downtime.",
      priceFrom: 200000, priceTo: 2000000, city: "Shymkent", address: "Shymkent, Tauke Han 5",
      rating: 4.6, active: true, companyId: renovkz.id,
      tags: ["renovation", "office", "commercial", "partition", "ceiling"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", order: 0 },
      ]},
    }}),

    // ── OTHER — TechMaster KZ ──
    prisma.service.create({ data: {
      name: "Appliance repair (all brands)",
      category: ServiceCategory.OTHER,
      description: "On-site repair of washing machines, refrigerators, dishwashers, microwaves. Diagnostics within the day. Genuine parts. 6-month warranty on repairs.",
      priceFrom: 8000, priceTo: 60000, city: "Almaty", address: "Almaty, Alatau 3",
      rating: 4.5, active: true, companyId: techmaster.id,
      tags: ["appliances", "washing machine", "refrigerator", "on-site repair"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80", order: 0 },
      ]},
    }}),
    prisma.service.create({ data: {
      name: "Furniture assembly & installation",
      category: ServiceCategory.OTHER,
      description: "Assembly of flat-pack furniture from IKEA, Hoff, Leroy Merlin and other brands. Hanging of shelves, cabinets, TV mounts, curtain rods. Careful and precise work, tools included.",
      priceFrom: 5000, priceTo: 50000, city: "Almaty", address: "Almaty, Alatau 3",
      rating: 4.6, active: true, companyId: techmaster.id,
      tags: ["furniture", "assembly", "IKEA", "shelves", "TV mount"],
      images: { create: [
        { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", order: 0 },
      ]},
    }}),
  ]);

  const [svcRenovation, svcBathroom, svcBody, svcEngine, svcElectric, svcSmartHome,
         svcPlumbing, svcPipes, svcCleaning, svcRegularClean,
         svcGates, svcRailings, svcRoof, svcWaterproof,
         svcPainting, svcFacade, svcKitchen, svcOffice,
         svcAppliance, svcFurniture] = services;

  /* ════════════════════════════════════════════
     COMPLETED requests — with reviews
  ════════════════════════════════════════════ */

  await prisma.request.create({ data: {
    clientId: asel.id, serviceId: svcRenovation.id, companyId: stroymast.id,
    description: "Need full renovation of 2-bedroom apartment, ~60 sqm. Demolition + rough work + finish. Budget is flexible for quality work.",
    category: ServiceCategory.REAL_ESTATE, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 400000, budgetTo: 700000,
    rating: 5, review: "Excellent work! StroiMaster team did a fantastic job on our apartment. Clean, on time, and the quality exceeded expectations. Highly recommend!",
    companyReply: "Thank you so much, Asel! It was a pleasure working on your apartment. We wish you many happy years in your new home!",
  }});

  await prisma.request.create({ data: {
    clientId: dmitry.id, serviceId: svcBody.id, companyId: autocity.id,
    description: "My Toyota Camry has a large dent on the front bumper and scratches on the driver door. Need body repair and spot painting.",
    category: ServiceCategory.AUTOMOBILES, city: "Astana", status: RequestStatus.COMPLETED,
    budgetFrom: 50000, budgetTo: 150000,
    rating: 5, review: "AutoCity did an amazing job. The car looks brand new, you can't even tell where the dent was. Fair price and quick turnaround — 3 days instead of the quoted 5.",
  }});

  await prisma.request.create({ data: {
    clientId: zarina.id, serviceId: svcElectric.id, companyId: electroserv.id,
    description: "Complete rewiring of a 3-room apartment. Old wiring needs full replacement, new switchboard, install 15 outlets and 8 light points.",
    category: ServiceCategory.ELECTRICAL, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 150000, budgetTo: 300000,
    rating: 4, review: "Good work, everything done neatly. Took slightly longer than planned but the quality is excellent. All certificates provided.",
  }});

  await prisma.request.create({ data: {
    clientId: arman.id, serviceId: svcPlumbing.id, companyId: plumbing.id,
    description: "Emergency call — burst pipe in bathroom. Need immediate repair.",
    category: ServiceCategory.PLUMBING, city: "Astana", status: RequestStatus.COMPLETED,
    rating: 5, review: "They arrived within 40 minutes at midnight! Fixed everything quickly and cleanly. Real professionals. Will only call PlumbingKZ going forward.",
    companyReply: "Thank you Arman! Emergency calls are our specialty. We're glad we could help quickly!",
  }});

  await prisma.request.create({ data: {
    clientId: arman.id, serviceId: svcCleaning.id, companyId: cleanpro.id,
    description: "Need post-renovation cleaning for 2-bedroom apartment 65 sqm. Renovation just finished.",
    category: ServiceCategory.CLEANING, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 25000, budgetTo: 50000,
    rating: 5, review: "CleanPro did an incredible job. Apartment was spotless after 4 hours. Worth every penny!",
    companyReply: "Thank you, Arman! It was a pleasure. Don't hesitate to call us after your next renovation!",
  }});

  await prisma.request.create({ data: {
    clientId: aibek.id, serviceId: svcGates.id, companyId: kazweld.id,
    description: "Need a sliding metal gate for private house entrance, width 4 meters. Prefer dark grey powder coating.",
    category: ServiceCategory.WELDING, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 120000, budgetTo: 250000,
    rating: 5, review: "KazWeld made an excellent gate — sturdy, smooth, looks great. Delivered and installed in 10 days as promised. Very satisfied.",
    companyReply: "Thank you Aibek! Enjoy your new gate. We offer a 2-year warranty on all metal structures.",
  }});

  await prisma.request.create({ data: {
    clientId: nurgul.id, serviceId: svcRoof.id, companyId: roofpro.id,
    description: "Roof repair on private house. Metal tile started leaking near the chimney area after heavy rains. Need inspection and repair.",
    category: ServiceCategory.ROOFING, city: "Astana", status: RequestStatus.COMPLETED,
    budgetFrom: 40000, budgetTo: 100000,
    rating: 4, review: "RoofPro found and fixed two leak points. No more leaks after the last rain. Reasonable price. Slightly difficult to reach initially but work quality is good.",
  }});

  await prisma.request.create({ data: {
    clientId: asel.id, serviceId: svcPainting.id, companyId: paintmaster.id,
    description: "Paint 3 bedrooms and hallway. Total ~90 sqm of walls and ceilings. Walls — warm white, ceiling — white. Surface prep needed.",
    category: ServiceCategory.PAINTING, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 60000, budgetTo: 120000,
    rating: 5, review: "PaintMaster team worked quickly and very cleanly. They covered all furniture and floors. The result is perfect — smooth, even coat. Will call again.",
    companyReply: "Thank you Asel! We're happy you liked the result. Call us for your facade next time!",
  }});

  await prisma.request.create({ data: {
    clientId: dmitry.id, serviceId: svcKitchen.id, companyId: renovkz.id,
    description: "Full kitchen renovation in new apartment. ~12 sqm, need to tile, install cabinets, connect all appliances. Modern minimalist style.",
    category: ServiceCategory.RENOVATION, city: "Shymkent", status: RequestStatus.COMPLETED,
    budgetFrom: 200000, budgetTo: 400000,
    rating: 5, review: "RenovKZ did a brilliant kitchen renovation. Design advice was free, materials quality is excellent. The kitchen looks like something from a magazine.",
  }});

  await prisma.request.create({ data: {
    clientId: zarina.id, serviceId: svcAppliance.id, companyId: techmaster.id,
    description: "Refrigerator Samsung not cooling. Makes noise at night. Model RT38K5400S8.",
    category: ServiceCategory.OTHER, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 10000, budgetTo: 30000,
    rating: 4, review: "Technician arrived next day, diagnosed and fixed in 2 hours. Fair price. Only minus — had to wait for spare part 2 days.",
  }});

  await prisma.request.create({ data: {
    clientId: aibek.id, serviceId: svcEngine.id, companyId: autocity.id,
    description: "Kia Sportage 2019 — check engine light on, car vibrates at idle. Need full diagnostics.",
    category: ServiceCategory.AUTOMOBILES, city: "Astana", status: RequestStatus.COMPLETED,
    budgetFrom: 20000, budgetTo: 60000,
    rating: 5, review: "Quick diagnosis, found the issue immediately — ignition coil on cylinder 3. Replaced on the spot. Car runs perfectly now. Great team!",
  }});

  await prisma.request.create({ data: {
    clientId: nurgul.id, serviceId: svcSmartHome.id, companyId: electroserv.id,
    description: "Install security cameras (4 outdoor) and smart doorbell for private home. Need remote monitoring on phone.",
    category: ServiceCategory.ELECTRICAL, city: "Almaty", status: RequestStatus.COMPLETED,
    budgetFrom: 80000, budgetTo: 150000,
    rating: 5, review: "ElectroServ installed everything perfectly. App works great, picture is clear even at night. They also set up motion alerts. Highly recommend!",
  }});

  await prisma.request.create({ data: {
    clientId: arman.id, serviceId: svcPipes.id, companyId: plumbing.id,
    description: "Replace all hot and cold water pipes in 2-bedroom apartment. Old metal pipes, need to switch to polypropylene.",
    category: ServiceCategory.PLUMBING, city: "Astana", status: RequestStatus.COMPLETED,
    budgetFrom: 80000, budgetTo: 180000,
    rating: 5, review: "PlumbingKZ replaced all pipes in 2 days with no mess. Hid everything in the walls nicely. Pressure is great, no leaks. Excellent work!",
  }});

  /* ════════════════════════════════════════════
     IN_PROGRESS requests
  ════════════════════════════════════════════ */

  const reqInProgress1 = await prisma.request.create({ data: {
    clientId: asel.id, serviceId: svcBathroom.id, companyId: stroymast.id,
    description: "Bathroom renovation: replace all tiles, new shower, toilet and sink. Approximately 5 sqm.",
    category: ServiceCategory.REAL_ESTATE, city: "Almaty",
    status: RequestStatus.IN_PROGRESS, budgetFrom: 120000, budgetTo: 250000,
  }});

  const reqInProgress2 = await prisma.request.create({ data: {
    clientId: nurgul.id, serviceId: svcWaterproof.id, companyId: roofpro.id,
    description: "Waterproofing of flat roof on our 3-storey building. About 400 sqm. Started leaking in 3 spots last winter.",
    category: ServiceCategory.ROOFING, city: "Astana",
    status: RequestStatus.IN_PROGRESS, budgetFrom: 300000, budgetTo: 600000,
  }});

  const reqInProgress3 = await prisma.request.create({ data: {
    clientId: aibek.id, serviceId: svcFacade.id, companyId: paintmaster.id,
    description: "Paint facade of private house, 2 floors, approximately 200 sqm. Current paint is peeling. Need surface prep and 2 coats.",
    category: ServiceCategory.PAINTING, city: "Almaty",
    status: RequestStatus.IN_PROGRESS, budgetFrom: 80000, budgetTo: 200000,
  }});

  const reqInProgress4 = await prisma.request.create({ data: {
    clientId: dmitry.id, serviceId: svcOffice.id, companyId: renovkz.id,
    description: "Office renovation, 120 sqm open space. Need stretch ceiling, new flooring (laminate), partition wall for meeting room, full repaint.",
    category: ServiceCategory.RENOVATION, city: "Shymkent",
    status: RequestStatus.IN_PROGRESS, budgetFrom: 500000, budgetTo: 900000,
  }});

  /* ════════════════════════════════════════════
     ACCEPTED requests
  ════════════════════════════════════════════ */

  const reqAccepted1 = await prisma.request.create({ data: {
    clientId: zarina.id, serviceId: svcRailings.id, companyId: kazweld.id,
    description: "Need metal railings for staircase in private house. 2 flights, total ~14 meters. Want minimalist black design.",
    category: ServiceCategory.WELDING, city: "Almaty",
    status: RequestStatus.ACCEPTED, budgetFrom: 60000, budgetTo: 150000,
  }});

  const reqAccepted2 = await prisma.request.create({ data: {
    clientId: arman.id, serviceId: svcRegularClean.id, companyId: cleanpro.id,
    description: "Office cleaning 2 times per week. Office 80 sqm, 6 workstations, kitchen, bathroom. Need morning service before 9:00.",
    category: ServiceCategory.CLEANING, city: "Almaty",
    status: RequestStatus.ACCEPTED, budgetFrom: 15000, budgetTo: 25000,
  }});

  const reqAccepted3 = await prisma.request.create({ data: {
    clientId: aibek.id, serviceId: svcFurniture.id, companyId: techmaster.id,
    description: "Assemble large wardrobe from IKEA PAX system (3 sections, 2.4m tall) and mount 5 shelves in hallway.",
    category: ServiceCategory.OTHER, city: "Almaty",
    status: RequestStatus.ACCEPTED, budgetFrom: 12000, budgetTo: 25000,
  }});

  /* ════════════════════════════════════════════
     NEW requests — open for offers
  ════════════════════════════════════════════ */

  const reqNew1 = await prisma.request.create({ data: {
    clientId: dmitry.id,
    description: "Need appliance repair — washing machine Bosch Serie 4 doesn't spin, error E18. Urgent, have kids at home.",
    category: ServiceCategory.OTHER, city: "Almaty",
    status: RequestStatus.NEW, budgetFrom: 15000, budgetTo: 40000,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }});

  const reqNew2 = await prisma.request.create({ data: {
    clientId: zarina.id,
    description: "Need to paint 3 rooms in new apartment. Walls only, ~80 sqm total. Light warm colors preferred. Can start next week.",
    category: ServiceCategory.PAINTING, city: "Almaty",
    status: RequestStatus.NEW, budgetFrom: 30000, budgetTo: 80000,
    expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  }});

  const reqNew3 = await prisma.request.create({ data: {
    clientId: nurgul.id,
    description: "Leaking tap in kitchen and one in bathroom. Also need to replace toilet flush mechanism. Astana, Esil district.",
    category: ServiceCategory.PLUMBING, city: "Astana",
    status: RequestStatus.NEW, budgetFrom: 8000, budgetTo: 25000,
    expiresAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
  }});

  const reqNew4 = await prisma.request.create({ data: {
    clientId: asel.id,
    description: "Install 5 chandeliers, 10 LED spots, and connect 2 new outlets in living room. Wiring is already pulled.",
    category: ServiceCategory.ELECTRICAL, city: "Almaty",
    status: RequestStatus.NEW, budgetFrom: 20000, budgetTo: 50000,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  }});

  const reqNew5 = await prisma.request.create({ data: {
    clientId: arman.id,
    description: "Looking for a team to do full renovation of 1-bedroom apartment 42 sqm. Blank slate after demolition. Need rough + finish work.",
    category: ServiceCategory.REAL_ESTATE, city: "Almaty",
    status: RequestStatus.NEW, budgetFrom: 200000, budgetTo: 400000,
    expiresAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
  }});

  const reqNew6 = await prisma.request.create({ data: {
    clientId: aibek.id,
    description: "Deep cleaning of 3-room apartment 85 sqm after tenants moved out. Includes windows, oven, bathroom tiles.",
    category: ServiceCategory.CLEANING, city: "Almaty",
    status: RequestStatus.NEW, budgetFrom: 15000, budgetTo: 35000,
    expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
  }});

  const reqNew7 = await prisma.request.create({ data: {
    clientId: dmitry.id,
    description: "Need metal stairs fabricated and installed for second floor of private house. Width 90 cm, height 3 m. Open riser style preferred.",
    category: ServiceCategory.WELDING, city: "Almaty",
    status: RequestStatus.NEW, budgetFrom: 150000, budgetTo: 350000,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }});

  const reqNew8 = await prisma.request.create({ data: {
    clientId: nurgul.id,
    description: "Need kitchen renovation in our Shymkent apartment. 10 sqm, want a new layout with island if possible. All materials flexible.",
    category: ServiceCategory.RENOVATION, city: "Shymkent",
    status: RequestStatus.NEW, budgetFrom: 250000, budgetTo: 600000,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }});

  const reqNew9 = await prisma.request.create({ data: {
    clientId: zarina.id,
    description: "Auto repair — Toyota RAV4 2020 suspension noise at front left wheel. Also need oil and filter change.",
    category: ServiceCategory.AUTOMOBILES, city: "Astana",
    status: RequestStatus.NEW, budgetFrom: 25000, budgetTo: 70000,
    expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
  }});

  const reqNew10 = await prisma.request.create({ data: {
    clientId: arman.id,
    description: "Roof inspection and minor repairs for private house in Astana. After last winter some tiles shifted, worried about spring melt.",
    category: ServiceCategory.ROOFING, city: "Astana",
    status: RequestStatus.NEW, budgetFrom: 30000, budgetTo: 80000,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }});

  /* ── Offers on NEW requests ── */
  await prisma.requestOffer.createMany({ data: [
    { requestId: reqNew1.id, companyId: techmaster.id, price: 18000, comment: "We can come tomorrow morning. Bosch E18 is usually a pump filter blockage — quick fix. Price includes parts if needed." },
    { requestId: reqNew2.id, companyId: paintmaster.id, price: 55000, comment: "Ready to start next Monday. Price includes primer, 2 coats of paint, all materials. Surface prep included." },
    { requestId: reqNew3.id, companyId: plumbing.id, price: 12000, comment: "We do all three jobs in one visit. Parts included. Can come tomorrow or day after." },
    { requestId: reqNew3.id, companyId: stroymast.id, price: 15000, comment: "Our plumber is available this week. We'll check all connections while we're there at no extra charge." },
    { requestId: reqNew4.id, companyId: electroserv.id, price: 28000, comment: "Straightforward job. We'll bring all fittings needed. Can do it on Saturday if convenient." },
    { requestId: reqNew5.id, companyId: stroymast.id, price: 280000, comment: "We specialize in exactly this type of work. Free on-site estimate this week. Price may adjust slightly after inspection." },
    { requestId: reqNew6.id, companyId: cleanpro.id, price: 22000, comment: "Post-tenancy specialist team. 4-5 hours, eco products. Oven and fridge deep clean included." },
    { requestId: reqNew7.id, companyId: kazweld.id, price: 220000, comment: "We'll draw up a design sketch for you first. Open riser stairs with metal handrails is our signature work." },
    { requestId: reqNew8.id, companyId: renovkz.id, price: 380000, comment: "We have a great island kitchen project we just finished — can show photos. Free design consultation included." },
    { requestId: reqNew9.id, companyId: autocity.id, price: 35000, comment: "Likely wheel bearing or stabilizer bar link — we'll know after lifting the car. Oil change included in price." },
    { requestId: reqNew10.id, companyId: roofpro.id, price: 45000, comment: "We'll do full inspection and fix all problem areas. Any shifted tiles reseated and sealed. Photo report provided." },
  ]});

  /* ── Update service ratings ── */
  await Promise.all([
    prisma.service.update({ where: { id: svcRenovation.id }, data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcBathroom.id },   data: { rating: 4.9 } }),
    prisma.service.update({ where: { id: svcBody.id },       data: { rating: 4.9 } }),
    prisma.service.update({ where: { id: svcEngine.id },     data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcElectric.id },   data: { rating: 4.7 } }),
    prisma.service.update({ where: { id: svcSmartHome.id },  data: { rating: 4.9 } }),
    prisma.service.update({ where: { id: svcPlumbing.id },   data: { rating: 4.9 } }),
    prisma.service.update({ where: { id: svcPipes.id },      data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcCleaning.id },   data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcRegularClean.id },data: { rating: 4.7 } }),
    prisma.service.update({ where: { id: svcGates.id },      data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcRailings.id },   data: { rating: 4.6 } }),
    prisma.service.update({ where: { id: svcKitchen.id },    data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcPainting.id },   data: { rating: 4.8 } }),
    prisma.service.update({ where: { id: svcAppliance.id },  data: { rating: 4.5 } }),
  ]);

  /* ── Chat messages for in-progress requests ── */
  await prisma.message.createMany({ data: [
    { requestId: reqInProgress1.id, senderId: stroymast.id, receiverId: asel.id,     content: "Hello Asel! We've started work on your bathroom. Tiles have been removed, starting waterproofing tomorrow." },
    { requestId: reqInProgress1.id, senderId: asel.id,      receiverId: stroymast.id, content: "Great, thank you! Can we choose the new tiles this week?" },
    { requestId: reqInProgress1.id, senderId: stroymast.id, receiverId: asel.id,     content: "Of course! We can visit the showroom on Thursday at 11:00. Does that work?" },
    { requestId: reqInProgress2.id, senderId: roofpro.id,   receiverId: nurgul.id,   content: "Nurgul, we've applied the first layer of waterproofing membrane. Will continue tomorrow after it cures." },
    { requestId: reqInProgress2.id, senderId: nurgul.id,    receiverId: roofpro.id,  content: "How many more days do you estimate?" },
    { requestId: reqInProgress2.id, senderId: roofpro.id,   receiverId: nurgul.id,   content: "3 more working days. We're also adding an extra layer near the drainage points as a precaution." },
    { requestId: reqInProgress3.id, senderId: paintmaster.id, receiverId: aibek.id,  content: "Aibek, we've finished sanding and priming the facade. Starting the first color coat tomorrow." },
    { requestId: reqInProgress4.id, senderId: renovkz.id,   receiverId: dmitry.id,   content: "Dmitry, stretch ceiling installed. Starting flooring tomorrow. The partition wall frame is also done." },
    { requestId: reqInProgress4.id, senderId: dmitry.id,    receiverId: renovkz.id,  content: "Looks great on the photos! When do you expect to finish?" },
    { requestId: reqInProgress4.id, senderId: renovkz.id,   receiverId: dmitry.id,   content: "5 more working days for flooring and painting, then 2 days for final touches. On schedule!" },
  ]});

  /* ── Chat for accepted requests ── */
  await prisma.message.createMany({ data: [
    { requestId: reqAccepted1.id, senderId: kazweld.id,  receiverId: zarina.id,  content: "Hi Zarina! We've confirmed your order. Our measurer will come Thursday 10:00-12:00 to take exact measurements. Please be home." },
    { requestId: reqAccepted1.id, senderId: zarina.id,   receiverId: kazweld.id, content: "Perfect, I'll be home Thursday morning. Should I prepare anything?" },
    { requestId: reqAccepted1.id, senderId: kazweld.id,  receiverId: zarina.id,  content: "Just make sure the staircase area is accessible. Bring any inspiration photos if you have them!" },
    { requestId: reqAccepted2.id, senderId: cleanpro.id, receiverId: arman.id,   content: "Arman, first cleaning session confirmed for Monday 8:00. Our team of 2 will arrive. Please leave access with reception." },
    { requestId: reqAccepted3.id, senderId: techmaster.id, receiverId: aibek.id, content: "Hi Aibek! We're scheduled for Saturday 10:00. Please have the IKEA boxes unpacked and parts sorted if possible — saves time." },
  ]});

  /* ── Admin ── */
  await prisma.user.upsert({
    where: { email: "admin@remont.kz" },
    update: {},
    create: {
      email: "admin@remont.kz",
      password: await hashPassword("Admin123!"),
      role: "ADMIN", name: "Admin", emailVerified: true,
    },
  });

  const totalRequests = 13 + 4 + 3 + 10; // completed + in_progress + accepted + new
  console.log("✅ Seed complete!");
  console.log(`   Companies: ${companies.length} (all 10 categories covered)`);
  console.log(`   Clients:   ${clients.length}`);
  console.log(`   Services:  ${services.length}`);
  console.log(`   Requests:  ${totalRequests} (13 completed, 4 in-progress, 3 accepted, 10 new)`);
  console.log(`   Offers:    11 offers on open requests`);
  console.log("\nDemo accounts (password: password123):");
  console.log("  stroymast@remont.kz   — StroiMaster    (REAL_ESTATE)");
  console.log("  autocity@remont.kz    — AutoCity KZ    (AUTOMOBILES)");
  console.log("  electroserv@remont.kz — ElectroServ    (ELECTRICAL)");
  console.log("  plumbing@remont.kz    — PlumbingKZ     (PLUMBING)");
  console.log("  cleanpro@remont.kz    — CleanPro       (CLEANING)");
  console.log("  kazweld@remont.kz     — KazWeld        (WELDING)");
  console.log("  roofpro@remont.kz     — RoofPro KZ     (ROOFING)");
  console.log("  paintmaster@remont.kz — PaintMaster    (PAINTING)");
  console.log("  renovkz@remont.kz     — RenovKZ        (RENOVATION)");
  console.log("  techmaster@remont.kz  — TechMaster KZ  (OTHER)");
  console.log("  admin@remont.kz       — Admin          (password: Admin123!)");
  console.log("  asel@remont.kz / dmitry@remont.kz / zarina@remont.kz / arman@remont.kz / aibek@remont.kz / nurgul@remont.kz — Clients");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
