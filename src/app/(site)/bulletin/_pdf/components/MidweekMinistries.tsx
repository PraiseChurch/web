import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { styles } from "../styles";

type Props = { midweek: ResolvedBulletin["midweekMinistries"] };

export const MidweekMinistries: React.FC<Props> = ({ midweek }) => (
  <View>
    <Text style={styles.sectionHeading}>Our Midweek Ministries</Text>
    {midweek.map((day) => (
      <View key={day.day} style={styles.midweekDay}>
        <Text style={styles.midweekDayLabel}>{day.day}</Text>
        {day.meetings.map((meeting, idx) => (
          <View key={idx} style={styles.midweekMeeting}>
            <Text style={styles.midweekName}>{meeting.name}</Text>
            <Text style={styles.midweekLocation}>{meeting.location}</Text>
            <Text style={styles.midweekTime}>{meeting.time}</Text>
          </View>
        ))}
      </View>
    ))}
  </View>
);
