import { utf8Bytes } from "./bytes";

export const INPUT_SIZE_POLICY = {
  normalInteractiveBytes: 100 * 1024,
  warningBytes: 1024 * 1024,
  hardLimitBytes: 5 * 1024 * 1024,
  previewRows: 200,
} as const;

export type InputSizeAssessment = {
  bytes: number;
  level: "normal" | "large" | "warning" | "blocked";
  message: string | null;
};

export function assessInputSize(input: string): InputSizeAssessment {
  const bytes = utf8Bytes(String(input ?? "")).length;
  if (bytes > INPUT_SIZE_POLICY.hardLimitBytes) {
    return {
      bytes,
      level: "blocked",
      message: "This input is over the 5 MB browser-processing limit. Split it into smaller parts and try again.",
    };
  }
  if (bytes >= INPUT_SIZE_POLICY.warningBytes) {
    return {
      bytes,
      level: "warning",
      message: "Large input: conversion may briefly make this browser tab less responsive. Your text still stays in this browser.",
    };
  }
  if (bytes > INPUT_SIZE_POLICY.normalInteractiveBytes) {
    return {
      bytes,
      level: "large",
      message: "This is a larger-than-usual input. Conversion remains browser-local.",
    };
  }
  return { bytes, level: "normal", message: null };
}

export function formatByteCount(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
