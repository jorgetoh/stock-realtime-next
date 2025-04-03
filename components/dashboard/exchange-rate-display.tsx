"use client";

import { useSocket } from "@/context/socket-context";
import { useEffect, useState } from "react";

export function ExchangeRateDisplay() {
  const { data } = useSocket();
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    if (data?.price) {
      setPreviousPrice(currentPrice);
      setCurrentPrice(Number(data.price));
    }
  }, [data?.price]);

  const priceChange = previousPrice ? currentPrice - previousPrice : 0;
  const priceColor =
    priceChange > 0 ? "text-green-500" : priceChange < 0 ? "text-red-500" : "";
  const arrow = priceChange > 0 ? "↑" : priceChange < 0 ? "↓" : "";

  return (
    <>
      <div className="flex justify-between">
        <div className="text-sm text-muted-foreground">BTC Value:</div>
        <div className="font-medium">{data?.priceChangePercent}%</div>
      </div>
      <div className="flex justify-between pt-1 border-t">
        <div className="text-sm text-muted-foreground">Exchange Rate:</div>
        <div>
          <span className={priceColor}>{arrow}</span> $
          {Number(currentPrice).toFixed(2)}
        </div>
      </div>
    </>
  );
}
