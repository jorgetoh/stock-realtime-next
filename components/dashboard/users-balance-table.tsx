"use server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { userBalances, users } from "@/database/schema";
import { desc, eq, sql } from "drizzle-orm";
import { UsersBalanceTableClient } from "./users-balance-table-client";
import { SkeletonUsersBalanceTable } from "./skeleton-users-balance-table";

const ITEMS_PER_PAGE = 5;

export async function UsersBalanceTable({
  searchParams,
}: {
  searchParams?: {
    usersPage?: string;
    order?: string;
    type?: string;
    status?: string;
    page?: string;
  };
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return <SkeletonUsersBalanceTable />;
    }

    const currentPage = Number(searchParams?.usersPage) || 1;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const usersWithBalances = await db
      .select({
        id: users.id,
        name: users.name,
        usdBalance: userBalances.usdBalance,
        btcBalance: userBalances.btcBalance,
      })
      .from(users)
      .leftJoin(userBalances, eq(users.id, userBalances.userId))
      .orderBy(desc(userBalances.usdBalance))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    const currentUserRank = await db
      .select({
        rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userBalances.usdBalance} DESC)`,
      })
      .from(users)
      .leftJoin(userBalances, eq(users.id, userBalances.userId))
      .where(eq(users.id, session.user.id))
      .then((result) => result[0]?.rank || 0);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    return (
      <Card className="gap-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Balance Ranking</CardTitle>
            {currentUserRank > 0 && (
              <span className="text-sm text-muted-foreground">
                Your rank: #{currentUserRank}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <UsersBalanceTableClient
            users={usersWithBalances}
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
            currentUserRank={currentUserRank}
          />
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error fetching users balance:", error);
    return <SkeletonUsersBalanceTable />;
  }
}
