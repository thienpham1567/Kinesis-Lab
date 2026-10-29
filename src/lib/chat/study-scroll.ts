/** Preserve a reader's place while tokens arrive; tolerate small layout rounding. */
export function isNearStudyBottom(metrics: {
  scrollHeight: number;
  clientHeight: number;
  scrollTop: number;
}) {
  return metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop <= 64;
}
