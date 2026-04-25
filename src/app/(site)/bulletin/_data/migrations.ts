// Data-shape migrations run when a stored row's schema_version is below
// CURRENT_SCHEMA_VERSION. Each migration is a pure function from the old
// shape to the new one. When we ship a breaking change, add a migration here
// and run it against all rows in a SQL migration script at deploy time.

// import type { BulletinConfig, Bulletin } from "../types";

// Example for future reference:
// export function migrateBulletinV1ToV2(v1: BulletinV1): BulletinV2 {
//   return { ...v1, newField: "default" };
// }

export {}; // keep the module valid until we have real migrations
