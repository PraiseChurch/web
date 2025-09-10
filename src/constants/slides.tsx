export const slideTitles = [
  "Praise Church West Covina",
  "Our Mission of Hope",
  "Our Motivation by Faith",
  "Our Means through Love",
];

export const slideData = [
  {
    title: slideTitles[0],
    content: (
      <>
        <h1 className="text-5xl font-bold mb-4">{slideTitles[0]}</h1>
        <p className="text-lg text-gray-600 mb-8 lg:max-w-7xl md:max-w-5xl sm:max-w-xl">
          A modern, friendly church community in West Covina, CA
        </p>
      </>
    ),
    bg: "bg-white",
    font: "",
    alignment: "items-center",
  },
  {
    title: slideTitles[1],
    content: (
      <>
        <h2 className="text-5xl mb-4 text-left">
          <span className="font-thin">Our Mission</span>{" "}
          <span className="font-bold italic">of Hope</span>
        </h2>
        <p className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left">
          is to spread the glory of God's presence in West Covina and beyond
        </p>
      </>
    ),
    bg: "bg-white",
    font: "font-serif",
    alignment: "items-start",
  },
  {
    title: slideTitles[2],
    content: (
      <>
        <h2 className="text-5xl mb-4 text-left">
          <span className="font-thin">Our Motivation</span>{" "}
          <span className="font-bold italic">by Faith</span>
        </h2>
        <p className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left">
          is the surpassing joy of God's indwelling Spirit in our hearts
        </p>
      </>
    ),
    bg: "bg-gray-50",
    font: "font-serif",
    alignment: "items-start",
  },
  {
    title: slideTitles[3],
    content: (
      <>
        <h2 className="text-5xl mb-4 text-left">
          <span className="font-thin">Our Means</span>{" "}
          <span className="font-bold italic">through Love</span>
        </h2>
        <p className="text-xl text-gray-700 max-w-xl lg:max-w-7xl lg:min-w-4xl text-left">
          is to spread the glory of God's presence in West Covina and beyond
        </p>
      </>
    ),
    bg: "bg-white",
    font: "font-serif",
    alignment: "items-start",
  },
];
