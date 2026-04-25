import React from "react";
import { Page, View } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../types";
import { Header } from "./components/Header";
import { MidweekMinistries } from "./components/MidweekMinistries";
import { Logo } from "./components/Logo";
import { styles } from "./styles";

type Props = { resolved: ResolvedBulletin };

export const PageTwo: React.FC<Props> = ({ resolved }) => (
  <Page size="LETTER" orientation="landscape" style={styles.page}>
    <Header resolved={resolved} />
    <View style={styles.twoColumn}>
      <View style={styles.column}>
        <MidweekMinistries midweek={resolved.midweekMinistries} />
      </View>
      <View style={styles.column}>
        <Logo />
      </View>
    </View>
  </Page>
);
