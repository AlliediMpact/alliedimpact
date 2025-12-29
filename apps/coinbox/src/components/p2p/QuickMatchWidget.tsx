"use client";

import { useState } from "react";
import { findMatches, autoMatchOrder } from "@/lib/matchingApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

interface QuickMatchProps {
  userId: string;
  asset: string;
  fiatCurrency: string;
}

export function QuickMatchWidget({ userId, asset, fiatCurrency }: QuickMatchProps) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [finding, setFinding] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  async function handleFindMatches() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setFinding(true);
      const result = await findMatches({
        orderType,
        asset,
        fiatCurrency,
        amount: parseFloat(amount),
        userId,
      });

      if (result.matched && result.offers.length > 0) {
        setMatches(result.offers);
        toast.success(`Found ${result.offers.length} matching offers!`);
      } else {
        setMatches([]);
        toast.info(result.reason || "No matching offers found");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setFinding(false);
    }
  }

  async function handleAutoMatch() {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setMatching(true);
      const result = await autoMatchOrder({
        orderType,
        asset,
        fiatCurrency,
        amount: parseFloat(amount),
        userId,
      });

      if (result.matched && result.orderId) {
        toast.success("Order matched successfully! 🎉");
        router.push(`/${locale}/p2p/order/${result.orderId}`);
      } else {
        toast.info("No matching offers available");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setMatching(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Quick Match
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={orderType === "buy" ? "default" : "outline"}
            onClick={() => setOrderType("buy")}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Buy
          </Button>
          <Button
            variant={orderType === "sell" ? "default" : "outline"}
            onClick={() => setOrderType("sell")}
            className="flex-1"
          >
            <TrendingDown className="h-4 w-4 mr-2" />
            Sell
          </Button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Amount ({fiatCurrency})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleFindMatches}
            disabled={finding || !amount}
            variant="outline"
            className="flex-1"
          >
            {finding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finding...
              </>
            ) : (
              "Find Matches"
            )}
          </Button>
          <Button
            onClick={handleAutoMatch}
            disabled={matching || !amount}
            className="flex-1"
          >
            {matching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Matching...
              </>
            ) : (
              "Auto Match"
            )}
          </Button>
        </div>

        {/* Matches Display */}
        {matches.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-semibold">
              Found {matches.length} matches:
            </p>
            {matches.slice(0, 3).map((offer, index) => (
              <Card key={offer.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={offer.offerType === "buy" ? "default" : "destructive"}>
                        {offer.offerType.toUpperCase()}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Best Match
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-mono mt-1">
                      {offer.price.toFixed(2)} {fiatCurrency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Limit: {offer.minLimit} - {offer.maxLimit}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/${locale}/p2p/offer/${offer.id}`)}
                  >
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
