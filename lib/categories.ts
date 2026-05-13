export type TopCategory = "AUTOMOBILES" | "REAL_ESTATE" | "OTHER";

export type CategoryHierarchy = {
  [topCategory in TopCategory]: {
    [group: string]: {
      [subcategory: string]: string[];
    };
  };
};

export const SERVICE_CATEGORIES: CategoryHierarchy = {
  AUTOMOBILES: {
    Repair: {
      "Engine & Transmission": [
        "Engine repair",
        "Engine overhaul",
        "Engine replacement",
        "Turbo repair",
        "Timing belt repair",
        "Gearbox repair",
        "Clutch repair",
        "Gearbox oil change",
      ],
      "Suspension": [
        "Suspension repair",
        "Shock absorber replacement",
        "Steering rack repair",
        "Ball joint & bushing replacement",
        "Hub repair",
      ],
      "Brakes": [
        "Brake pad replacement",
        "Brake disc replacement",
        "Caliper repair",
        "Brake bleeding",
      ],
      "Fuel System": [
        "Injector cleaning",
        "Fuel pump repair",
        "High-pressure pump repair",
      ],
      "Cooling System": [
        "Radiator repair",
        "Coolant change",
        "Water pump repair",
        "Overheating fix",
      ],
      "Electrics & Electronics": [
        "Auto electrician",
        "ECU repair",
        "Starter repair",
        "Alternator repair",
        "Wiring repair",
      ],
      "Body & Exterior": [
        "Body repair",
        "Bumper repair",
        "Dent removal (PDR)",
        "Full repaint",
        "Spot painting",
      ],
      "Glass": [
        "Auto glass repair",
        "Glass replacement",
        "Chip repair",
      ],
    },
    Maintenance: {
      "Service": [
        "Oil & fluid change",
        "Technical inspection",
        "Pre-sale inspection",
      ],
      "Logistics": [
        "Tow truck",
        "Vehicle delivery",
      ],
      "Car Care": [
        "Car wash",
        "Interior dry cleaning",
      ],
      "Tyres": [
        "Tyre fitting",
        "Wheel balancing",
        "Tyre storage",
      ],
      "Documents": [
        "Auto insurance",
        "Vehicle inspection",
        "Vehicle registration",
      ],
    },
    Tuning: {
      "Exterior": [
        "Airbrush",
        "Body kits",
        "Spoilers",
        "Vinyl wrap",
      ],
      "Lighting": [
        "Xenon installation",
        "LED upgrade",
        "Headlight tuning",
      ],
      "Interior": [
        "Interior reupholstery",
        "Seat covers",
      ],
      "Audio": [
        "Car audio",
        "Subwoofer",
        "Sound deadening",
      ],
      "Electronics": [
        "Car alarm",
        "GPS tracker",
        "Cameras",
        "Parking sensors",
      ],
      "Performance": [
        "Chip tuning",
        "Engine upgrade",
        "Exhaust tuning",
      ],
    },
    Detailing: {
      "Premium Care": [
        "Body polishing",
        "Ceramic coating",
        "PPF film",
        "Rain repellent",
        "Leather protection",
        "Engine wash",
      ],
    },
    Diagnostics: {
      "General Diagnostics": [
        "Computer diagnostics",
        "Engine diagnostics",
        "Suspension diagnostics",
        "VIN check",
        "Mileage check",
      ],
    },
    "Commercial Vehicles": {
      "Commercial Transport": [
        "Truck repair",
        "Bus repair",
        "Fleet maintenance",
      ],
      "Moto & Special": [
        "Motorcycle repair",
        "Scooter repair",
        "ATV repair",
      ],
    },
    Other: {
      "Miscellaneous": [
        "Consultation",
        "Car selection",
        "Auto lawyer",
        "Car valuation",
      ],
    },
  },

  REAL_ESTATE: {
    "Renovation & Construction": {
      "General Renovation": [
        "Cosmetic renovation",
        "Major renovation",
        "Turnkey renovation",
        "Partial renovation",
        "Replanning",
        "Demolition",
        "Finishing works",
      ],
      "Finishing": [
        "Plastering",
        "Painting",
        "Wallpapering",
        "Drywall",
        "Ceiling works",
        "Stretch ceiling",
        "Floor screed",
        "Tile laying",
        "Floor covering",
        "Skirting boards",
        "Soundproofing",
        "Waterproofing",
      ],
    },
    Plumbing: {
      "Plumbing Works": [
        "Pipe installation",
        "Leak repair",
        "Faucet installation",
        "Toilet installation",
        "Shower installation",
        "Boiler repair",
        "Drain cleaning",
        "Clog removal",
        "Water filters",
        "Radiator installation",
      ],
    },
    Electrical: {
      "Electrical Works": [
        "Wiring installation",
        "Socket installation",
        "Switch installation",
        "Lighting installation",
        "Panel assembly",
        "Diagnostics",
        "Smart home",
        "Generator installation",
        "UPS installation",
      ],
    },
    "HVAC & Climate": {
      "HVAC": [
        "AC installation",
        "AC maintenance",
        "Ventilation",
        "Heating systems",
        "Boiler equipment",
        "Thermostat",
        "Underfloor heating",
        "Duct cleaning",
      ],
    },
    "Furniture & Assembly": {
      "Assembly & Installation": [
        "Furniture assembly",
        "Kitchen installation",
        "Wardrobe installation",
        "Wall mounting",
        "Office setup",
        "Furniture disassembly",
      ],
    },
    "Appliance Repair": {
      "Home Appliances": [
        "Washing machine repair",
        "Dishwasher repair",
        "Refrigerator repair",
        "Oven repair",
        "Stove repair",
        "Microwave repair",
        "Dryer repair",
      ],
    },
    Cleaning: {
      "Cleaning": [
        "Deep cleaning",
        "Post-renovation cleaning",
        "Move-out cleaning",
        "Carpet cleaning",
        "Window washing",
        "Sofa dry cleaning",
        "Disinfection",
        "Mould removal",
      ],
    },
    Moving: {
      "Freight": [
        "Apartment move",
        "Office move",
        "Packing",
        "Furniture transport",
        "Movers",
        "Storage",
      ],
    },
    "Interior Design": {
      "Design": [
        "Interior design",
        "3D visualization",
        "Floor plan",
        "Lighting design",
        "Decor",
      ],
    },
    "Exterior Works": {
      "Facade & Roofing": [
        "Facade works",
        "Roof repair",
        "Gutter installation",
        "Landscaping",
        "Fence installation",
        "Exterior tiling",
        "Garage construction",
      ],
    },
    "Windows & Doors": {
      "Installation": [
        "Window installation",
        "Window repair",
        "Glass replacement",
        "Door installation",
        "Lock installation",
        "Insulation",
      ],
    },
    "Smart Home & Security": {
      "Security Systems": [
        "CCTV",
        "Alarm system",
        "Intercom",
        "Smart home",
        "Sensors",
        "Access control",
      ],
    },
    "Minor Repairs": {
      "One-time Jobs": [
        "Hang a shelf",
        "Hang a curtain rod",
        "Minor repair",
        "Crack filling",
        "Door repair",
        "Fix furniture",
      ],
    },
    "Emergency Services": {
      "Emergency Call": [
        "Emergency plumber",
        "Emergency electrician",
        "Lock opening",
        "Leak fix",
        "Power restoration",
      ],
    },
    "Property Maintenance": {
      "Maintenance": [
        "Property inspection",
        "Seasonal maintenance",
        "Condition check",
        "Preventive maintenance",
      ],
    },
    Specialised: {
      "Special Works": [
        "Pest control",
        "Mould removal",
        "Fire damage restoration",
        "Flood damage restoration",
        "Studio soundproofing",
        "Server room",
      ],
    },
  },

  OTHER: {
    "Mobile & Gadgets": {
      "Repair": [
        "Smartphone repair",
        "Screen replacement",
        "Battery replacement",
        "Charging port repair",
        "Button repair",
        "Camera repair",
        "Water damage recovery",
        "Firmware flash",
      ],
    },
    "Computers & IT": {
      "Repair": [
        "Laptop repair",
        "PC repair",
        "Parts replacement",
        "Dust cleaning",
        "Thermal paste replacement",
        "Motherboard repair",
        "Data recovery",
        "OS installation",
      ],
    },
    "TVs & Audio": {
      "Repair": [
        "TV repair",
        "Monitor repair",
        "Audio system repair",
        "Speaker repair",
        "Amplifier repair",
        "Home theatre installation",
      ],
    },
    "Consumer Electronics": {
      "Repair": [
        "Microwave repair",
        "Vacuum cleaner repair",
        "Iron repair",
        "Coffee machine repair",
        "Blender repair",
        "Heater repair",
        "Fan repair",
      ],
    },
    "Wearables": {
      "Repair": [
        "Smartwatch repair",
        "Headphone repair",
        "Gamepad repair",
        "VR device repair",
      ],
    },
    "Gaming & Consoles": {
      "Repair": [
        "Console repair",
        "Gamepad repair",
        "Gaming PC repair",
        "Cleaning & maintenance",
      ],
    },
    "Office Equipment": {
      "Repair": [
        "Printer repair",
        "Scanner repair",
        "Copier repair",
        "Cartridge refill",
        "MFP maintenance",
      ],
    },
    "Industrial Equipment": {
      "Repair": [
        "POS terminal repair",
        "Cash register repair",
        "Server repair",
        "Network equipment repair",
      ],
    },
    "Tools": {
      "Repair": [
        "Power tool repair",
        "Drill repair",
        "Rotary hammer repair",
        "Angle grinder repair",
        "Generator repair",
        "Compressor repair",
      ],
    },
    "Transport": {
      "Repair": [
        "Bicycle repair",
        "Scooter repair",
        "E-scooter repair",
        "Hoverboard repair",
      ],
    },
    "Jewellery & Watches": {
      "Repair": [
        "Watch repair",
        "Watch battery replacement",
        "Jewellery repair",
        "Jewellery polishing",
      ],
    },
    "Clothing & Footwear": {
      "Repair": [
        "Clothing repair",
        "Clothing alteration",
        "Shoe repair",
        "Bag repair",
      ],
    },
    "Furniture": {
      "Repair": [
        "Furniture repair",
        "Furniture restoration",
        "Furniture reupholstery",
        "Sofa repair",
        "Chair repair",
      ],
    },
    Other: {
      "Miscellaneous": [
        "Custom repair",
        "One-time tasks",
        "Handyman",
      ],
    },
  },
};

