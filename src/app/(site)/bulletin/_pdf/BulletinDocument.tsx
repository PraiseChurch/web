import React from "react";
import { Document } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../types";
import { PageOne } from "./PageOne";
import { PageTwo } from "./PageTwo";

type Props = { resolved: ResolvedBulletin };

export const BulletinDocument: React.FC<Props> = ({ resolved }) => (
  <Document title={`Bulletin ${resolved.date} — ${resolved.sermon.title}`}>
    <PageOne resolved={resolved} />
    <PageTwo resolved={resolved} />
  </Document>
);
