"use client";

import { Button } from "@/components/ui/button";
import { useSocket } from "@/context/socket-context";
import { createMarketOrder, createLimitOrder } from "@/actions/trading";
import { toast } from "sonner";

interface OrderSummaryProps {
  amount: string;
  price?: number;
  orderType: "BUY" | "SELL";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  buttonText: string;
  onSuccess: () => void;
}

export function OrderSummary({
  amount,
  price,
  orderType,
  isLoading,
  setIsLoading,
  buttonText,
  onSuccess,
}: OrderSummaryProps) {
  const { data: btcPrice } = useSocket();

  const handleMarketOrder = async () => {
    try {
      setIsLoading(true);
      if (!btcPrice) {
        toast.error("Error", {
          description: "BTC price not available",
        });
        return;
      }
      const currentPrice = parseFloat(btcPrice.price);
      const result = await createMarketOrder(
        orderType,
        parseFloat(amount),
        currentPrice
      );

      if (result.success) {
        toast.success("Order placed", {
          description: `Successfully placed ${orderType.toLowerCase()} order for ${amount} BTC at current market price`,
        });
        onSuccess();
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimitOrder = async () => {
    try {
      setIsLoading(true);
      if (!price) {
        toast.error("Error", {
          description: "Price is required for limit orders",
        });
        return;
      }
      const result = await createLimitOrder(
        orderType,
        parseFloat(amount),
        parseFloat(price.toString())
      );

      if (result.success) {
        toast.success("Order placed", {
          description: `Successfully placed ${orderType.toLowerCase()} order for ${amount} BTC at $${price}`,
        });
        onSuccess();
      } else {
        toast.error("Error", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderOrderSummary = (amount: string, price: number) => {
    if (!amount) return null;

    const btcAmount = parseFloat(amount);
    const totalValue = btcAmount * price;

    return (
      <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
        <h4 className="font-medium">Order Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Type:</div>
          <div
            className={`font-medium ${
              orderType === "BUY"
                ? "text-[var(--badge-success)]"
                : "text-destructive"
            }`}
          >
            {orderType}
          </div>

          <div className="text-muted-foreground">Amount:</div>
          <div className="font-medium">{btcAmount.toFixed(8)} BTC</div>

          <div className="text-muted-foreground">Price:</div>
          <div className="font-medium">${price.toLocaleString()}</div>

          <div className="text-muted-foreground">Total Value:</div>
          <div className="font-medium">${totalValue.toLocaleString()}</div>
        </div>
      </div>
    );
  };

  const currentPrice = btcPrice ? parseFloat(btcPrice.price) : null;
  const displayPrice = price ?? currentPrice;

  const handleOrder = () => {
    if (price) {
      handleLimitOrder();
    } else {
      handleMarketOrder();
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-6 text-sm text-muted-foreground">
        {currentPrice ? (
          <>Current BTC Price: ${currentPrice.toLocaleString()}</>
        ) : (
          <span className="animate-pulse">Loading price...</span>
        )}
      </div>
      {amount && displayPrice && renderOrderSummary(amount, displayPrice)}
      <Button
        onClick={handleOrder}
        disabled={isLoading || !amount || (!price && !currentPrice)}
        className={`w-full text-white ${
          orderType === "BUY"
            ? "bg-[var(--badge-success)] hover:bg-[var(--badge-success-hover)]"
            : "bg-destructive hover:bg-destructive/80"
        }`}
      >
        {buttonText}
      </Button>
    </div>
  );
}
