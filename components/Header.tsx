import React from "react";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="h-[5em] flex absolute top-0 left-0 bg-light  dark:bg-dark  w-full">
      <div className="px-10 mx-auto flex justify-between items-center">
        <Link href="/" className="flex ">
          <Image
            src="/assets/ui/logo(yy).png"
            width={70}
            height={70}
            alt="Logo"
            className="m-auto"
          />

          {/* <h1 className="my-auto font-accent font-bold">Matching Guru</h1> */}
        </Link>
        <nav className="w-[75vw]"></nav>
      </div>
    </header>
  );
};

export default Header;
