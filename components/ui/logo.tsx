import React from "react";
import Image from "next/image";
import LogoLight from "@/assets/logo_light.png";
import LogoDark from "@/assets/logo_dark.png";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src={LogoLight}
        alt="BlogX Logo"
        fill
        className="object-contain dark:hidden! origin-center"
        priority
      />
      <Image
        src={LogoDark}
        alt="BlogX Logo"
        fill
        className="hidden object-contain dark:block! origin-center"
        priority
      />
    </div>
  );
}
