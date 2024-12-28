import { Button, FluidContainer, Typography } from "../components";

export const HomeCallToAction = () => {
  return (
    <div className="my-6 px-5">
      <FluidContainer>
        <hr className="w-8/9 mx-auto" />
        <div className="my-16 flex justify-center">
          <Typography>
            Join us for praise and worship Sunday mornings at 10:30 AM PST
          </Typography>
        </div>
        <div className="my-8 flex justify-center">
          <Button title="Visit Praise Church" href="/visit" />
        </div>
      </FluidContainer>
    </div>
  );
};
