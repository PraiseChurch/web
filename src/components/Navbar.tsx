// components/Navbar.js
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  return (
    <nav className="bg-black p-4">
      <div className="container mx-auto flex justify-between items-center top-0">
        <Link href="/" className="text-white font-semibold text-lg">
          <Image
            src="/tulip-logo-white.png"
            alt="praise church west covina logo"
            className="opacity-1"
            width={24}
            height={32}
            priority
          />
        </Link>
        <div className="hidden: md:flex space-x-4">
          <Link href="/about" className="text-white hover: text-grey-300">
            About
          </Link>
          <Link href="/contact" className="text-white hover: text-grey-300">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};