export const TOP_CATEGORY_LABELS: Record<TopCategory, string> = {
  AUTOMOBILES: "Automobiles",
  REAL_ESTATE: "Real Estate",
  OTHER: "Other",
};

/** All groups for a given top-category */
export function getCategoryGroups(category: TopCategory): string[] {
  return Object.keys(SERVICE_CATEGORIES[category] ?? {});
}

/** All subcategories for a group */
export function getSubcategories(category: TopCategory, group: string): string[] {
  return Object.keys(SERVICE_CATEGORIES[category]?.[group] ?? {});
}

/** Specific services for a subcategory */
export function getServices(category: TopCategory, group: string, subcategory: string): string[] {
  return SERVICE_CATEGORIES[category]?.[group]?.[subcategory] ?? [];
}

/** All specific services for a category (for search/tags) */
export function getAllServicesForCategory(category: TopCategory): string[] {
  const groups = SERVICE_CATEGORIES[category];
  if (!groups) return [];
  return Object.values(groups).flatMap((subs) =>
    Object.values(subs).flatMap((services) => services)
  );
}

/** Lowercase string → TopCategory mapping (for URL params) */
export function categoryFromParam(param: string): TopCategory | undefined {
  const map: Record<string, TopCategory> = {
    automobiles: "AUTOMOBILES",
    real_estate: "REAL_ESTATE",
    real_estate_: "REAL_ESTATE",
    other: "OTHER",
  };
  return map[param.toLowerCase()];
}
