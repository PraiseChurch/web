import React from "react";
import { Page, View } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../types";
import { Header } from "./components/Header";
import { OrderOfWorship } from "./components/OrderOfWorship";
import { MissionStatement } from "./components/MissionStatement";
import { Discovery } from "./components/Discovery";
import { UpcomingEvents } from "./components/UpcomingEvents";
import { SermonSection } from "./components/SermonSection";
import { NotesLines } from "./components/NotesLines";
import { styles } from "./styles";

type Props = { resolved: ResolvedBulletin };

export const PageOne: React.FC<Props> = ({ resolved }) => (
  <Page size="LETTER" orientation="landscape" style={styles.page}>
    <Header resolved={resolved} />
    <View style={styles.twoColumn}>
      <View style={styles.column}>
        <OrderOfWorship
          worshipSteps={resolved.worshipSteps}
          isCommunion={resolved.isCommunion}
        />
        <View style={styles.sectionDivider} />
        <MissionStatement missionStatement={resolved.missionStatement} />
        <View style={styles.sectionDivider} />
        <Discovery discovery={resolved.discovery} />
        <View style={styles.sectionDivider} />
        <UpcomingEvents events={resolved.upcomingEvents} />
      </View>
      <View style={styles.column}>
        <SermonSection sermon={resolved.sermon} />
        <View style={styles.sectionDivider} />
        <NotesLines lineCount={10} />
      </View>
    </View>
  </Page>
);
