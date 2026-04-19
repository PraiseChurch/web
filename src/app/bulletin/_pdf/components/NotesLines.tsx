import React from "react";
import { View } from "@react-pdf/renderer";
import { styles } from "../styles";

type Props = { lineCount?: number };

export const NotesLines: React.FC<Props> = ({ lineCount = 10 }) => (
  <View>
    {Array.from({ length: lineCount }).map((_, i) => (
      <View key={i} style={styles.notesLine} />
    ))}
  </View>
);
