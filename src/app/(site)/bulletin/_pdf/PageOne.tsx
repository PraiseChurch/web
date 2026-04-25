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

// Rough geometry of the right column below the sermon. Used to size the notes
// section so more passage text → fewer notes lines (keeps the notes block
// anchored to the bottom of the page without spilling).
const CHARS_PER_LINE = 65;
const PASSAGE_LINE_PT = 15;
const NOTES_LINE_PT = 14;
const RIGHT_COLUMN_BUDGET_PT = 470;
const SERMON_HEADER_OVERHEAD_PT = 75;
const NOTES_HEADING_PT = 22;
const MIN_NOTES_LINES = 4;
const MAX_NOTES_LINES = 16;

function estimateNotesLines(passage: string): number {
  const passageLines = Math.ceil(passage.length / CHARS_PER_LINE);
  const passageHeight = passageLines * PASSAGE_LINE_PT;
  const remaining =
    RIGHT_COLUMN_BUDGET_PT -
    SERMON_HEADER_OVERHEAD_PT -
    passageHeight -
    NOTES_HEADING_PT;
  const fit = Math.floor(remaining / NOTES_LINE_PT);
  return Math.max(MIN_NOTES_LINES, Math.min(MAX_NOTES_LINES, fit));
}

export const PageOne: React.FC<Props> = ({ resolved }) => {
  const notesLineCount = estimateNotesLines(resolved.sermon.scripturePassage);

  return (
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
        <View style={styles.rightColumn}>
          <SermonSection sermon={resolved.sermon} />
          <NotesLines lineCount={notesLineCount} />
        </View>
      </View>
    </Page>
  );
};
