"use client";

import { CommandItem } from "@/components/ui/command";
import { Check, Copy } from "lucide-react";
import { SocketStatus } from "./socket-status";
import { useSocket } from "@/context/socket-context";
import React from "react";
import { toast } from "sonner";

export function BitcoinPriceItem() {
  const { data } = useSocket();
  const [previousPrice, setPreviousPrice] = React.useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = React.useState<number>(-1);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (data?.price) {
      setPreviousPrice(currentPrice);
      setCurrentPrice(Number(data.price));
    }
  }, [data?.price]);

  const priceChange = previousPrice ? currentPrice - previousPrice : 0;
  const priceColor =
    priceChange > 0 ? "text-green-500" : priceChange < 0 ? "text-red-500" : "";
  const arrow = priceChange > 0 ? "↑" : priceChange < 0 ? "↓" : "";

  const handleCopyPrice = async () => {
    try {
      await navigator.clipboard.writeText(currentPrice.toString());
      setCopied(true);
      toast.success("Price copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy price");
    }
  };

  return (
    <CommandItem
      className="flex justify-between items-center"
      onSelect={handleCopyPrice}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>1 BTC</span>
        </div>
        <span className={priceColor}>
          {arrow} $
          {currentPrice.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <SocketStatus />
    </CommandItem>
  );
}
