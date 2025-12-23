import {
  PrismaClient,
  UserRole,
  ServiceCategory,
  RequestStatus,
  MessageType,
  SubscriptionPlan,
  SubscriptionStatus,
  TransactionStatus,
  TransactionType,
} from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clean previous seed data for idempotency
  const seedEmails = [
    "client1@remont.kz",
    "client2@remont.kz",
    "company1@remont.kz",
    "company2@remont.kz",
  ];
  await prisma.message.deleteMany({
    where: { sender: { email: { in: seedEmails } } },
  });
  await prisma.request.deleteMany({
    where: {
      OR: [{ client: { email: { in: seedEmails } } }, { company: { email: { in: seedEmails } } }],
    },
  });
  await prisma.review.deleteMany({
    where: { client: { email: { in: seedEmails } } },
  });
  await prisma.serviceImage.deleteMany({
    where: { service: { company: { email: { in: seedEmails } } } },
  });
  await prisma.service.deleteMany({
    where: { company: { email: { in: seedEmails } } },
  });
  await prisma.subscription.deleteMany({
    where: { user: { email: { in: seedEmails } } },
  });
  await prisma.transaction.deleteMany({
    where: { user: { email: { in: seedEmails } } },
  });

  // Create users
  const client1 = await prisma.user.upsert({
    where: { email: "client1@remont.kz" },
    update: {},
    create: {
      email: "client1@remont.kz",
      password: await hashPassword("Client123!"),
      role: UserRole.CLIENT,
      name: "Client One",
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
      name: "Client Two",
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

  console.log("✅ Users ready");

  // Seed services for each company
  const companyServices = [
    {
      companyId: company1.id,
      items: [
        {
          name: "Ремонт квартир под ключ",
          category: ServiceCategory.REAL_ESTATE,
          description: "Полный ремонт квартир. Дизайн, материалы, контроль качества.",
          priceFrom: 12000,
          priceTo: 30000,
          city: "Алматы",
          rating: 4.8,
          licensed: true,
          availabilityDays: 5,
          urgency: "medium",
          tags: ["Гарантия 12 мес", "Договор"],
          customAttributes: { warranty: "12 месяцев", payment: "Без предоплаты" },
          images: [
            "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          ],
        },
        {
          name: "Ремонт кухни",
          category: ServiceCategory.REAL_ESTATE,
          description: "Кухни под ключ: электрика, плитка, мебель.",
          priceFrom: 8000,
          priceTo: 20000,
          city: "Астана",
          rating: 4.6,
          licensed: true,
          availabilityDays: 7,
          urgency: "medium",
          tags: ["Дизайн", "Материалы включены"],
          customAttributes: { design: "Включен", supervision: "Да" },
          images: [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          ],
        },
        {
          name: "Клининг после ремонта",
          category: ServiceCategory.OTHER,
          description: "Глубокая уборка после ремонта, вывоз мусора.",
          priceFrom: 5000,
          priceTo: 12000,
          city: "Шымкент",
          rating: 4.4,
          licensed: false,
          availabilityDays: 2,
          urgency: "high",
          tags: ["Выезд быстро", "Химчистка"],
          customAttributes: { crew: "2-3 человека" },
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
          name: "ТО автомобилей",
          category: ServiceCategory.AUTOMOBILES,
          description: "Диагностика, замена масел и фильтров, ходовая.",
          priceFrom: 7000,
          priceTo: 25000,
          city: "Алматы",
          rating: 4.5,
          licensed: true,
          availabilityDays: 3,
          urgency: "high",
          tags: ["Гарантия", "Оригинальные запчасти"],
          customAttributes: { parts: "OEM", warranty: "6 месяцев" },
          images: [
            "https://images.unsplash.com/photo-1515920010264-05a0f6a4c28f",
            "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
          ],
        },
        {
          name: "Детейлинг",
          category: ServiceCategory.AUTOMOBILES,
          description: "Полный детейлинг, полировка, керамика.",
          priceFrom: 15000,
          priceTo: 45000,
          city: "Астана",
          rating: 4.7,
          licensed: true,
          availabilityDays: 4,
          urgency: "medium",
          tags: ["Керамика", "Полировка"],
          customAttributes: { wash: "2-фазная", coating: "Керамика 3 года" },
          images: [
            "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d",
          ],
        },
        {
          name: "Эвакуатор 24/7",
          category: ServiceCategory.OTHER,
          description: "Круглосуточный эвакуатор по городу и трассе.",
          priceFrom: 8000,
          priceTo: 18000,
          city: "Караганда",
          rating: 4.3,
          licensed: false,
          availabilityDays: 1,
          urgency: "high",
          tags: ["24/7", "Страховка"],
          customAttributes: { distance: "до 300 км" },
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
          ...item,
          companyId: group.companyId,
          images: {
            create: item.images.map((url, order) => ({ url, order })),
          },
        },
      });
      services.push(service);
    }
  }

  console.log("✅ Services seeded");

  // Requests across cities and statuses
  const [serviceA1, serviceA2, serviceA3, serviceB1, serviceB2, serviceB3] = services;

  const requestData = [
    {
      clientId: client1.id,
      serviceId: serviceA1.id,
      companyId: company1.id,
      message: "Нужен ремонт квартиры 60 кв.м. в Алматы. Сроки 2 месяца.",
      status: RequestStatus.NEW,
    },
    {
      clientId: client2.id,
      serviceId: serviceA2.id,
      companyId: company1.id,
      message: "Кухня под ключ, Астана. Бюджет до 2 млн.",
      status: RequestStatus.IN_PROGRESS,
    },
    {
      clientId: client1.id,
      serviceId: serviceA3.id,
      companyId: company1.id,
      message: "Уборка после ремонта, Шымкент.",
      status: RequestStatus.COMPLETED,
    },
    {
      clientId: client2.id,
      serviceId: serviceB1.id,
      companyId: company2.id,
      message: "ТО Camry 2021, Алматы.",
      status: RequestStatus.NEW,
    },
    {
      clientId: client1.id,
      serviceId: serviceB2.id,
      companyId: company2.id,
      message: "Детейлинг, Астана. Нужна керамика.",
      status: RequestStatus.IN_PROGRESS,
    },
    {
      clientId: client2.id,
      serviceId: serviceB3.id,
      companyId: company2.id,
      message: "Эвакуатор из Караганды в Астану.",
      status: RequestStatus.COMPLETED,
    },
  ];

  const requests = await prisma.request.createMany({
    data: requestData,
  });

  console.log("✅ Requests seeded");

  // Messages (text, image, audio placeholders)
  const createdRequests = await prisma.request.findMany({
    where: { clientId: { in: [client1.id, client2.id] } },
  });
  const reqByStatus = Object.fromEntries(createdRequests.map((r) => [r.status, r.id]));
  const anyRequestId = createdRequests[0]?.id;

  await prisma.message.createMany({
    data: [
      {
        requestId: anyRequestId,
        senderId: client1.id,
        receiverId: company1.id,
        content: "Здравствуйте! Когда можем начать?",
        type: MessageType.TEXT,
        read: false,
      },
      {
        requestId: anyRequestId,
        senderId: company1.id,
        receiverId: client1.id,
        content: "Есть слот на следующей неделе.",
        type: MessageType.TEXT,
        read: true,
      },
      {
        requestId: anyRequestId,
        senderId: client1.id,
        receiverId: company1.id,
        content: "Фото помещения",
        type: MessageType.IMAGE,
        imageUrl: "https://placehold.co/600x400?text=Room",
        read: true,
      },
      {
        requestId: anyRequestId,
        senderId: company1.id,
        receiverId: client1.id,
        content: "Аудио комментарий",
        type: MessageType.AUDIO,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        read: true,
      },
    ],
  });

  console.log("✅ Messages seeded");

  // Reviews
  await prisma.review.createMany({
    data: [
      {
        clientId: client1.id,
        serviceId: serviceA1.id,
        rating: 5,
        comment: "Отлично справились, рекомендую.",
      },
      {
        clientId: client2.id,
        serviceId: serviceB1.id,
        rating: 4,
        comment: "Хороший сервис, всё по записи.",
      },
      {
        clientId: client1.id,
        serviceId: serviceB2.id,
        rating: 5,
        comment: "Детейлинг на уровне, блеск!",
      },
    ],
  });

  console.log("✅ Reviews seeded");

  // Subscriptions (monthly, quarterly, semiannual, yearly equivalents mapped to plans)
  const now = new Date();
  const addDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  await prisma.subscription.createMany({
    data: [
      {
        userId: company1.id,
        plan: SubscriptionPlan.BASIC, // monthly
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: addDays(30),
        autoRenew: true,
      },
      {
        userId: company1.id,
        plan: SubscriptionPlan.PREMIUM, // quarterly
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: addDays(90),
        autoRenew: true,
      },
      {
        userId: company2.id,
        plan: SubscriptionPlan.PREMIUM, // semiannual
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: addDays(180),
        autoRenew: true,
      },
      {
        userId: company2.id,
        plan: SubscriptionPlan.ENTERPRISE, // yearly
        status: SubscriptionStatus.ACTIVE,
        startDate: now,
        endDate: addDays(365),
        autoRenew: true,
      },
    ],
  });

  console.log("✅ Subscriptions seeded");

  // Transactions & analytics-friendly data
  await prisma.transaction.createMany({
    data: [
      {
        userId: company1.id,
        amount: 15000,
        currency: "KZT",
        type: TransactionType.SUBSCRIPTION,
        status: TransactionStatus.COMPLETED,
        description: "Подписка BASIC",
      },
      {
        userId: company1.id,
        amount: 45000,
        currency: "KZT",
        type: TransactionType.SUBSCRIPTION,
        status: TransactionStatus.COMPLETED,
        description: "Подписка PREMIUM",
      },
      {
        userId: company2.id,
        amount: 90000,
        currency: "KZT",
        type: TransactionType.SUBSCRIPTION,
        status: TransactionStatus.COMPLETED,
        description: "Подписка ENTERPRISE",
      },
    ],
  });

  console.log("✅ Transactions seeded");

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


