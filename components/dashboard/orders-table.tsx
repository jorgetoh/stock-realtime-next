"use server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { orders } from "@/database/schema";
import { desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { CustomTableFilter } from "./orders-table-filters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SkeletonOrdersTable } from "./skeleton-orders-table";

const ITEMS_PER_PAGE = 10;

const getOrderTypeVariant = (type: string) => {
  switch (type) {
    case "BUY":
      return "success";
    case "SELL":
      return "destructive";
    default:
      return "default";
  }
};

const getOrderStatusVariant = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "destructive";
    default:
      return "default";
  }
};

export async function OrdersTable({
  searchParams,
}: {
  searchParams?: {
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
      return <SkeletonOrdersTable />;
    }

    const currentPage = Number(searchParams?.page) || 1;
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    const whereConditions = [eq(orders.userId, session.user.id)];

    if (searchParams?.type) {
      const types = searchParams.type.split(",");
      const validTypes = types.filter(
        (type) => type === "BUY" || type === "SELL"
      );
      if (validTypes.length > 0) {
        whereConditions.push(
          sql`${orders.type} IN (${sql.join(
            validTypes.map((t) => sql`${t}`),
            sql`, `
          )})`
        );
      }
    }

    if (searchParams?.status) {
      const statuses = searchParams.status
        .split(",")
        .map((s) => s.toUpperCase());
      const validStatuses = statuses.filter(
        (status) =>
          status === "PENDING" ||
          status === "COMPLETED" ||
          status === "CANCELLED"
      );
      if (validStatuses.length > 0) {
        whereConditions.push(
          sql`${orders.status} IN (${sql.join(
            validStatuses.map((s) => sql`${s}`),
            sql`, `
          )})`
        );
      }
    }

    const sortOrder = searchParams?.order === "OLD" ? "asc" : "desc";

    const userOrders = await db
      .select()
      .from(orders)
      .where(sql`${sql.join(whereConditions, sql` AND `)}`)
      .orderBy(sortOrder === "asc" ? orders.createdAt : desc(orders.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    const totalOrders = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(sql`${sql.join(whereConditions, sql` AND `)}`);

    const totalPages = Math.ceil(totalOrders[0].count / ITEMS_PER_PAGE);

    return (
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Orders History</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomTableFilter />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Type</TooltipTrigger>
                      <TooltipContent>
                        <p>Whether you bought or sold Bitcoin</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Status</TooltipTrigger>
                      <TooltipContent>
                        <p>The current state of your order</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Amount</TooltipTrigger>
                      <TooltipContent>
                        <p>The quantity of Bitcoin in the order</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Price</TooltipTrigger>
                      <TooltipContent>
                        <p>The price per Bitcoin in USD</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Total Value</TooltipTrigger>
                      <TooltipContent>
                        <p>
                          The total value of the order in USD (Amount × Price)
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>Date</TooltipTrigger>
                      <TooltipContent>
                        <p>When the order was created</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Badge variant={getOrderTypeVariant(order.type)}>
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOrderStatusVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.amount} BTC</TableCell>
                  <TableCell>${order.price}</TableCell>
                  <TableCell>${order.totalValue}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {userOrders.length < ITEMS_PER_PAGE &&
                Array.from({ length: ITEMS_PER_PAGE - userOrders.length }).map(
                  (_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell>
                        <Badge variant="default" className="opacity-0">
                          EMPTY
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="opacity-0">
                          EMPTY
                        </Badge>
                      </TableCell>
                      <TableCell className="opacity-0">0 BTC</TableCell>
                      <TableCell className="opacity-0">$0</TableCell>
                      <TableCell className="opacity-0">$0</TableCell>
                      <TableCell className="opacity-0">01/01/2024</TableCell>
                    </TableRow>
                  )
                )}
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
                      page: String(currentPage - 1),
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
                      page: String(currentPage + 1),
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
        </CardContent>
      </Card>
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return <SkeletonOrdersTable />;
  }
}
