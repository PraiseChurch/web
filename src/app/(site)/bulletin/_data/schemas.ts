import { z } from "zod";

export const WeekdaySchema = z.enum([
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export const WorshipStepConfigSchemaV1 = z.object({
  id: z.string(),
  title: z.string(),
  defaultAssignment: z.string(),
});

export const MidweekMeetingSchemaV1 = z.object({
  name: z.string(),
  location: z.string(),
  time: z.string(),
});

export const MidweekDaySchemaV1 = z.object({
  day: WeekdaySchema,
  meetings: z.array(MidweekMeetingSchemaV1),
});

export const BulletinConfigEnumsSchemaV1 = z.object({
  eventCategory: z.array(z.string()),
});

export const BulletinConfigSchemaV1 = z.object({
  church: z.object({
    name: z.string(),
    address: z.string(),
    welcomeLine: z.string(),
  }),
  missionStatement: z.string(),
  worshipSteps: z.array(WorshipStepConfigSchemaV1),
  midweekMinistries: z.array(MidweekDaySchemaV1),
  enums: BulletinConfigEnumsSchemaV1,
});

export const UpcomingEventSchemaV1 = z.object({
  category: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string(),
});

export const SermonSchemaV1 = z.object({
  title: z.string(),
  scriptureReference: z.string(),
  scripturePassage: z.string(),
});

export const DiscoverySchemaV1 = z.object({
  mens: z.string(),
  womens: z.string(),
});

export const BulletinSchemaV1 = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sermon: SermonSchemaV1,
  assignmentOverrides: z.record(z.string(), z.string()),
  isCommunion: z.boolean(),
  discovery: DiscoverySchemaV1,
  upcomingEvents: z.array(UpcomingEventSchemaV1),
  publishedAt: z.string().nullable(),
});

// Stored JSONB shape for the `data` column on the bulletins table
export const StoredBulletinDataSchemaV1 = z.object({
  bulletin: BulletinSchemaV1,
  configSnapshot: BulletinConfigSchemaV1.optional(),
});

// Current versions — bump when breaking changes land
export const CURRENT_SCHEMA_VERSION = 1;
export const CURRENT_RENDER_VERSION = 1;
