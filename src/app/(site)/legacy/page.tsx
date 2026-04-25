export default function Legacy() {
  return (
    <div className="flex flex-col gap-12 p-10 rounded-md">
      <div className="text-center flex flex-col gap-4">
        <h2 className="text-xl uppercase">Website Under Construction</h2>
        <h1 className="serif text-6xl uppercase">Praise Church</h1>
        <h3 className="text-lg">Please check back soon!</h3>
      </div>
      <div className="text-center">
        <p className="">Services Every Sunday at 10am</p>
        <a
          className="underline"
          href="https://maps.google.com?q=Shadow%20Oak%20Park%2C%20West%20Covina%2C%20CA%2091792%2C%20"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Shadow Oak Park, West Covina, CA 91792"
        >
          Shadow Oak Park,{" "}
          <span className="whitespace-nowrap">West Covina, CA 91792</span>
        </a>
        <p>praisechurchwc@gmail.com</p>
        <p>626-251-0952</p>
      </div>
      <a
        className="text-center underline"
        href="https://trial-rcgell7u.finalweb2.finalweb.net/"
      >
        View Our Old Website
      </a>
    </div>
  );
}
