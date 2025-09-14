// OLD ABOUT PAGE - COMMENTED OUT FOR REDESIGN
/*
import React from "react";
import type { Metadata } from "next";
import { GenericPage } from "../modules";
import aboutData from "../../data/about.json";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Praise Church West Covina and what we believe in"
}

export default function About() {
  return (
    <div>
      <GenericPage
        heroImgSrc="/hero/bible-about-hero.jpeg"
        heroPostTitle="&quot;In Him we have redemption through his blood...&quot;"
        heroTitle="About"
        position="center"
        subsectionArray={aboutData.sections}
        text="In him we have redemption through his blood, the forgiveness of our trespasses, according to the riches of his grace."
        verse="Ephesians 1:7"
      />
    </div>
  );
}
*/

// Placeholder to prevent build errors
export default function AboutOld() {
  return <div>Old About Page (Commented Out)</div>;
}
