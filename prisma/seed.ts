import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient, type BookingStatus } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { APPROVAL_HOURS } from "../lib/constants";
import { generateBookingReference } from "../lib/booking-reference";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const SEED_PASSWORD = "TurfAura123!";

// From an earlier version of this script, before real Supabase Auth users
// were wired up — this fake id can't log in, so wipe it (and its pitches,
// via cascade) if it's still around.
const STALE_PLACEHOLDER_SUPABASE_ID = "00000000-0000-0000-0000-000000000001";

async function getOrCreateAuthUser(email: string, name: string): Promise<string> {
  const { data: list, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`Could not list Supabase users: ${listError.message}`);

  const existing = list.users.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
    user_metadata: { name },
  });
  if (error || !data.user) throw new Error(`Could not create Supabase user ${email}: ${error?.message}`);
  return data.user.id;
}

async function deleteAuthUserByEmail(email: string): Promise<void> {
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = list?.users.find((u) => u.email === email);
  if (existing) await supabaseAdmin.auth.admin.deleteUser(existing.id);
}

// These owner accounts were renamed (Senegal -> Gambia demo data). Clean up
// the old ones — deleting the Owner row cascades to their old pitches,
// bookings, and photos — so re-seeding doesn't leave stale duplicates behind.
const RETIRED_EMAILS = ["aicha@turfaura.dev", "moussa@turfaura.dev"];

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
}

// Gambian names — Wolof, Mandinka, and Fula surnames common across the country.
const CUSTOMERS = [
  { name: "Lamin Sanneh", phone: "+2207701001" },
  { name: "Fatoumata Jallow", phone: "+2207701002" },
  { name: "Ebrima Touray", phone: "+2207701003" },
  { name: "Awa Bojang", phone: "+2207701004" },
  { name: "Modou Ceesay", phone: "+2207701005" },
  { name: "Isatou Jarju", phone: "+2207701006" },
  { name: "Ousman Sanyang", phone: "+2207701007" },
  { name: "Mariama Colley", phone: "+2207701008" },
  { name: "Bakary Faal", phone: "+2207701009" },
  { name: "Njemeh Jammeh", phone: "+2207701010" },
];

// Bookings reference their pitch with onDelete: Restrict (deliberately — see
// the schema), so a pitch with any booking history can't be deleted until
// its bookings are gone first. Wipe bookings, then pitches, for an owner.
async function wipeOwnerPitches(ownerId: string): Promise<void> {
  const pitchIds = (await prisma.pitch.findMany({ where: { ownerId }, select: { id: true } })).map((p) => p.id);
  if (pitchIds.length === 0) return;
  await prisma.booking.deleteMany({ where: { pitchId: { in: pitchIds } } });
  await prisma.pitch.deleteMany({ where: { ownerId } });
}

