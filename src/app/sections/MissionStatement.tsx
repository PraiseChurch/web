import { FluidContainer, Typography } from "../components";

export const MissionStatement = () => {
  return (
    <div className="my-6">
      <div className="my-4 flex flex-col items-center">
          <Typography variant="sectionSubheading">
            Our Mission With Hope
          </Typography>
          <Typography>
            is to spread the glory of God&apos;s presence in West Covina and
            beyond.
          </Typography>
      </div>
      <div className="my-4 flex flex-col items-center">
          <Typography variant="sectionSubheading">
            Our Motivation By Faith
          </Typography>
          <Typography>
            is the surpassing joy of God&apos;s indwelling Spirit in our hearts.
          </Typography>
      </div>
      <div className="my-4 flex flex-col items-center">
          <Typography variant="sectionSubheading">
            Our Means Through Love
          </Typography>
          <Typography>
            is by proclaiming the gospel of Christ in word and in deed.
          </Typography>
      </div>
    </div>
  );
};
