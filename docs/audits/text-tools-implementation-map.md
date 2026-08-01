# Text tools implementation map

This map was verified against `app/routes.ts`, the route components, current transforms, the URL inventory, and the settings matrix before implementation.

| Route | Primary intent | Current implementation | Target | Decision / shared engine | Tests |
| --- | --- | --- | --- | --- | --- |
| `/line-break-remover` | Join hard-wrapped text | two replacements only | five deliberate modes | retain; `text-core` logical lines | line fixtures/modes |
| `/remove-extra-spaces` | Collapse accidental horizontal runs | also removes invisible characters/tabs | narrow, line-preserving spacing cleanup | retain; `text-core` | tabs/line endings |
| `/whitespace-cleaner` | Clean unusual whitespace | silently removes some language-significant characters | configurable Unicode whitespace cleanup | retain; `text-core` | NBSP/U+2028/zero-width |
| `/text-cleaner` | Safe one-click cleanup | route-local implementation | keep safe preset | retain; `text-core` | mixed endings/Unicode |
| `/remove-all-styling-from-text` | Rich text to readable plain text | raw HTML detection and destructive options | safe clipboard-aware plain-text conversion | retain; `rich-text` | HTML/plain fallback |
| `/remove-duplicate-lines` | Stable deduplication | CRLF-only split | exact default and shared line parser | retain; `list-core` | CR/mixed/case |
| `/case-insensitive-sort` | Stable A-Z sort | CRLF-only split | retain semantics with logical lines | retain; `list-core` | stable ordering |
| `/list-to-comma-separated` | Lines to delimited text | bespoke line splitting / optional CSV download | readable delimiter tool | retain; `list-core` | delimiters/Unicode |
| `/text-to-comma-separated-list` | Same direct-conversion intent | duplicate implementation | share engine; no redirect until missing landing data is restored | retain pending data gate | parity regression |
| `/comma-separated-to-list` | Simple delimited text to lines | naive comma split | quote-aware delimited parsing | retain; `csv` + `list-core` | quotes/multiline |
| `/list-to-csv` | One-column list to standards-correct CSV | absent | dedicated CSV workflow | add; `csv` + `list-core` | serialize/round-trip |
| `/csv-to-list` | Extract a CSV column | absent | dedicated column selection workflow | add; `csv` | parse/headers/errors |
| `/table-to-list` | Extract a table/CSV column | naive CSV line parser | consume shared CSV parser for delimited input | retain; `csv` | quoted/multiline |
| `/list-to-table` | Make one-column table | separate output formats | retain distinct HTML/TSV workflow | retain; `list-core`/`csv` | list splitting |
| `/comma-to-json-array` | Delimited values to JSON strings | naive comma split | consume shared CSV parser | retain; `csv` | quoted fields |
| `/json-array-to-list`, list marker tools | JSON/list formatting | existing distinct workflows | no product expansion; reuse only where low risk | retain | regression only |

`/text-to-comma-separated-list` remains indexable in this pass because the audit records a mandatory missing-search-data gate for a permanent redirect. No synonym route is added for line-break or comma-list variants.
