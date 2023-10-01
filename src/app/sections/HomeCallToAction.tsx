import { Button, Typography } from "../components";

export const HomeCallToAction = () => {
  return (
    <div className="my-10 px-5">
      <hr className="w-3/4 mx-auto" />
      <div className="my-6 flex justify-center">
        <Typography>
          Join us for praise and worship on Sunday mornings at 10:00 AM PST
        </Typography>
      </div>
      <div className="my-6 flex justify-center">
        <Button title="Visit Praise Church" href="/visit" />
      </div>
    </div>
  );
};
