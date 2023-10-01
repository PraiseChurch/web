import { Hero } from "./components";
import { HomeCallToAction, MissionStatement } from "./sections";

export default function Home() {
  return (
    <main>
      <Hero preTitle="welcome to" title="Praise Church" postTitle="West Covina, CA" imgSrc="/hero/praise-hero.jpg" />
      <MissionStatement />
      <HomeCallToAction />
    </main>
  );
}
