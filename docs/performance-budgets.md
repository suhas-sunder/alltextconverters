# Performance budgets

These are lab guardrails, not field Core Web Vitals or service guarantees. Measure against a production-equivalent Preview before changing them.

| Surface | Budget | Current local evidence | Action when exceeded |
| --- | ---: | --- | --- |
| Simple converter initial JS | ≤220 KB gzip | Route chunks generally 1–9 KB gzip; shared entry needs browser measurement. | Check route imports. |
| File-capable initial JS | ≤300 KB gzip before file interaction | File libraries are separate output chunks. | Confirm waterfall preserves interaction loading. |
| CSS | ≤75 KB gzip | Root CSS 52.09 KB raw / 9.47 KB gzip. | Remove unused global CSS first. |
| Largest content image | ≤150 KB | Maintainer JPEG 51 KB; logo ~451 KB is not a content image. | Compress oversized above-fold imagery. |
| Static HTML | ≤250 KB raw | Measure content-heavy pages on Preview. | Reduce duplicated legacy content. |
| Optional chunks | Documented and interaction-loaded | PDF worker ~1.10 MB; Mammoth ~488 KB; jsPDF ~379 KB; html2canvas ~198 KB raw. | Preserve dynamic import boundaries. |
| Placeholder layout shift | 0 attributable CLS | Reserved source dimensions; no field CLS. | Verify in DevTools/Lighthouse. |

Do not claim LCP, CLS, INP, or Lighthouse scores without a named lab run. Optional chunks are acceptable only if they do not load on unrelated initial routes.
