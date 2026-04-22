import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

type Props = { lineCount: number };

export const NotesLines: React.FC<Props> = ({ lineCount }) => (
  <View style={styles.notesContainer}>
    <Text style={styles.notesHeading}>Notes</Text>
    {Array.from({ length: lineCount }).map((_, i) => (
      <View key={i} style={styles.notesLine} />
    ))}
  </View>
);