async function main() {
  await prisma.owner.deleteMany({ where: { supabaseUserId: STALE_PLACEHOLDER_SUPABASE_ID } });

  for (const email of RETIRED_EMAILS) {
    const retired = await prisma.owner.findUnique({ where: { email } });
    if (retired) {
      await wipeOwnerPitches(retired.id);
      await prisma.owner.delete({ where: { id: retired.id } });
    }
    await deleteAuthUserByEmail(email);
  }

  console.log("Creating Supabase Auth users...");
  const adminAuthId = await getOrCreateAuthUser("admin@turfaura.dev", "TurfAura Admin");
  const owner1AuthId = await getOrCreateAuthUser("aisha@turfaura.dev", "Aisha Jallow");
  const owner2AuthId = await getOrCreateAuthUser("momodou@turfaura.dev", "Momodou Ceesay");
  const owner3AuthId = await getOrCreateAuthUser("fatou@turfaura.dev", "Fatou Bojang");

  await prisma.owner.upsert({
    where: { supabaseUserId: adminAuthId },
    update: { name: "TurfAura Admin", role: "ADMIN" },
    create: { supabaseUserId: adminAuthId, name: "TurfAura Admin", email: "admin@turfaura.dev", role: "ADMIN" },
  });
  const owner1 = await prisma.owner.upsert({
    where: { supabaseUserId: owner1AuthId },
    update: { name: "Aisha Jallow", phone: "+2207001234" },
    create: {
      supabaseUserId: owner1AuthId,
      name: "Aisha Jallow",
      email: "aisha@turfaura.dev",
      phone: "+2207001234",
    },
  });
  const owner2 = await prisma.owner.upsert({
    where: { supabaseUserId: owner2AuthId },
    update: { name: "Momodou Ceesay", phone: "+2207002345" },
    create: {
      supabaseUserId: owner2AuthId,
      name: "Momodou Ceesay",
      email: "momodou@turfaura.dev",
      phone: "+2207002345",
    },
  });
  const owner3 = await prisma.owner.upsert({
    where: { supabaseUserId: owner3AuthId },
    update: { name: "Fatou Bojang", phone: "+2207003456" },
    create: {
      supabaseUserId: owner3AuthId,
      name: "Fatou Bojang",
      email: "fatou@turfaura.dev",
      phone: "+2207003456",
    },
  });

  // Every pitch below uses a new slug (Gambia locations), so clear out any
  // pitches still on file under the old (Senegal demo) slugs before
  // recreating — otherwise they'd sit around as orphaned duplicates.
  for (const owner of [owner1, owner2, owner3]) {
    await wipeOwnerPitches(owner.id);
  }

  console.log("Creating pitches...");
  const pitchDefs = [
    {
      ownerId: owner1.id,
      slug: "serekunda-turf-arena",
      name: "Serekunda Turf Arena",
      type: "FIVE_A_SIDE" as const,
      description: "Floodlit artificial turf in the heart of Serekunda, five-a-side.",
      address: "Sayerr Jobe Avenue, Serekunda",
      area: "Serekunda",
      lat: 13.4383,
      lng: -16.6775,
      basePricePerHour: "900",
    },
    {
      ownerId: owner1.id,
      slug: "fajara-sports-complex",
      name: "Fajara Sports Complex",
      type: "ELEVEN_A_SIDE" as const,
      description: "Full-size natural grass pitch with changing rooms, near Kairaba Avenue.",
      address: "Kairaba Avenue, Fajara",
      area: "Fajara",
      lat: 13.47,
      lng: -16.69,
      basePricePerHour: "2800",
    },
    {
      ownerId: owner1.id,
      slug: "bakau-beach-pitch",
      name: "Bakau Beach Pitch",
      type: "FIVE_A_SIDE" as const,
      description: "Sand-adjacent artificial turf with ocean views along the Atlantic coast.",
      address: "Atlantic Boulevard, Bakau",
      area: "Bakau",
      lat: 13.4784,
      lng: -16.6819,
      basePricePerHour: "1000",
    },
    {
      ownerId: owner1.id,
      slug: "kotu-astro-turf",
      name: "Kotu Astro Turf",
      type: "SEVEN_A_SIDE" as const,
      description: "Popular evening pitch with floodlights, right by Kotu Stream.",
      address: "Kotu Stream Road, Kotu",
      area: "Kotu",
      lat: 13.4517,
      lng: -16.7106,
      basePricePerHour: "1400",
    },
    {
      ownerId: owner2.id,
      slug: "kololi-elite-arena",
      name: "Kololi Elite Arena",
      type: "SEVEN_A_SIDE" as const,
      description: "Premium synthetic turf with parking, steps from the Senegambia strip.",
      address: "Senegambia Strip, Kololi",
      area: "Kololi",
      lat: 13.445,
      lng: -16.715,
      basePricePerHour: "1600",
    },
    {
      ownerId: owner2.id,
      slug: "kanifing-community-field",
      name: "Kanifing Community Field",
      type: "FIVE_A_SIDE" as const,
      description: "Neighbourhood favourite off Bundung Road, open early morning to late night.",
      address: "Bundung Road, Kanifing",
      area: "Kanifing",
      lat: 13.45,
      lng: -16.6667,
      basePricePerHour: "800",
    },
    {
      ownerId: owner2.id,
      slug: "sukuta-turf",
      name: "Sukuta Turf",
      type: "FIVE_A_SIDE" as const,
      description: "Compact five-a-side astro turf, great for quick matches.",
      address: "Sukuta-Sanchaba Road, Sukuta",
      area: "Sukuta",
      lat: 13.4239,
      lng: -16.7106,
      basePricePerHour: "850",
    },
    {
      ownerId: owner3.id,
      slug: "brikama-grand-stadium",
      name: "Brikama Grand Stadium",
      type: "ELEVEN_A_SIDE" as const,
      description: "Large eleven-a-side stadium with seating for spectators.",
      address: "Brikama Highway, Brikama",
      area: "Brikama",
      lat: 13.2708,
      lng: -16.6486,
      basePricePerHour: "3000",
    },
    {
      ownerId: owner3.id,
      slug: "gunjur-community-pitch",
      name: "Gunjur Community Pitch",
      type: "SEVEN_A_SIDE" as const,
      description: "Busy community pitch on the Gunjur Highway.",
      address: "Gunjur Highway, Gunjur",
      area: "Gunjur",
      lat: 13.2028,
      lng: -16.7439,
      basePricePerHour: "1100",
    },
    {
      ownerId: owner3.id,
      slug: "bijilo-turf",
      name: "Bijilo Turf",
      type: "SEVEN_A_SIDE" as const,
      description: "High-end turf near Bijilo Forest Park and the beach hotels.",
      address: "Bijilo Forest Park Road, Bijilo",
      area: "Bijilo",
      lat: 13.4319,
      lng: -16.7364,
      basePricePerHour: "1500",
    },
  ];

  const pitches = [];
  for (const def of pitchDefs) {
    const pitch = await prisma.pitch.upsert({
      where: { slug: def.slug },
      update: {
        ownerId: def.ownerId,
        name: def.name,
        type: def.type,
        description: def.description,
        address: def.address,
        area: def.area,
        lat: def.lat,
        lng: def.lng,
        basePricePerHour: def.basePricePerHour,
        // 10am-4am (the next morning) — how these turfs actually run.
        // "28:00" is 04:00 in the extended, past-midnight notation lib/time.ts uses.
        openTime: "10:00",
        closeTime: "28:00",
      },
      create: {
        ownerId: def.ownerId,
        slug: def.slug,
        name: def.name,
        type: def.type,
        description: def.description,
        address: def.address,
        area: def.area,
        lat: def.lat,
        lng: def.lng,
        basePricePerHour: def.basePricePerHour,
        openTime: "10:00",
        closeTime: "28:00",
      },
    });
    pitches.push(pitch);
    console.log(`  ${pitch.name}`);
  }

  console.log("Creating bookings...");

  // Bookings aren't upserted individually — the specs below are recomputed
  // relative to "today" on every run, so re-seeding on the same day would
  // otherwise collide with the still-active bookings from the previous run
  // (the partial exclusion constraint doing exactly its job). Reset to a
  // clean slate instead, since these 10 pitches are seed/demo data, not real
  // inventory.
  await prisma.booking.deleteMany({ where: { pitchId: { in: pitches.map((p) => p.id) } } });

  interface BookingSpec {
    pitchIndex: number;
    dayOffset: number;
    startTime: string;
    endTime: string;
    customer: number;
    status: BookingStatus;
  }

  const specs: BookingSpec[] = [
    { pitchIndex: 0, dayOffset: 3, startTime: "09:00", endTime: "10:00", customer: 0, status: "CONFIRMED" },
    { pitchIndex: 0, dayOffset: 7, startTime: "18:00", endTime: "19:00", customer: 1, status: "PENDING" },
    { pitchIndex: 1, dayOffset: 2, startTime: "16:00", endTime: "17:00", customer: 2, status: "CONFIRMED" },
    { pitchIndex: 1, dayOffset: 5, startTime: "10:00", endTime: "11:00", customer: 3, status: "PENDING" },
    { pitchIndex: 2, dayOffset: -4, startTime: "17:00", endTime: "18:00", customer: 4, status: "CONFIRMED" },
    { pitchIndex: 2, dayOffset: 6, startTime: "20:00", endTime: "21:00", customer: 5, status: "CANCELLED" },
    { pitchIndex: 3, dayOffset: 1, startTime: "19:00", endTime: "20:00", customer: 6, status: "CONFIRMED" },
    { pitchIndex: 3, dayOffset: 4, startTime: "08:00", endTime: "09:00", customer: 7, status: "EXPIRED" },
    { pitchIndex: 4, dayOffset: -2, startTime: "08:00", endTime: "09:00", customer: 8, status: "CONFIRMED" },
    { pitchIndex: 4, dayOffset: 8, startTime: "20:00", endTime: "21:00", customer: 9, status: "CONFIRMED" },
    { pitchIndex: 5, dayOffset: 2, startTime: "07:00", endTime: "08:00", customer: 0, status: "PENDING" },
    { pitchIndex: 5, dayOffset: 3, startTime: "12:00", endTime: "13:00", customer: 1, status: "CANCELLED" },
    { pitchIndex: 6, dayOffset: 4, startTime: "15:00", endTime: "16:00", customer: 2, status: "PENDING" },
    { pitchIndex: 6, dayOffset: 9, startTime: "11:00", endTime: "12:00", customer: 3, status: "CONFIRMED" },
    { pitchIndex: 7, dayOffset: 5, startTime: "21:00", endTime: "22:00", customer: 4, status: "CONFIRMED" },
    { pitchIndex: 7, dayOffset: 1, startTime: "06:30", endTime: "07:30", customer: 5, status: "CANCELLED" },
    { pitchIndex: 8, dayOffset: -6, startTime: "09:00", endTime: "10:00", customer: 6, status: "CONFIRMED" },
    { pitchIndex: 8, dayOffset: 6, startTime: "13:00", endTime: "14:00", customer: 7, status: "PENDING" },
    { pitchIndex: 9, dayOffset: 3, startTime: "12:00", endTime: "13:00", customer: 8, status: "CONFIRMED" },
    { pitchIndex: 9, dayOffset: 12, startTime: "17:00", endTime: "18:00", customer: 9, status: "CANCELLED" },
  ];

  let created = 0;
  for (const spec of specs) {
    const pitch = pitches[spec.pitchIndex];
    const totalPrice = Number(pitch.basePricePerHour);
    const customer = CUSTOMERS[spec.customer];
    const now = new Date();

    const base = {
      reference: generateBookingReference(),
      pitchId: pitch.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      date: daysFromNow(spec.dayOffset),
      startTime: spec.startTime,
      endTime: spec.endTime,
      totalPrice,
      currency: pitch.currency,
    };

    if (spec.status === "PENDING") {
      await prisma.booking.create({
        data: { ...base, status: "PENDING", expiresAt: new Date(now.getTime() + APPROVAL_HOURS * 60 * 60_000) },
      });
    } else if (spec.status === "EXPIRED") {
      await prisma.booking.create({
        data: { ...base, status: "EXPIRED", expiresAt: new Date(now.getTime() - 60 * 60_000) },
      });
    } else if (spec.status === "CONFIRMED") {
      await prisma.booking.create({
        data: { ...base, status: "CONFIRMED", approvedAt: now, approvedBy: pitch.ownerId },
      });
    } else if (spec.status === "CANCELLED") {
      await prisma.booking.create({
        data: { ...base, status: "CANCELLED" },
      });
    }
    created += 1;
  }
  console.log(`  ${created} bookings created`);

  console.log(`\nSeeded login credentials (password for all: ${SEED_PASSWORD})`);
  console.log("  Super admin:            admin@turfaura.dev");
  console.log("  Owner (4 pitches):      aisha@turfaura.dev");
  console.log("  Owner (3 pitches):      momodou@turfaura.dev");
  console.log("  Owner (3 pitches):      fatou@turfaura.dev");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
