import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "../styles";

type Props = { missionStatement: string };

export const MissionStatement: React.FC<Props> = ({ missionStatement }) => (
  <View>
    <Text style={styles.sectionHeading}>Our Values and Our Drive</Text>
    <Text style={styles.missionText}>{missionStatement}</Text>
  </View>
);
