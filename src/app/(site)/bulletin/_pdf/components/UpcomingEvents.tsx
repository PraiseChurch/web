import React from "react";
import { View, Text } from "@react-pdf/renderer";
import type { ResolvedBulletin } from "../../types";
import { formatEventDate } from "../../_view/format";
import { styles } from "../styles";

type Props = { events: ResolvedBulletin["upcomingEvents"] };

export const UpcomingEvents: React.FC<Props> = ({ events }) => {
  if (events.length === 0) return null;
  return (
    <View>
      <Text style={styles.sectionHeading}>Upcoming Events</Text>
      <View style={styles.eventsRow}>
        {events.map((event, idx) => (
          <View key={`${event.date}-${idx}`} style={styles.eventItem}>
            <Text style={styles.eventCategory}>{event.category}</Text>
            <Text style={styles.eventDate}>{formatEventDate(event.date)}</Text>
            <Text style={styles.eventTitle}>{event.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
