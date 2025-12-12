"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/lib/generated/prisma/enums";
import MobileMenu from "./mobileMenu";

type User = {

    name: string;
  email: string;
  image?: string | null;
  role: UserRole[] | null
};

type ProfileMenuProps = {
  user: User;
};


export function ProfileMenu({ user }: ProfileMenuProps) {
  
    const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

    const items = [
        { href: "/admin/products", children: "Manage Products" },
        { href: "/admin/stats", children: "Stats" },
        ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="inline-flex items-center justify-center rounded-full border border-gray-200 w-8 h-8 md:w-10 md:h-10 overflow-hidden hover:ring-2 hover:ring-pink-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          aria-label="Open profile menu"
        >
          <Avatar className="w-8 h-8 md:w-10 md:h-10">
            <AvatarImage src={user.image ?? ""} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>

      <PopoverContent className="sm:w-full w-[90vw] md:mr-4 pr-5">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image ?? ""} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.role}
            </p>
          </div>
        </div>

        <div className="">
            <MobileMenu items={items}/>
        </div>
      </PopoverContent>
    </Popover>
  );
}
