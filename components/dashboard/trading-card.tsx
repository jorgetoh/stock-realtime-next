"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OrderSummary } from "./order-summary";

export function TradingCard() {
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderType] = useState<"BUY" | "SELL">("BUY");

  const handleSuccess = () => {
    setAmount("");
    setPrice("");
  };

  const OrderTypeSelector = () => (
    <div className="space-y-2">
      <Label>Order Type</Label>
      <RadioGroup
        value={orderType}
        onValueChange={(value) => setOrderType(value as "BUY" | "SELL")}
        className="grid grid-cols-2 gap-2"
      >
        <div>
          <RadioGroupItem
            value="BUY"
            id={`${orderType}-buy`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`${orderType}-buy`}
            className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-transparent px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[var(--badge-success)] [&:has([data-state=checked])]:border-[var(--badge-success)] cursor-pointer"
          >
            <span className="text-[var(--badge-success)] font-medium">Buy</span>
            <span className="text-sm text-muted-foreground">USD → BTC</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem
            value="SELL"
            id={`${orderType}-sell`}
            className="peer sr-only"
          />
          <Label
            htmlFor={`${orderType}-sell`}
            className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-transparent px-4 py-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive [&:has([data-state=checked])]:border-destructive cursor-pointer"
          >
            <span className="text-destructive font-medium">Sell</span>
            <span className="text-sm text-muted-foreground">BTC → USD</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <Card className="mt-4 gap-4">
      <CardHeader>
        <CardTitle className="text-base font-medium">Trade Bitcoin</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market Order</TabsTrigger>
            <TabsTrigger value="limit">Limit Order</TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            <div className="space-y-4">
              <OrderTypeSelector />

              <div className="space-y-2">
                <Label htmlFor="market-amount">Amount (BTC)</Label>
                <Input
                  id="market-amount"
                  type="number"
                  step="0.00000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00000000"
                />
              </div>

              <OrderSummary
                amount={amount}
                orderType={orderType}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onSuccess={handleSuccess}
                buttonText={`${orderType} BTC`}
              />
            </div>
          </TabsContent>

          <TabsContent value="limit">
            <div className="space-y-4">
              <OrderTypeSelector />

              <div className="space-y-2">
                <Label htmlFor="limit-amount">Amount (BTC)</Label>
                <Input
                  id="limit-amount"
                  type="number"
                  step="0.00000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00000000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit-price">Price (USD)</Label>
                <Input
                  id="limit-price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <OrderSummary
                amount={amount}
                price={price ? parseFloat(price) : undefined}
                orderType={orderType}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onSuccess={handleSuccess}
                buttonText={`Place ${orderType} Order`}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
