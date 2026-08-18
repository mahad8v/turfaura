import { formatMoney } from "@/lib/format";

export function Money({ amount, currency }: { amount: number | string; currency: string }) {
  return <>{formatMoney(amount, currency)}</>;
}
