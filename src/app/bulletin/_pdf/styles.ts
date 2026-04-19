import { StyleSheet } from "@react-pdf/renderer";

export const colors = {
  black: "#000000",
  orange: "#EC7442",
  gray: "#6B7280",
  lightGray: "#E5E7EB",
  white: "#FFFFFF",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 40,
    fontSize: 10,
    color: colors.black,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  headerDate: {
    color: colors.orange,
    fontStyle: "italic",
    fontSize: 10,
  },
  headerChurch: {
    marginTop: 3,
    fontSize: 10,
    color: colors.black,
  },
  headerWelcome: {
    color: colors.orange,
    fontSize: 10,
    fontFamily: "Helvetica-BoldOblique",
  },
  headerAddress: {
    marginTop: 3,
    fontSize: 10,
    color: colors.black,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 28,
  },
  column: {
    flex: 1,
  },
  sectionHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  orderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  orderItem: {
    width: "25%",
    paddingRight: 8,
    marginBottom: 14,
  },
  orderItemCommunion: {
    backgroundColor: colors.orange,
    padding: 6,
    marginLeft: -6,
    marginRight: 2,
  },
  orderNumber: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 4,
  },
  orderNumberCommunion: {
    color: colors.white,
  },
  orderTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  orderTitleCommunion: {
    color: colors.white,
  },
  orderAssignment: {
    fontSize: 9,
    fontStyle: "italic",
    color: colors.gray,
  },
  orderAssignmentCommunion: {
    color: colors.white,
  },
  missionText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.4,
  },
  discoveryRow: {
    flexDirection: "row",
    gap: 20,
  },
  discoveryItem: {
    flex: 1,
  },
  discoveryLabel: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  discoveryValue: {
    fontSize: 11,
  },
  eventsRow: {
    flexDirection: "row",
    gap: 20,
  },
  eventItem: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.lightGray,
  },
  eventCategory: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 9,
    fontStyle: "italic",
    color: colors.gray,
    marginBottom: 3,
  },
  eventTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  sermonTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  sermonReference: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 6,
  },
  sermonPassage: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  verseSuperscript: {
    fontSize: 7,
    verticalAlign: "super",
  },
  notesLine: {
    marginTop: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGray,
  },
  sectionDivider: {
    marginTop: 18,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  midweekDay: {
    marginBottom: 12,
  },
  midweekDayLabel: {
    color: colors.orange,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  midweekMeeting: {
    flexDirection: "row",
    fontSize: 10,
    marginBottom: 2,
  },
  midweekName: {
    fontFamily: "Helvetica-Bold",
    width: 120,
  },
  midweekLocation: {
    width: 120,
  },
  midweekTime: {
    color: colors.gray,
  },
  logoPlaceholder: {
    marginTop: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderStyle: "dashed",
    alignItems: "center",
  },
  logoPlaceholderText: {
    color: colors.gray,
    fontStyle: "italic",
    fontSize: 9,
  },
});
