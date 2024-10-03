import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export const Header = ({ children, className }: HeaderProps) => {
  return (
    <div className={cn("header", className)}>
      <Link href={"/"} className="md:flex-1">
        <Image
          src={"/assets/icons/logo.svg"}
          alt="logo with name"
          className="hidden md:block"
          height={32}
          width={210}
        />
        <Image
          src={"/assets/icons/logo-icon.svg"}
          alt="logo"
          className="mr-2 md:hidden"
          height={32}
          width={32}
        />
      </Link>
      {children}
    </div>
  );
};
