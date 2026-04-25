import React from "react";
import type { ResolvedBulletin } from "../types";
import { ViewHeader } from "./sections/ViewHeader";
import { ViewSermon } from "./sections/ViewSermon";
import { ViewOrderOfWorship } from "./sections/ViewOrderOfWorship";
import { ViewDiscovery } from "./sections/ViewDiscovery";
import { ViewUpcomingEvents } from "./sections/ViewUpcomingEvents";
import { ViewMidweekMinistries } from "./sections/ViewMidweekMinistries";
import { ViewMissionFooter } from "./sections/ViewMissionFooter";
import { DownloadPdfLink } from "./sections/DownloadPdfLink";

type Props = { resolved: ResolvedBulletin };

export const BulletinView: React.FC<Props> = ({ resolved }) => (
  <main className="max-w-2xl mx-auto px-4 py-8">
    <ViewHeader resolved={resolved} />
    <ViewSermon sermon={resolved.sermon} />
    <ViewOrderOfWorship
      worshipSteps={resolved.worshipSteps}
      isCommunion={resolved.isCommunion}
    />
    <ViewDiscovery discovery={resolved.discovery} />
    <ViewUpcomingEvents events={resolved.upcomingEvents} />
    <ViewMidweekMinistries midweek={resolved.midweekMinistries} />
    <ViewMissionFooter missionStatement={resolved.missionStatement} />
    <DownloadPdfLink date={resolved.date} sermonTitle={resolved.sermon.title} />
  </main>
);
