"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserTotalValue } from "./user-total-value";
import { useSession } from "@/hooks/use-auth-hooks";

interface User {
  id: string;
  name: string;
  usdBalance: string | null;
  btcBalance: string | null;
}

interface UsersBalanceTableClientProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  currentUserRank: number;
  searchParams?: {
    usersPage?: string;
    order?: string;
    type?: string;
    status?: string;
    page?: string;
  };
}

export function UsersBalanceTableClient({
  users,
  currentPage,
  totalPages,
  currentUserRank,
  searchParams,
}: UsersBalanceTableClientProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Rank</TooltipTrigger>
                  <TooltipContent>
                    <p>User's rank based on total balance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Name</TooltipTrigger>
                  <TooltipContent>
                    <p>User's display name</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>Total Value (USD)</TooltipTrigger>
                  <TooltipContent>
                    <p>Total value of USD + BTC balance in USD</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={user.id}>
              <TableCell>
                <Badge variant={index < 3 ? "default" : "secondary"}>
                  #{index + 1}
                </Badge>
              </TableCell>
              <TableCell>
                {user.id === currentUserId ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-[var(--badge-success)] font-medium">
                          {user.name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is you</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  user.name
                )}
              </TableCell>
              <TableCell>
                <UserTotalValue
                  usdBalance={user.usdBalance}
                  btcBalance={user.btcBalance}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end space-x-2 pt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          {currentPage > 1 && totalPages > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard?${new URLSearchParams({
                  ...searchParams,
                  usersPage: String(currentPage - 1),
                }).toString()}`}
              >
                Previous
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {currentPage < totalPages && totalPages > 1 ? (
            <Button variant="outline" size="sm" asChild>
              <Link
                href={`/dashboard?${new URLSearchParams({
                  ...searchParams,
                  usersPage: String(currentPage + 1),
                }).toString()}`}
              >
                Next
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
