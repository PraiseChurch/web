import { Hero } from "./components";
import { MissionStatement } from "./sections";

export default function Home() {
  return (
    <main>
      <Hero preTitle="welcome to" title="Praise Church" postTitle="West Covina, CA" imgSrc="/praise-hero.jpg"/>
      <MissionStatement />
    </main>
  );
}
