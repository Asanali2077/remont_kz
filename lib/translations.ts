export type Lang = "ru" | "kaz";

export interface Translations {
  // Common
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    all: string;
    yes: string;
    no: string;
  };
  // Auth
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    selectRole: string;
    client: string;
    company: string;
    continue: string;
    haveAccount: string;
    noAccount: string;
  };
  // Navigation
  nav: {
    home: string;
    favorites: string;
    messages: string;
    balance: string;
    cabinet: string;
    submitAd: string;
    dashboard: string;
    services: string;
    requests: string;
    reviews: string;
    analytics: string;
    account: string;
  };
  // Services
  services: {
    title: string;
    addService: string;
    editService: string;
    deleteService: string;
    name: string;
    category: string;
    description: string;
    priceFrom: string;
    priceTo: string;
    city: string;
    rating: string;
    licensed: string;
    availabilityDays: string;
    urgency: string;
    tags: string;
    active: string;
    inactive: string;
    images: string;
    uploadImages: string;
  };
  // Requests
  requests: {
    title: string;
    new: string;
    inProgress: string;
    completed: string;
    respond: string;
    status: string;
    filterByStatus: string;
  };
  // Messages
  messages: {
    title: string;
    send: string;
    typeMessage: string;
    conversations: string;
    uploadImage: string;
    uploadAudio: string;
    recordAudio: string;
  };
  // Analytics
  analytics: {
    title: string;
    totalServices: string;
    completedRequests: string;
    pendingRequests: string;
    revenue: string;
    requestsByStatus: string;
    requestsByService: string;
    revenueByMonth: string;
    requestsByCity: string;
  };
  // Account
  account: {
    title: string;
    subscription: string;
    transactions: string;
    currentPlan: string;
    selectPlan: string;
    monthly: string;
    quarterly: string;
    semiannual: string;
    yearly: string;
  };
}

