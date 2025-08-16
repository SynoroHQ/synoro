"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@synoro/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@synoro/ui/components/dropdown-menu";
import { Input } from "@synoro/ui/components/input";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@synoro/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synoro/ui/components/tooltip";
import { cn } from "@/lib/utils";
import {
  Code,
  Eye,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  Tag,
  XIcon,
} from "lucide-react";

type Monitor = {
  id: string;
  name: string;
  url: string;
  status: "Normal" | "Degraded" | "Failing" | "Inactive";
  tags: string[];
};

interface Filter {
  keywords: string | undefined;
  tags: string[] | undefined;
  active: boolean[] | undefined;
  type: ("HTTP" | "TCP")[] | undefined;
  visibility: boolean[] | undefined;
}

export function NavMonitors({ monitors }: { monitors: Monitor[] }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const [filter, setFilter] = React.useState<Filter>({
    keywords: undefined,
    tags: [],
    active: [],
    type: [],
    visibility: [],
  });
  const router = useRouter();
  const pathname = usePathname();

  function handleFilterChange<T extends keyof Filter>(
    key: T,
    value: NonNullable<Filter[T]> extends (infer U)[] ? U : Filter[T],
  ) {
    setFilter((prev) => {
      if (key === "keywords") {
        return {
          ...prev,
          [key]: value as string,
        };
      }

      const prevArray = prev[key] as unknown[];
      return {
        ...prev,
        [key]: prevArray?.includes(value)
          ? prevArray.filter((v) => v !== value)
          : [...(prevArray || []), value],
      };
    });
  }

  const filteredMonitors = monitors.filter((item) =>
    filter.tags?.length
      ? item.tags.some((tag) => filter.tags?.includes(tag))
      : true,
  );

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel
        className="flex items-center justify-between pr-1"
        style={{ paddingRight: 4 }}
      >
        <span>
          Monitors{" "}
          <code className="text-muted-foreground">
            ({filteredMonitors.length}
            {filteredMonitors.length !== monitors.length
              ? `/${monitors.length}`
              : ""}
            )
          </code>
        </span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="relative top-0 right-0">
                      <Search className="text-muted-foreground" />
                      <span className="sr-only">Filter</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  Filter Monitors
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent
              className="w-56"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuLabel>Filter options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Input
                    type="text"
                    tabIndex={0}
                    className="h-8"
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    placeholder="Keywords"
                    onChange={(e) => {
                      handleFilterChange("keywords", e.target.value);
                    }}
                    onClick={(e) => e.preventDefault()}
                    onSelect={(e) => e.preventDefault()}
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                    <Tag className="text-muted-foreground" />
                    Tags
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {(["Production", "Development", "Staging"] as const).map(
                        (tag) => (
                          <DropdownMenuCheckboxItem
                            key={tag}
                            checked={filter.tags?.includes(tag)}
                            onSelect={(e) => {
                              e.preventDefault();
                              handleFilterChange("tags", tag);
                            }}
                          >
                            {tag}
                          </DropdownMenuCheckboxItem>
                        ),
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setFilter({
                    keywords: undefined,
                    tags: undefined,
                    active: undefined,
                    type: undefined,
                    visibility: undefined,
                  });
                }}
              >
                <RotateCcw /> Clear filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem className="mx-2 flex flex-wrap gap-0.5">
          {Object.keys(filter).map((key) => {
            const filterValue = filter[key as keyof Filter];
            if (typeof filterValue === "string") {
              return (
                <Badge
                  key={`${key}-${filterValue}`}
                  variant="outline"
                  className="overflow-visible"
                >
                  {filterValue}
                  <button
                    className="focus-visible:border-ring focus-visible:ring-ring/50 text-foreground/60 hover:text-foreground -my-[5px] -ms-0.5 -me-2 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                    onClick={() => {
                      handleFilterChange(key as keyof Filter, filterValue);
                    }}
                    aria-label="Delete"
                  >
                    <XIcon className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              );
            }
            if (Array.isArray(filterValue)) {
              return filterValue.map((item) => {
                return (
                  <Badge
                    key={`${key}-${item}`}
                    variant="outline"
                    className="overflow-visible"
                  >
                    {item.toString()}
                    <button
                      className="focus-visible:border-ring focus-visible:ring-ring/50 text-foreground/60 hover:text-foreground -my-[5px] -ms-0.5 -me-2 inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[inherit] p-0 transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                      onClick={() => {
                        // @ts-expect-error we know that the item is a string
                        handleFilterChange(key as keyof Filter, item);
                      }}
                      aria-label="Delete"
                    >
                      <XIcon className="size-3" aria-hidden="true" />
                    </button>
                  </Badge>
                );
              });
            }
            return null;
          })}
        </SidebarMenuItem>
        {filteredMonitors.map((item) => {
          const isActive = item.url.startsWith(pathname);
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                className="group-has-data-[sidebar=menu-dot]/menu-item:pr-11"
                asChild
              >
                <Link
                  href="/dashboard/overview"
                  onClick={() => setOpenMobile(false)}
                >
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
