import React from "react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="h-[6em] flex">
      <div className="px-10 mx-auto flex justify-between items-center">
        <div className="flex w-[25vw]">
          <Image
            src="/assets/ui/logo.png"
            width={70}
            height={70}
            alt="Logo"
            className="mr-5"
          />

          <h1 className="my-auto font-accent font-bold">Matching Guru</h1>
        </div>
        <nav className="w-[75vw]"></nav>
      </div>
    </header>
  );
};

export default Header;
