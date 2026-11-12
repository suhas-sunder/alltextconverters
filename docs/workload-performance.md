# Browser workload performance

Run the optional lab against a validated static build with Node 22 and a separately installed Playwright Core and Chromium-based browser.

```text
node scripts/verify-workload-performance.mjs --build-dir build/client --report workload-results.json
node scripts/verify-workload-performance.mjs --flow xml-compact --size-kib 512 --xml-build /path/to/build/client --report xml-results.json
```

Set `PLAYWRIGHT_CORE_PATH` and `BROWSER_EXECUTABLE`, or pass `--playwright` and `--executable`. The per-tool build overrides let the same script compare independent staging patches. The default checks binary encode and decode, JSON minification, XML compaction, CSV to JSON, and JSON to CSV. It runs three cold samples per case at 320 and 1280 px with 4× CPU throttling. Its fixtures cover 10 KiB, 100 KiB, 1 MiB, and 5 MiB, plus the 512 KiB XML boundary. Binary decode sizes refer to the decoded bytes. Oversize inputs are tested for refusal.

The script uses temporary on-disk files and a loopback static server. It times import and conversion from their browser events to the result or error and then to two animation frames. It records overlapping main-thread tasks of at least 50 ms, native XML parse time, requested assets before and after each action, and raw and gzip-estimated asset sizes. One download per size and width checks bytes or record counts. These are local lab measurements. Compare runs on the same machine and browser with other CPU-intensive work paused.

## XML worker comparison

On Windows with Ryzen 9 5950X, Edge 157.0.4341.46, Node 22.23.1, and 4× throttle, the table shows medians from three cold samples per case. The comparison used 512 KiB of XML for the maximum supported workload and the element-only compact option. Native parsing still runs in the browser’s detached DOM parser. The worker handles lexical scanning and output assembly.

| Width | XML input | Action to result before / after | Longest task before / after |
| --- | --- | --- | --- |
| 320 px | 10 KiB | 65 / 66 ms | none / none |
| 320 px | 100 KiB | 102 / 75 ms | none / none |
| 320 px | 512 KiB | 206 / 160 ms | 125 / 72 ms |
| 1280 px | 10 KiB | 66 / 58 ms | none / none |
| 1280 px | 100 KiB | 97 / 76 ms | none / none |
| 1280 px | 512 KiB | 207 / 176 ms | 126 / 79 ms |

Initial XML-route JavaScript measured 429,068 bytes before and 429,009 after. JavaScript requested on the first XML action fell from 14,467 to 7,566 bytes. The largest action retained approximately 71–76 ms of native XML parsing. The worker implementation retains the native parser, input caps, output format and source preservation policy.
