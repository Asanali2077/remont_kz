const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "messages");

const additions = {
  en: {
    requests: {
      offerMessagePlaceholder: "Timeline, approach, guarantees…",
    },
    company: {
      photos: "Photos",
      photosHint: "Add up to {max} photos. Hover to remove.",
      addPhoto: "Add",
      serviceName: "Service name",
      serviceCategory: "Service category",
      addressOptional: "optional — shows map on card",
      tags: "Tags",
      tagsHint: "helps clients find you · max 10",
      tagsPlaceholder: "e.g. plumbing, renovation, emergency",
      addTag: "Add",
      startDate: "Start date",
      endDate: "End date",
      fixedPrice: "Fixed price (single rate)",
      price: "Price",
      priceFrom: "Price from",
      priceTo: "Price to",
      uploading: "Uploading…",
      createBtn: "Create",
      addressPlaceholder: "e.g. Almaty, Abay Ave 52",
      newBadge: "new",
    },
  },
  ru: {
    requests: {
      offerMessagePlaceholder: "Сроки, подход, гарантии…",
    },
    company: {
      photos: "Фотографии",
      photosHint: "До {max} фото. Наведите курсор для удаления.",
      addPhoto: "Добавить",
      serviceName: "Название услуги",
      serviceCategory: "Категория услуги",
      addressOptional: "необязательно — показывает карту на карточке",
      tags: "Теги",
      tagsHint: "помогают клиентам найти вас · макс. 10",
      tagsPlaceholder: "напр. сантехника, ремонт, аварийный",
      addTag: "Добавить",
      startDate: "Дата начала",
      endDate: "Дата окончания",
      fixedPrice: "Фиксированная цена (единый тариф)",
      price: "Цена",
      priceFrom: "Цена от",
      priceTo: "Цена до",
      uploading: "Загрузка…",
      createBtn: "Создать",
      addressPlaceholder: "напр. Алматы, пр. Абая 52",
      newBadge: "новое",
    },
  },
  kk: {
    requests: {
      offerMessagePlaceholder: "Мерзімдер, тәсіл, кепілдіктер…",
    },
    company: {
      photos: "Фотолар",
      photosHint: "{max} фотоға дейін. Жою үшін үстіне апарыңыз.",
      addPhoto: "Қосу",
      serviceName: "Қызмет атауы",
      serviceCategory: "Қызмет санаты",
      addressOptional: "міндетті емес — картада карта көрсетеді",
      tags: "Тегтер",
      tagsHint: "клиенттерге табуға көмектеседі · макс. 10",
      tagsPlaceholder: "мысалы сантехника, жөндеу, шұғыл",
      addTag: "Қосу",
      startDate: "Басталу күні",
      endDate: "Аяқталу күні",
      fixedPrice: "Тіркелген баға (бір тариф)",
      price: "Баға",
      priceFrom: "Баға (бастап)",
      priceTo: "Баға (дейін)",
      uploading: "Жүктелуде…",
      createBtn: "Жасау",
      addressPlaceholder: "мысалы Алматы, Абай д-лы 52",
      newBadge: "жаңа",
    },
  },
};

for (const [locale, namespaces] of Object.entries(additions)) {
  const fp = path.join(dir, locale + ".json");
  const data = JSON.parse(fs.readFileSync(fp, "utf8"));
  for (const [ns, keys] of Object.entries(namespaces)) {
    data[ns] = { ...data[ns], ...keys };
  }
  fs.writeFileSync(fp, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${locale}.json`);
}
console.log("Done!");
