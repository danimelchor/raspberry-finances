"use client";

import {
  ChartColumnStackedIcon,
  CloudUploadIcon,
  CodeIcon,
  EyeOffIcon,
  LogOutIcon,
  PieChartIcon,
  StrikethroughIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { type User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGES = [
  {
    name: "Query",
    path: "/",
    icon: CodeIcon,
  },
  {
    name: "Categorized",
    path: "/categorized",
    icon: PieChartIcon,
  },
  {
    name: "Hidden merchants",
    path: "/hidden",
    icon: EyeOffIcon,
  },
  {
    name: "Renamed categories",
    path: "/renamed-categories",
    icon: ChartColumnStackedIcon,
  },
  {
    name: "Renamed merchants",
    path: "/renamed",
    icon: StrikethroughIcon,
  },
  {
    name: "Upload",
    path: "/upload",
    icon: CloudUploadIcon,
  },
];

function MenuItem({
  page,
  active,
  closeMenu,
}: {
  page: (typeof PAGES)[number];
  active: boolean;
  closeMenu?: () => void;
}) {
  return (
    <Link href={"/finances" + page.path} onClick={closeMenu} prefetch={false}>
      <div
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "gap-2 p-2 font-normal justify-start w-full rounded-sm text-nowrap hover:bg-slate-100 bg-transparent",
          {
            "text-primary": active,
          },
        )}
        key={page.name}
      >
        <page.icon className="w-5 h-5" />
        {page.name}
      </div>
    </Link>
  );
}

const AVATAR_BG_COLOR = [
  "bg-slate-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-red-200",
  "bg-pink-200",
  "bg-purple-200",
  "bg-indigo-200",
  "bg-cyan-200",
  "bg-teal-200",
  "bg-lime-200",
];

const User = () => {
  const { data } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/whoami");
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      const json = await res.json();
      return json as User;
    },
  });

  const bgColor = useMemo(() => {
    const firstLetter = data?.username[0] || "A";
    return AVATAR_BG_COLOR[firstLetter.charCodeAt(0) % AVATAR_BG_COLOR.length];
  }, [data]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-transparent hover:bg-slate-100 border-none h-auto px-1 py-3 gap-1 items-center flex w-full">
        <div className="flex items-center">
          <Avatar>
            <AvatarFallback className={cn("capitalize font-bold", bgColor)}>
              {data?.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-start items-start">
            <span className="ml-2 text-sm text-slate-600 font-semibold">
              @{data?.username}
            </span>
            <span className="ml-2 text-xs text-slate-400 font-normal">
              {data?.email}
            </span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/logout" prefetch={false}>
            <LogOutIcon className="w-5 h-5 mr-2" />
            Logout
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Menu = () => {
  const path = usePathname();
  const activePage = useMemo(() => {
    if (path !== "/") {
      for (const page of PAGES) {
        if (path.startsWith("/finances" + page.path) && page.path !== "/") {
          return page.name;
        }
      }
    }
    return "Query";
  }, [path]);

  return (
    <div className="shrink-0 hidden md:flex w-auto h-full fixed md:static flex flex-col bg-slate-50 p-3 gap-2">
      <User />
      <div className="flex flex-col">
        {PAGES.map((page) => {
          return (
            <MenuItem
              page={page}
              key={page.name}
              active={activePage === page.name}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Menu;
