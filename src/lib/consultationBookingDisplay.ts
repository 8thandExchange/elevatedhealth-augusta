export function formatConsultationAmount(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "—";
  const dollars = amount >= 500 ? amount / 100 : amount;
  return `$${Math.round(dollars)}`;
}

export function isAwaitingConsultPayment(status: string): boolean {
  return status === "pending" || status === "pending_payment";
}

export function isPaidConsultation(status: string): boolean {
  return status === "paid";
}
