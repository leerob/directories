import "server-only";

import type { ReviewFlag, ReviewVerdict } from "./plugin-reviewer";

export type ReviewStatus =
  | "pending"
  | "scanning"
  | "auto_approved"
  | "approved"
  | "flagged"
  | "auto_declined"
  | "declined";

export type PolicyDecision = {
  review_status: ReviewStatus;
  active: boolean;
};

/**
 * Balanced auto-review policy.
 *
 * - auto_approved: clear wins (high scores, no severe flags).
 * - auto_declined: clearly malicious.
 * - flagged: everything else. Admin reviews the queue.
 *
 * If an admin-triggered rerun comes back anything other than auto_approved,
 * we turn it off so bad updates can be caught manually.
 */
export function decideVerdict(
  verdict: ReviewVerdict,
  opts: { wasActive: boolean } = { wasActive: false },
): PolicyDecision {
  const hasCritical = verdict.flags.some((f) => f.severity === "critical");
  const hasHigh = verdict.flags.some((f) => f.severity === "high");

  const isAutoDecline =
    verdict.recommendation === "decline" &&
    hasCritical &&
    verdict.security_score < 40;

  if (isAutoDecline) {
    return { review_status: "auto_declined", active: false };
  }

  const isAutoApprove =
    verdict.recommendation === "approve" &&
    verdict.security_score >= 85 &&
    verdict.quality_score >= 70 &&
    !hasHigh &&
    !hasCritical;

  if (isAutoApprove) {
    return { review_status: "auto_approved", active: true };
  }

  // Everything else is ambiguous → flag. If the plugin was previously live we
  // still pull it down (active=false); the `wasActive` signal is preserved for
  // callers that want to notify.
  void opts.wasActive;
  return {
    review_status: "flagged",
    active: false,
  };
}

export function summarizeFlags(flags: ReviewFlag[]): string {
  const bySeverity = {
    critical: flags.filter((f) => f.severity === "critical").length,
    high: flags.filter((f) => f.severity === "high").length,
    medium: flags.filter((f) => f.severity === "medium").length,
    low: flags.filter((f) => f.severity === "low").length,
  };
  const parts: string[] = [];
  if (bySeverity.critical) parts.push(`${bySeverity.critical} critical`);
  if (bySeverity.high) parts.push(`${bySeverity.high} high`);
  if (bySeverity.medium) parts.push(`${bySeverity.medium} medium`);
  if (bySeverity.low) parts.push(`${bySeverity.low} low`);
  return parts.join(", ") || "no findings";
}
