import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  MessageType,
  PrismaClient,
  RequestStatus,
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
    "client1@remont.kz",
    "client2@remont.kz",
    "company1@remont.kz",
    "company2@remont.kz",
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

  const client1 = await prisma.user.upsert({
    where: { email: "client1@remont.kz" },
    update: {},
    create: {
      email: "client1@remont.kz",
      password: await hashPassword("Client123!"),
      role: UserRole.CLIENT,
      name: "Aruzhan Client",
      phone: "+7 701 123 45 67",
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "client2@remont.kz" },
    update: {},
    create: {
      email: "client2@remont.kz",
      password: await hashPassword("Client123!"),
      role: UserRole.CLIENT,
      name: "Dias Client",
      phone: "+7 702 555 77 88",
    },
  });

  const company1 = await prisma.user.upsert({
    where: { email: "company1@remont.kz" },
    update: {},
    create: {
      email: "company1@remont.kz",
      password: await hashPassword("Company123!"),
      role: UserRole.COMPANY,
      name: "BuildMaster KZ",
      phone: "+7 700 999 66 55",
    },
  });

  const company2 = await prisma.user.upsert({
    where: { email: "company2@remont.kz" },
    update: {},
    create: {
      email: "company2@remont.kz",
      password: await hashPassword("Company123!"),
      role: UserRole.COMPANY,
      name: "AutoPro Service",
      phone: "+7 701 100 20 30",
    },
  });

  console.log("Users ready");

  const companyServices = [
    {
      companyId: company1.id,
      items: [
        {
          name: "Apartment renovation turnkey",
          category: ServiceCategory.REAL_ESTATE,
          description: "Full apartment renovation with planning, materials, and supervision.",
          priceFrom: 12000,
          priceTo: 30000,
          city: "Almaty",
          rating: 4.8,
          licensed: true,
          availabilityDays: 5,
          urgency: "medium",
          tags: ["warranty", "contract"],
          customAttributes: { warranty: "12 months", payment: "No prepayment" },
          images: [
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          ],
        },
        {
          name: "Kitchen renovation",
          category: ServiceCategory.REAL_ESTATE,
          description: "Kitchen renovation with electrical, tile, and furniture work.",
          priceFrom: 8000,
          priceTo: 20000,
          city: "Astana",
          rating: 4.6,
          licensed: true,
          availabilityDays: 7,
          urgency: "medium",
          tags: ["design", "materials included"],
          customAttributes: { design: "Included", supervision: "Yes" },
          images: [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          ],
        },
        {
          name: "Post-renovation cleaning",
          category: ServiceCategory.OTHER,
          description: "Deep cleaning after renovation with waste removal.",
          priceFrom: 5000,
          priceTo: 12000,
          city: "Shymkent",
          rating: 4.4,
          licensed: false,
          availabilityDays: 2,
          urgency: "high",
          tags: ["fast arrival", "chemicals included"],
          customAttributes: { crew: "2-3 people" },
          images: [
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          ],
        },
      ],
    },
    {
      companyId: company2.id,
      items: [
        {
          name: "Car maintenance",
          category: ServiceCategory.AUTOMOBILES,
          description: "Diagnostics, oil change, and suspension service.",
          priceFrom: 7000,
          priceTo: 25000,
          city: "Almaty",
          rating: 4.5,
          licensed: true,
          availabilityDays: 3,
          urgency: "high",
          tags: ["warranty", "OEM parts"],
          customAttributes: { parts: "OEM", warranty: "6 months" },
          images: [
            "https://images.unsplash.com/photo-1515920010264-05a0f6a4c28f",
            "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
          ],
        },
        {
          name: "Car detailing",
          category: ServiceCategory.AUTOMOBILES,
          description: "Interior and exterior detailing with ceramic coating.",
          priceFrom: 15000,
          priceTo: 45000,
          city: "Astana",
          rating: 4.7,
          licensed: true,
          availabilityDays: 4,
          urgency: "medium",
          tags: ["ceramic", "polish"],
          customAttributes: { wash: "2-step", coating: "3-year ceramic" },
          images: [
            "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
          ],
        },
        {
          name: "Tow truck 24/7",
          category: ServiceCategory.OTHER,
          description: "Round-the-clock tow truck across city and highway routes.",
          priceFrom: 8000,
          priceTo: 18000,
          city: "Karagandy",
          rating: 4.3,
          licensed: false,
          availabilityDays: 1,
          urgency: "high",
          tags: ["24/7", "insured"],
          customAttributes: { distance: "up to 300 km" },
          images: [
            "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
          ],
        },
      ],
    },
  ];

  const services = [];
  for (const group of companyServices) {
    for (const item of group.items) {
      const service = await prisma.service.create({
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
          companyId: group.companyId,
          images: {
            create: item.images.map((url, order) => ({ url, order })),
          },
        },
      });

      services.push(service);
    }
  }

  console.log("Services seeded");

  const [serviceA1, serviceA2, serviceA3, serviceB1, serviceB2, serviceB3] = services;

  await prisma.request.createMany({
    data: [
      {
        clientId: client1.id,
        serviceId: serviceA1.id,
        companyId: company1.id,
        description: "Need a full apartment renovation for 60 sq m.",
        category: serviceA1.category,
        city: serviceA1.city,
        status: RequestStatus.NEW,
      },
      {
        clientId: client2.id,
        serviceId: serviceA2.id,
        companyId: company1.id,
        description: "Need a kitchen renovation with a fixed budget.",
        category: serviceA2.category,
        city: serviceA2.city,
        status: RequestStatus.ACCEPTED,
      },
      {
        clientId: client1.id,
        serviceId: serviceA3.id,
        companyId: company1.id,
        description: "Need post-renovation cleaning for a two-room apartment.",
        category: serviceA3.category,
        city: serviceA3.city,
        status: RequestStatus.COMPLETED,
      },
      {
        clientId: client2.id,
        serviceId: serviceB1.id,
        companyId: company2.id,
        description: "Need maintenance for a 2021 Camry.",
        category: serviceB1.category,
        city: serviceB1.city,
        status: RequestStatus.NEW,
      },
      {
        clientId: client1.id,
        serviceId: serviceB2.id,
        companyId: company2.id,
        description: "Need detailing and ceramic coating this week.",
        category: serviceB2.category,
        city: serviceB2.city,
        status: RequestStatus.IN_PROGRESS,
      },
      {
        clientId: client2.id,
        serviceId: serviceB3.id,
        companyId: company2.id,
        description: "Need a tow truck from Karagandy to Astana.",
        category: serviceB3.category,
        city: serviceB3.city,
        status: RequestStatus.COMPLETED,
      },
      {
        clientId: client1.id,
        description: "Need urgent plumbing repair, pipe leak in the bathroom.",
        category: ServiceCategory.OTHER,
        city: "Almaty",
        imageUrl: "https://images.unsplash.com/photo-1581090467213-8cba0e09a49a",
        status: RequestStatus.NEW,
      },
    ],
  });

  console.log("Requests seeded");

  const createdRequests = await prisma.request.findMany({
    where: { clientId: { in: [client1.id, client2.id] } },
    orderBy: { createdAt: "asc" },
  });

  const anyRequestId = createdRequests[0]?.id;

  if (anyRequestId) {
    await prisma.message.createMany({
      data: [
        {
          requestId: anyRequestId,
          senderId: client1.id,
          receiverId: company1.id,
          content: "Hello! When can you start?",
          type: MessageType.TEXT,
          read: false,
        },
        {
          requestId: anyRequestId,
          senderId: company1.id,
          receiverId: client1.id,
          content: "We have an opening next week.",
          type: MessageType.TEXT,
          read: true,
        },
        {
          requestId: anyRequestId,
          senderId: client1.id,
          receiverId: company1.id,
          content: "Photo of the room",
          type: MessageType.IMAGE,
          imageUrl: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
          read: true,
        },
      ],
    });
  }

  console.log("Messages seeded");
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
