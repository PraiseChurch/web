import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { styles } from "../styles";

type Props = {
  worshipSteps: ResolvedBulletin["worshipSteps"];
  isCommunion: boolean;
};

export const OrderOfWorship: React.FC<Props> = ({
  worshipSteps,
  isCommunion,
}) => (
  <View>
    <Text style={styles.sectionHeading}>The Order of Our Worship</Text>
    <View style={styles.orderGrid}>
      {worshipSteps.map((step, idx) => {
        const isHighlight = isCommunion && step.id === "lords-supper";
        return (
          <View
            key={step.id}
            style={[
              styles.orderItem,
              isHighlight ? styles.orderItemCommunion : {},
            ]}
          >
            <Text
              style={[
                styles.orderNumber,
                isHighlight ? styles.orderNumberCommunion : {},
              ]}
            >
              {String(idx + 1).padStart(2, "0")}.
            </Text>
            <Text
              style={[
                styles.orderTitle,
                isHighlight ? styles.orderTitleCommunion : {},
              ]}
            >
              {step.title}
            </Text>
            <Text
              style={[
                styles.orderAssignment,
                isHighlight ? styles.orderAssignmentCommunion : {},
              ]}
            >
              {step.assignment}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);
