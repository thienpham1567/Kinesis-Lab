/** Scroll location only; it does not measure reading or comprehension. */
export function readingPosition({
  articleTop,
  articleBottom,
  viewportTop,
  viewportBottom,
  navHeight,
  sectionScrollMargin = 0,
  sectionTops,
}: {
  articleTop: number;
  articleBottom: number;
  viewportTop: number;
  viewportBottom: number;
  navHeight: number;
  sectionScrollMargin?: number;
  sectionTops: number[];
}) {
  const travel = articleBottom - articleTop - (viewportBottom - viewportTop);
  const atEnd = articleTop <= viewportTop && articleBottom <= viewportBottom + 1;
  const percent = atEnd ? 100 : travel > 0
    ? Math.round(Math.max(0, Math.min(1, (viewportTop - articleTop) / travel)) * 100)
    : 0;
  let activeIndex = 0;
  sectionTops.forEach((top, index) => {
    if (top <= viewportTop + Math.max(navHeight + 24, sectionScrollMargin) + 1) activeIndex = index;
  });
  if (atEnd && sectionTops.length) activeIndex = sectionTops.length - 1;
  return { percent, activeIndex };
}
