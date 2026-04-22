import { BulletinDocument as V1 } from "./BulletinDocument";

// Add case branches here when a breaking render change ships. Copy the
// old _pdf/ tree to _pdf/v1/, import it here, and route to the new one
// by default. Existing rows stamped with the old version still render
// with the archived components.
export function getBulletinDocument(_renderVersion: number) {
  return V1;
}
