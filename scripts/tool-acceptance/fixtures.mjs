import { caseFixtures } from "./case.mjs";
import { encodingFixtures } from "./encoding.mjs";
import { cleanupFixtures } from "./cleanup.mjs";
import { markupFixtures } from "./markup.mjs";
import { listFixtures } from "./list.mjs";
import { analysisFixtures } from "./analysis.mjs";

const homepage = {
  button: "UPPERCASE", input: "Text editor input", copy: "📋 Copy Text", clear: "🧹 Clear",
  undo: /Undo$/,
  cases: [
    { source: "café 東京", expected: "CAFÉ 東京", filename: "fixture.txt" },
    { source: "café 😀", expected: "Y2Fmw6kg8J+YgA==", button: "Encode Base64" },
    { source: "not base64!", error: /Conversion failed|Base64|invalid/i, button: "Decode Base64" },
  ],
};

// Entries are kept separate from application transforms so a regression cannot
// update the implementation and the expected output through the same code path.
const groups = [caseFixtures, encodingFixtures, cleanupFixtures, markupFixtures, listFixtures, analysisFixtures];
const entries = [["/", homepage], ...groups.flatMap((group) =>
  Object.entries(group).map(([slug, fixture]) => [`/${slug}/`, fixture]),
)];

export const toolFixtures = new Map(entries);
if (toolFixtures.size !== entries.length) throw new Error("Duplicate converter acceptance route.");
