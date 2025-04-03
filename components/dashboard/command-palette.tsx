"use client";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Home,
  Bitcoin,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";
import { useSession } from "@/hooks/use-auth-hooks";
import { BitcoinPriceItem } from "./bitcoin-price-item";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="hidden">Command Menu</DialogTitle>

      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {session ? (
          <>
            <CommandGroup heading="Navigation">
              <CommandItem
                onSelect={() => {
                  router.push("/dashboard");
                  setOpen(false);
                }}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/auth/settings");
                  setOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Account
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/");
                  setOpen(false);
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Landing Page
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Exchange Rate">
              <BitcoinPriceItem />
            </CommandGroup>
          </>
        ) : (
          <>
            <CommandGroup heading="Authentication">
              <CommandItem
                onSelect={() => {
                  router.push("/auth/sign-in");
                  setOpen(false);
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/auth/sign-up");
                  setOpen(false);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/");
                  setOpen(false);
                }}
              >
                <Home className="mr-2 h-4 w-4" />
                Landing Page
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Exchange Rate">
              <BitcoinPriceItem />
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
