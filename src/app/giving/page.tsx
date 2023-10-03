import {
  Button,
  Divider,
  FluidContainer,
  Hero,
  TextSubsection,
} from "../components";

export default function Giving() {
  return (
    <div>
      <Hero title="Giving" imgSrc="/hero/give-hero-2.jpeg" position="center" postTitle="&quot;... give, and it will be given to you.&quot;" />
      <FluidContainer>
        <TextSubsection title="Luke 6:38">
          <sup>38</sup> &quot;...give, and it will be given to you. Good measure, pressed
          down, shaken together, running over, will be put into your lap. For
          with the measure you use it will be measured back to you.&quot;
        </TextSubsection>
        <Divider />
        <TextSubsection title="Why Do We Give?">
          Giving is an expression of obedience, gratitude, trust, and increasing joy. If you want to partner with us in the work God is doing in West Covina
          and beyond, please consider giving, by faith, through any of the avenues listed below. Thank you for your
          generosity.
        </TextSubsection>
        <TextSubsection title="Mail By Check">
          711 S. Ivy Ave., Unit A
        </TextSubsection>
        <TextSubsection title="Secure Giving Via CashApp">
          CashApp Account: $PraiseChurch
        </TextSubsection>
        <div className="mx-auto flex justify-center">
          <Button href="https://cash.app/$PraiseChurch" title="Give" />
        </div>
      </FluidContainer>
    </div>
  );
}
