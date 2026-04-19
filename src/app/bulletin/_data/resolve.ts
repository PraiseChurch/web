import type {
  Bulletin,
  BulletinConfig,
  ResolvedBulletin,
  ResolvedWorshipStep,
} from "../types";
import { eventsWithinDays } from "./events";

const EVENTS_WINDOW_DAYS = 30;
const PREACHING_STEP_ID = "preaching";

function resolveStep(
  step: BulletinConfig["worshipSteps"][number],
  overrides: Bulletin["assignmentOverrides"],
): ResolvedWorshipStep {
  return {
    id: step.id,
    title: step.title,
    assignment: overrides[step.id] ?? step.defaultAssignment,
  };
}

export function resolveBulletin(
  bulletin: Bulletin,
  config: BulletinConfig,
): ResolvedBulletin {
  const worshipSteps = config.worshipSteps.map((step) =>
    resolveStep(step, bulletin.assignmentOverrides),
  );
  const preachingStep = worshipSteps.find((s) => s.id === PREACHING_STEP_ID);
  if (!preachingStep) {
    throw new Error(
      `BulletinConfig.worshipSteps must contain a step with id "${PREACHING_STEP_ID}"`,
    );
  }

  return {
    date: bulletin.date,
    church: config.church,
    welcomeLine: config.church.welcomeLine,
    missionStatement: config.missionStatement,
    isCommunion: bulletin.isCommunion,
    worshipSteps,
    sermon: {
      ...bulletin.sermon,
      preacher: preachingStep.assignment,
    },
    discovery: bulletin.discovery,
    upcomingEvents: eventsWithinDays(
      bulletin.upcomingEvents,
      bulletin.date,
      EVENTS_WINDOW_DAYS,
    ),
    midweekMinistries: config.midweekMinistries,
  };
}
