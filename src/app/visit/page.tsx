import Image from "next/image";
import {
  Divider,
  FluidContainer,
  Hero,
  TextSubsection,
  Typography,
} from "../components";

export default function Visit() {
  return (
    <div>
      <Hero title="Visit" imgSrc="/hero/visit-hero.jpeg" position="center" />
      <FluidContainer>
        <TextSubsection heading="Matthew 28:19-20">
          &quot;Go therefore and make disciples of all nations, baptizing them
          in the name of the Father and of the Son and of the Holy Spirit,
          teaching them to observe all that I have commanded you.&quot;
        </TextSubsection>
        <Divider />
        <Typography variant="sectionSubheading">
          Where is Praise Church?
        </Typography>
        <Image
          src="/pcwc-map.jpg"
          alt="map of how to get to praise church west covina"
          width="0"
          height="0"
          sizes="100vw"
          className="w-full h-auto rounded-md mt-1"
        />
        <TextSubsection heading="How long is our service?">
          Our services typically last 1 hour and 15 minutes, from 10:00 AM to
          11:15 AM, but everyone is cordially invited to partake in the
          discussion groups after the sermon.
        </TextSubsection>
        <TextSubsection heading="What is the service like?">
          Theologically rich and biblically rooted lyrics mixed with
          contemporary musical style characterize the worship. The preaching is
          unabashedly expository in style and robustly biblical theological
          &mdash; how the history of redemption fit together &mdash; in content.
        </TextSubsection>
        <TextSubsection heading="How do people normally dress?">
          Please come as you are. We welcome all people &mdash; from those who
          prefer suit and tie to those who would rather wear shorts and shirt.
          The principle of decency and the desire to give our best to the Lord
          in worship govern our dress code.
        </TextSubsection>
        <TextSubsection heading="What about kids?">
          Children&apos;s ministry teachers provide a safe and fun environment
          for children of all age groups to learn and grow in the grace and
          knowledge of Jesus during main sanctuary worship service.
        </TextSubsection>
      </FluidContainer>
    </div>
  );
}
