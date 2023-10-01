import { FluidContainer, Typography } from "../components";

export const MissionStatement = () => {
  return (
    <div className="my-10 px-5">
      <FluidContainer>
        <div className="my-6 flex flex-col">
          <Typography variant="sectionSubheading">
            Our Mission Of Hope
          </Typography>
          <div className="mx-auto">
            <Typography>
              ...is to spread the glory of God&apos;s presence in West Covina
              and beyond.
            </Typography>
          </div>
        </div>
        <div className="my-6 flex flex-col">
          <Typography variant="sectionSubheading">
            Our Motivation By Faith
          </Typography>
          <div className="mx-auto">
            <Typography>
              ...is the surpassing joy of God&apos;s indwelling Spirit in our
              hearts.
            </Typography>
          </div>
        </div>
        <div className="my-6 flex flex-col">
          <Typography variant="sectionSubheading">
            Our Means Through Love
          </Typography>
          <div className="mx-auto">
            <Typography>
              ...is proclaiming the gospel of Christ in word and in deed.
            </Typography>
          </div>
        </div>
      </FluidContainer>
    </div>
  );
};
