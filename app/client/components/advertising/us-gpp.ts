import { GppModel } from "@iabgpp/cmpapi";

const national = { id: 7, name: "usnat", fields: ["SaleOptOut", "SharingOptOut", "TargetedAdvertisingOptOut"] };
const stateSections = {
  CA: { id: 8, name: "usca", fields: ["SaleOptOut", "SharingOptOut"] },
  VA: { id: 9, name: "usva", fields: ["SaleOptOut", "TargetedAdvertisingOptOut"] },
  CO: { id: 10, name: "usco", fields: ["SaleOptOut", "TargetedAdvertisingOptOut"] },
  CT: { id: 12, name: "usct", fields: ["SaleOptOut", "TargetedAdvertisingOptOut"] },
  FL: { id: 13, name: "usfl", fields: ["SaleOptOut", "TargetedAdvertisingOptOut"] },
} as const;

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function readIds(value: unknown): number[] | undefined {
  if (!Array.isArray(value) || value.length < 1 || value.length > 64 ||
      !value.every((id) => Number.isSafeInteger(id) && id > 0) || new Set(value).size !== value.length) return;
  return value;
}

function allowsSection(model: GppModel, section: { id: number; name: string; fields: readonly string[] }, raw: unknown) {
  const decoded = record(model.getSection(section.name));
  const split = Array.isArray(raw);
  if (split && (raw.length < 1 || raw.length > 2)) return false;
  const core = record(split ? raw[0] : raw);
  const version = decoded?.Version;
  if (!decoded || !core || core.Version !== version ||
      (version !== 1 && (section.id !== national.id || version !== 2))) return false;

  if (!section.fields.every((key) => decoded[key] === 2 && core[key] === 2)) return false;
  if (decoded.MspaServiceProviderMode === 1 || core.MspaServiceProviderMode === 1) return false;
  if (split && (Object.hasOwn(core, "Gpc") || Object.hasOwn(core, "GpcSegmentType"))) return false;

  // The CMP specification uses split segments. The IAB reference SDK emits flat section objects.
  const gpc = split ? record(raw[1]) : core;
  const segmentType = split ? gpc?.SubsectionType : gpc?.GpcSegmentType;
  const hasGpc = split ? raw.length === 2 : Object.hasOwn(core, "Gpc") || Object.hasOwn(core, "GpcSegmentType");
  const decodedHasGpc = Object.hasOwn(decoded, "Gpc");
  return hasGpc === decodedHasGpc &&
    (!hasGpc || (segmentType === 1 && gpc?.Gpc === false && decoded.Gpc === false));
}

export function allowsUsGpp(value: unknown, approvedCmpId: number | undefined, state: string) {
  const ping = record(value);
  if (!ping || !Number.isSafeInteger(approvedCmpId) || (approvedCmpId ?? 0) <= 0 ||
      ping.cmpId !== approvedCmpId || ping.gppVersion !== "1.1" ||
      ping.cmpStatus !== "loaded" || ping.signalStatus !== "ready" ||
      ![undefined, null, "hidden", "disabled"].includes(ping.cmpDisplayStatus as string | null | undefined)) return false;
  const applicable = readIds(ping.applicableSections);
  const listed = readIds(ping.sectionList);
  const parsed = record(ping.parsedSections);
  const encoded = ping.gppString;
  if (!applicable || !listed || !parsed || typeof encoded !== "string" || encoded.length > 16_384 ||
      !/^[A-Za-z0-9_-]+(?:~[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*)+$/.test(encoded)) return false;
  const matchingState = Object.hasOwn(stateSections, state) ? stateSections[state as keyof typeof stateSections] : undefined;
  const allowedSections = matchingState ? [national, matchingState] : [national];
  try {
    const model = new GppModel(encoded);
    const decodedIds = model.getSectionIds();
    if (decodedIds.length !== listed.length || encoded.split("~").length !== decodedIds.length + 1 ||
        !listed.every((id) => decodedIds.includes(id))) return false;

    return applicable.every((id) => {
      const section = allowedSections.find((candidate) => candidate.id === id);
      return section !== undefined && listed.includes(id) && Object.hasOwn(parsed, section.name) &&
        allowsSection(model, section, parsed[section.name]);
    });
  } catch {
    return false;
  }
}
