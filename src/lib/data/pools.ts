export const FIRST_NAMES = [
  "Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas",
  "Mia", "Jack", "Amelia", "Aiden", "Harper", "Elijah", "Evelyn", "Logan", "Abigail", "James",
  "Ella", "Benjamin", "Scarlett", "Henry", "Grace", "Sebastian", "Chloe", "Owen", "Victoria", "Daniel",
  "Riley", "Matthew", "Zoey", "Wyatt", "Nora", "Leo", "Lily", "David", "Hannah", "Julian",
  "Layla", "Isaac", "Aria", "Levi", "Zara", "Gabriel", "Maya", "Carter", "Ruby", "Anthony",
  "Ivy", "Dylan", "Nova", "Adrian", "Willow", "Christian", "Aurora", "Jaxon", "Sofia", "Nathan",
  "Camila", "Ryan", "Penelope", "Kai", "Naomi", "Jonah", "Elena", "Miles", "Freya", "Xavier",
  "Iris", "Hudson", "Autumn", "Cole", "Skylar", "Ezra", "Violet", "Theo", "Josephine", "Rafael",
  "Leilani", "Marcus", "Anaya", "Diego", "Amara", "Felix", "Delilah", "Omar", "Rosalie", "Jasper",
  "Selena", "Micah", "Wren", "Beau", "Juniper", "Tobias", "Clara", "Andres", "Mila", "Kian",
];

export const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
  "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
  "Diaz", "Cruz", "Reyes", "Morris", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera",
  "Cooper", "Richardson", "Cox", "Howard", "Ward", "Peterson", "Gray", "Ramos", "James", "Watson",
];

export const REGIONS = [
  { id: "reg-west", name: "West Coast" },
  { id: "reg-central", name: "Central" },
  { id: "reg-east", name: "East Coast" },
];

export const STORE_META: {
  code: string;
  name: string;
  city: string;
  regionId: string;
  format: "QSR" | "Casual Dining" | "Café" | "Hotel F&B";
}[] = [
  { code: "KUK-101", name: "KÜKIE Downtown Flagship", city: "Los Angeles, CA", regionId: "reg-west", format: "Casual Dining" },
  { code: "KUK-102", name: "KÜKIE Harbor Point", city: "San Diego, CA", regionId: "reg-west", format: "QSR" },
  { code: "KUK-103", name: "KÜKIE Riverside Café", city: "Sacramento, CA", regionId: "reg-west", format: "Café" },
  { code: "KUK-104", name: "KÜKIE Skyline Hotel Grill", city: "Seattle, WA", regionId: "reg-west", format: "Hotel F&B" },
  { code: "KUK-201", name: "KÜKIE Union Station", city: "Chicago, IL", regionId: "reg-central", format: "QSR" },
  { code: "KUK-202", name: "KÜKIE Lakeside Bistro", city: "Minneapolis, MN", regionId: "reg-central", format: "Casual Dining" },
  { code: "KUK-203", name: "KÜKIE Midtown Café", city: "Austin, TX", regionId: "reg-central", format: "Café" },
  { code: "KUK-204", name: "KÜKIE Grand Plaza Hotel", city: "Dallas, TX", regionId: "reg-central", format: "Hotel F&B" },
  { code: "KUK-301", name: "KÜKIE Times Square", city: "New York, NY", regionId: "reg-east", format: "QSR" },
  { code: "KUK-302", name: "KÜKIE Waterfront Kitchen", city: "Boston, MA", regionId: "reg-east", format: "Casual Dining" },
  { code: "KUK-303", name: "KÜKIE Old Town Café", city: "Philadelphia, PA", regionId: "reg-east", format: "Café" },
  { code: "KUK-304", name: "KÜKIE Regency Hotel Dining", city: "Miami, FL", regionId: "reg-east", format: "Hotel F&B" },
];

export const ROLES: ("Server" | "Barista" | "Host" | "Shift Lead" | "Cashier" | "Bartender")[] = [
  "Server", "Barista", "Host", "Shift Lead", "Cashier", "Bartender",
];

export const TRAINER_NAMES = [
  { name: "Renee Whitfield", regionId: "reg-west" },
  { name: "Marcus Ibe", regionId: "reg-central" },
  { name: "Priya Anand", regionId: "reg-east" },
  { name: "Sam Delacroix", regionId: "reg-west" },
];
