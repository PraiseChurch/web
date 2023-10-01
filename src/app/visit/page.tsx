import { Divider, FluidContainer, Hero, TextSubsection } from "../components";

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
      </FluidContainer>
    </div>
  );
}
