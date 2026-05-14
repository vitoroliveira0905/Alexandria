"use client";;
import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";

const PriceContext = createContext({ onSale: false });
export const usePriceContext = () => useContext(PriceContext);

const formatterCache = new Map();

function formatCurrency(value, currency = "USD", locale = "en-US") {
  const key = `${locale}-${currency}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, { style: "currency", currency }));
  }
  return formatterCache.get(key).format(value);
}

const Price = ({
  className,
  children,
  onSale
}) => {
  return (
    <PriceContext.Provider value={{ onSale }}>
      <div className={cn("flex flex-wrap items-center gap-x-2", className)}>
        {children}
      </div>
    </PriceContext.Provider>
  );
};

const PriceValue = ({
  price,
  currency = "USD",
  variant = "regular",
  className
}) => {
  const { onSale } = usePriceContext();

  if (price == null) return null;

  return (
    <span
      className={cn("leading-tight", variant === "regular"
        ? onSale
          ? "text-muted-foreground line-through"
          : "text-foreground"
        : "text-foreground", className)}>
      {formatCurrency(price, currency)}
    </span>
  );
};

export { Price, PriceValue };
