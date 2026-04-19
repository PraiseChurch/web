import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { parseScripturePassage } from "../../_data/scripture";
import { styles } from "../styles";

type Props = { sermon: ResolvedBulletin["sermon"] };

export const SermonSection: React.FC<Props> = ({ sermon }) => {
  const fragments = parseScripturePassage(sermon.scripturePassage);
  return (
    <View>
      <Text style={styles.sermonTitle}>{sermon.title}</Text>
      <Text style={styles.sermonReference}>{sermon.scriptureReference}</Text>
      <Text style={styles.sermonPassage}>
        {fragments.map((f, i) =>
          f.kind === "verse" ? (
            <Text key={i} style={styles.verseSuperscript}>
              {f.number}{" "}
            </Text>
          ) : (
            <Text key={i}>{f.content}</Text>
          ),
        )}
      </Text>
    </View>
  );
};
