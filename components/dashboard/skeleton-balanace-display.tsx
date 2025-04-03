import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SocketStatus } from "./socket-status";
import { UserButton } from "@daveyplate/better-auth-ui";

export function SkeletonBalanceDisplay() {
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
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
