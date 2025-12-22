import { PrismaClient, UserRole, ServiceCategory, RequestStatus, MessageType, SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create users
  const client1 = await prisma.user.upsert({
    where: { email: "client1@example.com" },
    update: {},
    create: {
      email: "client1@example.com",
      password: await hashPassword("password123"),
      role: UserRole.CLIENT,
      name: "Иван Петров",
      phone: "+7 701 123 45 67",
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: "client2@example.com" },
    update: {},
    create: {
      email: "client2@example.com",
      password: await hashPassword("password123"),
      role: UserRole.CLIENT,
      name: "Мария Сидорова",
      phone: "+7 702 555 77 88",
    },
  });

  const company1 = await prisma.user.upsert({
    where: { email: "company1@example.com" },
    update: {},
    create: {
      email: "company1@example.com",
      password: await hashPassword("password123"),
      role: UserRole.COMPANY,
      name: "СтройМастер KZ",
      phone: "+7 700 999 66 55",
    },
  });

  const company2 = await prisma.user.upsert({
    where: { email: "company2@example.com" },
    update: {},
    create: {
      email: "company2@example.com",
      password: await hashPassword("password123"),
      role: UserRole.COMPANY,
      name: "AutoPro Сервис",
      phone: "+7 701 100 20 30",
    },
  });

  console.log("✅ Created users");

  // Create services
  const service1 = await prisma.service.create({
    data: {
      name: "Ремонт под ключ",
      category: ServiceCategory.REAL_ESTATE,
      description: "Капитальный и косметический ремонт квартир под ключ. Гарантия и договор.",
      priceFrom: 12000,
      priceTo: 30000,
      active: true,
      city: "Алматы",
      rating: 4.8,
      licensed: true,
      availabilityDays: 5,
      urgency: "medium",
      tags: ["Гарантия 12 мес.", "Без предоплаты"],
      customAttributes: {
        warranty: "12 месяцев",
        payment: "Без предоплаты",
      },
      companyId: company1.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
            order: 0,
          },
        ],
      },
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: "ТО автомобилей",
      category: ServiceCategory.AUTOMOBILES,
      description: "Техническое обслуживание, диагностика, ремонт ходовой и тормозной системы.",
      priceFrom: 7000,
      priceTo: 35000,
      active: true,
      city: "Алматы",
      rating: 4.5,
      licensed: true,
      availabilityDays: 3,
      urgency: "high",
      tags: ["Гарантия", "Оригинальные запчасти"],
      companyId: company2.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1515920010264-05a0f6a4c28f",
            order: 0,
          },
        ],
      },
    },
  });

  console.log("✅ Created services");

  // Create requests
  const request1 = await prisma.request.create({
    data: {
      clientId: client1.id,
      serviceId: service1.id,
      companyId: company1.id,
      message: "Нужен ремонт квартиры 50 кв.м. в Алматы. Сроки - 2 месяца.",
      status: RequestStatus.NEW,
    },
  });

  const request2 = await prisma.request.create({
    data: {
      clientId: client2.id,
      serviceId: service2.id,
      companyId: company2.id,
      message: "Требуется ТО для Toyota Camry 2020 года.",
      status: RequestStatus.IN_PROGRESS,
    },
  });

  const request3 = await prisma.request.create({
    data: {
      clientId: client1.id,
      serviceId: service1.id,
      companyId: company1.id,
      message: "Ремонт кухни и ванной комнаты.",
      status: RequestStatus.COMPLETED,
    },
  });

  console.log("✅ Created requests");

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        requestId: request1.id,
        senderId: client1.id,
        receiverId: company1.id,
        content: "Здравствуйте! Когда можно начать ремонт?",
        type: MessageType.TEXT,
        read: false,
      },
      {
        requestId: request1.id,
        senderId: company1.id,
        receiverId: client1.id,
        content: "Мы можем начать на следующей неделе. Подойдет?",
        type: MessageType.TEXT,
        read: true,
      },
      {
        requestId: request2.id,
        senderId: client2.id,
        receiverId: company2.id,
        content: "Спасибо за ТО! Все отлично.",
        type: MessageType.TEXT,
        read: false,
      },
    ],
  });

  console.log("✅ Created messages");

  // Create reviews
  await prisma.review.createMany({
    data: [
      {
        clientId: client1.id,
        serviceId: service1.id,
        rating: 5,
        comment: "Отличная работа! Все сделано качественно и в срок. Рекомендую!",
      },
      {
        clientId: client2.id,
        serviceId: service2.id,
        rating: 4,
        comment: "Хороший сервис, но можно было бы быстрее. В целом довольна.",
      },
    ],
  });

  console.log("✅ Created reviews");

  // Create subscriptions
  await prisma.subscription.create({
    data: {
      userId: company1.id,
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-07-01"),
      autoRenew: true,
    },
  });

  console.log("✅ Created subscriptions");

  // Create transactions
  await prisma.transaction.create({
    data: {
      userId: company1.id,
      amount: 15000,
      currency: "KZT",
      type: "SUBSCRIPTION",
      status: "COMPLETED",
      description: "Подписка Premium на 6 месяцев",
    },
  });

  console.log("✅ Created transactions");

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

