export function isPastDeadline(deadline: string | null, now: Date = new Date()): boolean {
  if (!deadline) return false;
  return new Date(deadline) < now;
}

export function hasUnresolvedVerifyTag(body: string): boolean {
  return body.includes("[VERIFY");
}

export function hasReachedDailyLimit(sentToday: number, limit: number): boolean {
  return sentToday >= limit;
}
