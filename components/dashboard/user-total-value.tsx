"use client";

import { useSocket } from "@/context/socket-context";

interface UserTotalValueProps {
  usdBalance: string | null;
  btcBalance: string | null;
}

export function UserTotalValue({
  usdBalance,
  btcBalance,
}: UserTotalValueProps) {
  const { data: btcPrice } = useSocket();
  const currentBtcPrice = btcPrice ? parseFloat(btcPrice.price) : 0;

  const usdValue = parseFloat(usdBalance || "0");
  const btcValue = parseFloat(btcBalance || "0") * currentBtcPrice;
  const totalValue = usdValue + btcValue;

  return (
    <>
      $
      {totalValue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </>
  );
}
