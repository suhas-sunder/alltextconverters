/**
 * Mammoth publishes declarations for its main entry point but not for its
 * browser bundle. The bundle exposes the same API and is loaded only for
 * browser-side DOCX extraction.
 */
declare module "mammoth/mammoth.browser" {
  import mammoth = require("mammoth");

  export = mammoth;
}
