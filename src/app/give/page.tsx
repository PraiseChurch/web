import { Button, Divider, FluidContainer, Hero, TextSubsection } from "../components";

export default function Give() {
  return (
    <div>
      <Hero title="Give" imgSrc="/hero/give-hero-2.jpeg" position="center" />
      <FluidContainer>
        <TextSubsection title="Leviticus 27:30">
          &quot;A tithe of everything from the land, whether grain from the soil
          or fruit from the trees, belongs to the LORD; it is holy to the
          LORD&quot;
        </TextSubsection>
        <Divider />
        <TextSubsection title="Secure Giving Via CashApp">
          If you want to partner with us in the work God is doing in West Covina
          and beyond, please click the link below. Thank you for your
          generosity!
        </TextSubsection>
        <div className="mx-auto flex justify-center">
          <Button href="https://cash.app/$PraiseChurch" title="Give" />
        </div>
      </FluidContainer>
    </div>
  );
}
