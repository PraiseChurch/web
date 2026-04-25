import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { styles } from "../styles";

type Props = { discovery: ResolvedBulletin["discovery"] };

export const Discovery: React.FC<Props> = ({ discovery }) => (
  <View>
    <Text style={styles.sectionHeading}>Discovery</Text>
    <View style={styles.discoveryRow}>
      <View style={styles.discoveryItem}>
        <Text style={styles.discoveryLabel}>Men&apos;s Group Discussion</Text>
        <Text style={styles.discoveryValue}>{discovery.mens}</Text>
      </View>
      <View style={styles.discoveryItem}>
        <Text style={styles.discoveryLabel}>Women&apos;s Group Discussion</Text>
        <Text style={styles.discoveryValue}>{discovery.womens}</Text>
      </View>
    </View>
  </View>
);
