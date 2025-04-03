"use server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExchangeRateDisplay } from "./exchange-rate-display";

import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { userBalances } from "@/database/schema";
import { eq } from "drizzle-orm";
import { SkeletonBalanceDisplay } from "./skeleton-balanace-display";
import { SocketStatus } from "./socket-status";
import { UserButton } from "@daveyplate/better-auth-ui";

export async function BalanceDisplay() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return <SkeletonBalanceDisplay />;
    }

    let balances = await db
      .select()
      .from(userBalances)
      .where(eq(userBalances.userId, session.user.id))
      .limit(1);

    if (!balances.length) {
      const newBalance = {
        userId: session.user.id,
      };

      await db.insert(userBalances).values(newBalance);

      balances = await db
        .select()
        .from(userBalances)
        .where(eq(userBalances.userId, session.user.id))
        .limit(1);
    }

    if (!balances.length) {
      return <SkeletonBalanceDisplay />;
    }

    const { usdBalance, btcBalance } = balances[0];

    return (
      <Card className="py-4 gap-4">
        <CardHeader>
          <CardTitle className="text-base font-medium flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <UserButton />
              <span>Account Balance</span>
            </div>
            <SocketStatus />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">USD:</div>
              <div className="font-medium">
                $
                {parseFloat(usdBalance).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">BTC:</div>
              <div className="font-medium">
                {parseFloat(btcBalance).toLocaleString("en-US", {
                  minimumFractionDigits: 8,
                  maximumFractionDigits: 8,
                })}{" "}
                BTC
              </div>
            </div>

            <ExchangeRateDisplay />
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error fetching balance:", error);
    return <SkeletonBalanceDisplay />;
  }
}
