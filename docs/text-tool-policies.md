# Text tool policies

- Generated plain-text output uses LF (`\n`). CSV downloads default to CRLF and offer LF.
- Simple list parsing is for literal delimiters and one-item-per-line input. It is not used for CSV when quoted delimiters or multiline fields matter.
- The shared CSV parser is a browser-local state machine supporting quoted fields, doubled quotes, LF/CRLF/CR, UTF-8 BOM, trailing empty fields, and quoted multiline values. The serializer quotes delimiter, quote, newline, and edge-whitespace values and doubles embedded quotes.
- List to CSV is a one-column CSV workflow. Simple List to Comma output is deliberately not presented as CSV.
- Rich clipboard HTML is parsed in an inert `DOMParser` document; it is never mounted, executed, or fetched. Script/style/template/frame-like nodes are discarded. Plain text remains the fallback.
- Input and output are not included in URLs, application analytics, ad placeholders, or server-side conversion. No live ad-network code is used.
- Current bounded CSV previews show at most 25 rows; conversion and download retain the full result. HTML/XML/URL/hex/binary/ASCII tools use the encoding policy thresholds: 100 KB normal, warning at 1 MB, hard limit above 5 MB, and at most 200 rendered detail rows. Worker processing remains deferred pending profiling.
- The `text-to-comma-separated-list` route is retained pending the documented missing landing-page-data gate; it must not redirect until that evidence is available.
