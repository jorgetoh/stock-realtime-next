import { BalanceDisplay } from "@/components/dashboard/balance-display";
import { Suspense } from "react";
import { SkeletonBalanceDisplay } from "@/components/dashboard/skeleton-balanace-display";
import { SocketStatus } from "@/components/dashboard/socket-status";
import { BtcPriceChart } from "@/components/landing/btc-price-chart";
import { TradingCard } from "@/components/dashboard/trading-card";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { SkeletonOrdersTable } from "@/components/dashboard/skeleton-orders-table";
import { UsersBalanceTable } from "@/components/dashboard/users-balance-table";
import { SkeletonUsersBalanceTable } from "@/components/dashboard/skeleton-users-balance-table";
import { DeveloperCard } from "@/components/dashboard/developer-card";

export default async function DashboardPage(props: {
  searchParams?: Promise<{
    order?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const resolvedSearchParams = await props.searchParams;

  return (
    <main className="container mx-auto py-4 max-w-[1200px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
        {/* Left column - Chart */}
        <div className="flex flex-col md:col-span-2 gap-4">
          <Suspense fallback={<SkeletonOrdersTable />}>
            <OrdersTable searchParams={resolvedSearchParams} />
          </Suspense>

          <BtcPriceChart />
        </div>
        <div className="space-y-4">
          <Suspense fallback={<SkeletonBalanceDisplay />}>
            <BalanceDisplay />
          </Suspense>
          <TradingCard />
          <Suspense fallback={<SkeletonUsersBalanceTable />}>
            <UsersBalanceTable searchParams={resolvedSearchParams} />
          </Suspense>
          <DeveloperCard />
        </div>
      </div>
    </main>
  );
}