const translations: Record<Lang, Translations> = {
  ru: {
    common: {
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      cancel: "Отмена",
      save: "Сохранить",
      delete: "Удалить",
      edit: "Редактировать",
      add: "Добавить",
      search: "Поиск",
      filter: "Фильтр",
      all: "Все",
      yes: "Да",
      no: "Нет",
    },
    auth: {
      login: "Войти",
      register: "Регистрация",
      logout: "Выйти",
      email: "Email",
      password: "Пароль",
      confirmPassword: "Повтор пароля",
      selectRole: "Выберите тип аккаунта",
      client: "Клиент",
      company: "Компания",
      continue: "Продолжить",
      haveAccount: "У меня есть аккаунт",
      noAccount: "Регистрация",
    },
    nav: {
      home: "Главная",
      favorites: "Избранное",
      messages: "Сообщения",
      balance: "Пополнить счёт",
      cabinet: "Кабинет",
      submitAd: "Подать объявление",
      dashboard: "Панель управления",
      services: "Услуги",
      requests: "Заявки",
      reviews: "Отзывы",
      analytics: "Аналитика",
      account: "Аккаунт",
    },
    services: {
      title: "Мои услуги",
      addService: "Добавить услугу",
      editService: "Редактировать услугу",
      deleteService: "Удалить услугу",
      name: "Название услуги",
      category: "Категория",
      description: "Описание",
      priceFrom: "Цена от (₸)",
      priceTo: "Цена до (₸)",
      city: "Город",
      rating: "Рейтинг",
      licensed: "Лицензированная деятельность",
      availabilityDays: "Доступность (дней)",
      urgency: "Срочность",
      tags: "Теги",
      active: "Активна",
      inactive: "Неактивна",
      images: "Фотографии",
      uploadImages: "Загрузить фотографии",
    },
    requests: {
      title: "Заявки клиентов",
      new: "Новая",
      inProgress: "В работе",
      completed: "Завершена",
      respond: "Ответить",
      status: "Статус",
      filterByStatus: "Фильтр по статусу",
    },
    messages: {
      title: "Сообщения",
      send: "Отправить",
      typeMessage: "Написать сообщение...",
      conversations: "Диалоги",
      uploadImage: "Отправить изображение",
      uploadAudio: "Отправить аудио файл",
      recordAudio: "Записать голосовое сообщение",
    },
    analytics: {
      title: "Аналитика",
      totalServices: "Всего услуг",
      completedRequests: "Завершено",
      pendingRequests: "В ожидании",
      revenue: "Доход",
      requestsByStatus: "Заявки по статусу",
      requestsByService: "Заявки по услугам",
      revenueByMonth: "Доход по месяцам",
      requestsByCity: "Заявки по городам",
    },
    account: {
      title: "Личный кабинет",
      subscription: "Подписка",
      transactions: "Транзакции",
      currentPlan: "Текущий план",
      selectPlan: "Выбрать план",
      monthly: "Месяц",
      quarterly: "3 месяца",
      semiannual: "6 месяцев",
      yearly: "Год",
    },
  },
  kaz: {
    common: {
      loading: "Жүктелуде...",
      error: "Қате",
      success: "Сәтті",
      cancel: "Болдырмау",
      save: "Сақтау",
      delete: "Жою",
      edit: "Өңдеу",
      add: "Қосу",
      search: "Іздеу",
      filter: "Сүзгі",
      all: "Барлығы",
      yes: "Иә",
      no: "Жоқ",
    },
    auth: {
      login: "Кіру",
      register: "Тіркелу",
      logout: "Шығу",
      email: "Email",
      password: "Құпия сөз",
      confirmPassword: "Құпия сөзді қайталау",
      selectRole: "Есептік жазба түрін таңдаңыз",
      client: "Клиент",
      company: "Компания",
      continue: "Жалғастыру",
      haveAccount: "Менде есептік жазба бар",
      noAccount: "Тіркелу",
    },
    nav: {
      home: "Басты бет",
      favorites: "Таңдаулылар",
      messages: "Хабарламалар",
      balance: "Есепті толтыру",
      cabinet: "Кабинет",
      submitAd: "Хабарлама беру",
      dashboard: "Басқару панелі",
      services: "Қызметтер",
      requests: "Өтініштер",
      reviews: "Пікірлер",
      analytics: "Аналитика",
      account: "Есептік жазба",
    },
    services: {
      title: "Менің қызметтерім",
      addService: "Қызмет қосу",
      editService: "Қызметті өңдеу",
      deleteService: "Қызметті жою",
      name: "Қызмет атауы",
      category: "Категория",
      description: "Сипаттама",
      priceFrom: "Бастапқы баға (₸)",
      priceTo: "Соңғы баға (₸)",
      city: "Қала",
      rating: "Рейтинг",
      licensed: "Лицензияланған қызмет",
      availabilityDays: "Қолжетімділік (күн)",
      urgency: "Шұғылдық",
      tags: "Тегтер",
      active: "Белсенді",
      inactive: "Белсенді емес",
      images: "Фотосуреттер",
      uploadImages: "Фотосуреттерді жүктеу",
    },
    requests: {
      title: "Клиенттердің өтініштері",
      new: "Жаңа",
      inProgress: "Жұмыс істеуде",
      completed: "Аяқталды",
      respond: "Жауап беру",
      status: "Күйі",
      filterByStatus: "Күй бойынша сүзгі",
    },
    messages: {
      title: "Хабарламалар",
      send: "Жіберу",
      typeMessage: "Хабарлама жазу...",
      conversations: "Диалогтар",
      uploadImage: "Сурет жіберу",
      uploadAudio: "Аудио файл жіберу",
      recordAudio: "Дауыстық хабарлама жазу",
    },
    analytics: {
      title: "Аналитика",
      totalServices: "Барлық қызметтер",
      completedRequests: "Аяқталды",
      pendingRequests: "Күтуде",
      revenue: "Табыс",
      requestsByStatus: "Күй бойынша өтініштер",
      requestsByService: "Қызмет бойынша өтініштер",
      revenueByMonth: "Ай бойынша табыс",
      requestsByCity: "Қала бойынша өтініштер",
    },
    account: {
      title: "Жеке кабинет",
      subscription: "Жазылым",
      transactions: "Транзакциялар",
      currentPlan: "Ағымдағы жоспар",
      selectPlan: "Жоспарды таңдау",
      monthly: "Ай",
      quarterly: "3 ай",
      semiannual: "6 ай",
      yearly: "Жыл",
    },
  },
};

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
}

export function t(lang: Lang): Translations {
  return translations[lang];
}


