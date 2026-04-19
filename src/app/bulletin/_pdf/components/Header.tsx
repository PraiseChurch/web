import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { formatBulletinDate } from "../../_view/format";
import { styles } from "../styles";

type Props = { resolved: Pick<ResolvedBulletin, "date" | "church"> };

export const Header: React.FC<Props> = ({ resolved }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.headerDate}>{formatBulletinDate(resolved.date)}</Text>
      <Text style={styles.headerChurch}>{resolved.church.name}</Text>
    </View>
    <View style={styles.headerRight}>
      <Text style={styles.headerWelcome}>{resolved.church.welcomeLine}</Text>
      <Text style={styles.headerAddress}>{resolved.church.address}</Text>
    </View>
  </View>
);
