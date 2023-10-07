import React from "react";
import { GenericPage } from "../modules";

export default function About() {
  return (
    <div>
      <GenericPage heroTitle="About" heroImgSrc="/hero/about-hero.jpeg" position="center" text="from a bow of a ship" verse="heading for a new land" continuation={true} />
    </div>
  );
}
