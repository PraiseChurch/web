import React from "react";
import { View, Text, Svg, Polygon } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { colors, styles } from "../styles";

type Props = {
  worshipSteps: ResolvedBulletin["worshipSteps"];
  isCommunion: boolean;
};

const FLAG_VIEWBOX_W = 120;
const FLAG_VIEWBOX_H = 60;
const FLAG_POINT_DEPTH = 12;
const FLAG_POLYGON_POINTS = `0,0 ${FLAG_VIEWBOX_W - FLAG_POINT_DEPTH},0 ${FLAG_VIEWBOX_W},${FLAG_VIEWBOX_H / 2} ${FLAG_VIEWBOX_W - FLAG_POINT_DEPTH},${FLAG_VIEWBOX_H} 0,${FLAG_VIEWBOX_H}`;

export const OrderOfWorship: React.FC<Props> = ({
  worshipSteps,
  isCommunion,
}) => (
  <View>
    <Text style={styles.sectionHeading}>The Order of Our Worship</Text>
    <View style={styles.orderGrid}>
      {worshipSteps.map((step, idx) => {
        const isHighlight = isCommunion && step.id === "lords-supper";
        const numberText = `${String(idx + 1).padStart(2, "0")}.`;

        if (isHighlight) {
          return (
            <View
              key={step.id}
              style={[styles.orderItem, styles.orderItemFlag]}
            >
              <Svg
                style={styles.orderItemFlagBg}
                viewBox={`0 0 ${FLAG_VIEWBOX_W} ${FLAG_VIEWBOX_H}`}
                preserveAspectRatio="none"
              >
                <Polygon points={FLAG_POLYGON_POINTS} fill={colors.orange} />
              </Svg>
              <Text style={[styles.orderNumber, styles.orderNumberCommunion]}>
                {numberText}
              </Text>
              <Text style={[styles.orderTitle, styles.orderTitleCommunion]}>
                {step.title}
              </Text>
              <Text
                style={[
                  styles.orderAssignment,
                  styles.orderAssignmentCommunion,
                ]}
              >
                {step.assignment}
              </Text>
            </View>
          );
        }

        return (
          <View key={step.id} style={styles.orderItem}>
            <Text style={styles.orderNumber}>{numberText}</Text>
            <Text style={styles.orderTitle}>{step.title}</Text>
            <Text style={styles.orderAssignment}>{step.assignment}</Text>
          </View>
        );
      })}
    </View>
  </View>
);
