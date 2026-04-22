// Seeds Supabase with the current hardcoded bulletin + config data.
// Run with: pnpm tsx scripts/seed.ts
//
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local — the service role key
// bypasses RLS so we can insert without an authenticated user.

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import path from "path";

loadEnv({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const CONFIG = {
  church: {
    name: "Praise Church West Covina",
    address: "718 S Azusa Avenue, West Covina, CA, 91791",
    welcomeLine: "Welcome! We're glad you're here.",
  },
  missionStatement:
    "We treasure the glory of God to spread the glory of Christ empowered by the Spirit of God enabling us to hope in the Word of God.",
  worshipSteps: [
    {
      id: "worship-in-song",
      title: "Worship in Song",
      defaultAssignment: "Worship Team",
    },
    { id: "welcome", title: "Welcome", defaultAssignment: "Emil Cueto" },
    {
      id: "continuation-of-worship",
      title: "Continuation of Worship",
      defaultAssignment: "Worship Team",
    },
    {
      id: "scripture-reading",
      title: "Scripture Reading and Prayer",
      defaultAssignment: "Emil Cueto",
    },
    {
      id: "preaching",
      title: "Preaching of God's Word",
      defaultAssignment: "Joel Danganan",
    },
    {
      id: "lords-supper",
      title: "Ordinance of the Lord's Supper",
      defaultAssignment: "Elders",
    },
    {
      id: "worship-with-treasures",
      title: "Worship with our Treasures",
      defaultAssignment: "Deacons",
    },
    { id: "conclusion", title: "Conclusion", defaultAssignment: "Emil Cueto" },
  ],
  midweekMinistries: [
    {
      day: "Wednesday",
      meetings: [
        { name: "Prayer Meeting", location: "Virtual", time: "7:30 PM" },
      ],
    },
    {
      day: "Thursday",
      meetings: [
        { name: "Bible Study", location: "Virtual", time: "7:00 PM" },
        { name: "Bible Study", location: "Virtual", time: "7:30 PM" },
        { name: "Bible Study", location: "Virtual", time: "8:00 PM" },
      ],
    },
    {
      day: "Friday",
      meetings: [
        { name: "Bible Study", location: "Virtual", time: "7:00 PM" },
        { name: "Bible Study", location: "Virtual", time: "7:30 PM" },
        { name: "Bible Study", location: "Virtual", time: "8:00 PM" },
      ],
    },
  ],
  enums: {
    eventCategory: ["WOMEN", "MEN", "COUPLES", "YOUTH", "GENERAL"],
  },
};

const SAMPLE_BULLETIN = {
  date: "2026-01-04",
  sermon: {
    title: "Doing Good Is From God",
    scriptureReference: "3 John 1:9-11",
    scripturePassage:
      "{9} I wrote something to the church (yet the church did not receive the letter) because Diotrephes does not accept us since loves to place himself first. {10} Because of this, I will remind him of his works when I come; namely, he works by talking about us with evil words and he does not accept the brothers. Not satisfied with these things, he hinders those who wish to come and casts them out of the church. {11} Beloved, imitate not evil, but imitate good. The one doing good is from God and the one doing evil does not see God.",
  },
  assignmentOverrides: {},
  isCommunion: true,
  discovery: {
    mens: "Parlor",
    womens: "Sunday School Room",
  },
  upcomingEvents: [
    { category: "WOMEN", date: "2026-01-10", title: "Women's Fellowship" },
    {
      category: "COUPLES",
      date: "2026-02-14",
      title: "Couple's Valentine's Dinner",
    },
  ],
  publishedAt: "2026-01-01T12:00:00Z",
};

async function seed() {
  console.log("Seeding bulletin_config…");
  const { error: configErr } = await supabase
    .from("bulletin_config")
    .upsert({ id: 1, data: CONFIG, schema_version: 1 });
  if (configErr) {
    console.error("Config upsert failed:", configErr);
    process.exit(1);
  }

  console.log("Seeding bulletins…");
  const { error: bulletinErr } = await supabase.from("bulletins").upsert({
    date: SAMPLE_BULLETIN.date,
    data: {
      bulletin: SAMPLE_BULLETIN,
      configSnapshot: CONFIG,
    },
    published_at: SAMPLE_BULLETIN.publishedAt,
    schema_version: 1,
    render_version: 1,
  });
  if (bulletinErr) {
    console.error("Bulletin upsert failed:", bulletinErr);
    process.exit(1);
  }

  console.log("Seed complete.");
}

seed();
