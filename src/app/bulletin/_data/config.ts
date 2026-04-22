import type { BulletinConfig } from "../types";

const CONFIG: BulletinConfig = {
  church: {
    name: "Praise Church West Covina",
    address: "718 S Azusa Avenue, West Covina, CA, 91791",
    welcomeLine: "Welcome! We're glad you're here.",
  },
  missionStatement:
    "We treasure the glory of God to spread the glory of Christ empowered by the Spirit of God enabling us to hope in the Word of God.",
  worshipSteps: [
    {
      id: "worship-in-song",
      title: "Worship in Song",
      defaultAssignment: "Worship Team",
    },
    { id: "welcome", title: "Welcome", defaultAssignment: "Emil Cueto" },
    {
      id: "continuation-of-worship",
      title: "Continuation of Worship",
      defaultAssignment: "Worship Team",
    },
    {
      id: "scripture-reading",
      title: "Scripture Reading and Prayer",
      defaultAssignment: "Emil Cueto",
    },
    {
      id: "preaching",
      title: "Preaching of God's Word",
      defaultAssignment: "Joel Danganan",
    },
    {
      id: "lords-supper",
      title: "Ordinance of the Lord's Supper",
      defaultAssignment: "Elders",
    },
    {
      id: "worship-with-treasures",
      title: "Worship with our Treasures",
      defaultAssignment: "Deacons",
    },
    { id: "conclusion", title: "Conclusion", defaultAssignment: "Emil Cueto" },
  ],
  midweekMinistries: [
    {
      day: "Wednesday",
      meetings: [
        { name: "Prayer Meeting", location: "Virtual", time: "7:30 PM" },
      ],
    },
    {
      day: "Thursday",
      meetings: [
        { name: "Bible Study", location: "Virtual", time: "7:00 PM" },
        { name: "Bible Study", location: "Virtual", time: "7:30 PM" },
        { name: "Bible Study", location: "Virtual", time: "8:00 PM" },
      ],
    },
    {
      day: "Friday",
      meetings: [
        { name: "Bible Study", location: "Virtual", time: "7:00 PM" },
        { name: "Bible Study", location: "Virtual", time: "7:30 PM" },
        { name: "Bible Study", location: "Virtual", time: "8:00 PM" },
      ],
    },
  ],
  enums: {
    eventCategory: ["WOMEN", "MEN", "COUPLES", "YOUTH", "GENERAL"],
  },
};

export async function getConfig(): Promise<BulletinConfig> {
  return CONFIG;
}
