export type Weekday =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type WorshipStepConfig = {
  id: string;
  title: string;
  defaultAssignment: string;
};

export type MidweekMeeting = {
  name: string;
  location: string;
  time: string;
};

export type MidweekDay = {
  day: Weekday;
  meetings: MidweekMeeting[];
};

export type BulletinConfig = {
  church: {
    name: string;
    address: string;
    welcomeLine: string;
  };
  missionStatement: string;
  worshipSteps: WorshipStepConfig[];
  midweekMinistries: MidweekDay[];
};

export type UpcomingEvent = {
  category: string;
  date: string;
  title: string;
};

export type Sermon = {
  title: string;
  scriptureReference: string;
  scripturePassage: string;
};

export type Discovery = {
  mens: string;
  womens: string;
};

export type Bulletin = {
  date: string;
  sermon: Sermon;
  assignmentOverrides: Record<string, string>;
  isCommunion: boolean;
  discovery: Discovery;
  upcomingEvents: UpcomingEvent[];
  publishedAt: string | null;
};

export type ResolvedWorshipStep = {
  id: string;
  title: string;
  assignment: string;
};

export type ResolvedBulletin = {
  date: string;
  church: BulletinConfig["church"];
  welcomeLine: string;
  missionStatement: string;
  isCommunion: boolean;
  worshipSteps: ResolvedWorshipStep[];
  sermon: Sermon & { preacher: string };
  discovery: Discovery;
  upcomingEvents: UpcomingEvent[];
  midweekMinistries: MidweekDay[];
};
