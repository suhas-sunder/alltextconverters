import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function BaseIcon({ title, children, ...props }: IconProps & { children: any }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export function IconUpload(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Upload"} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v14" />
    </BaseIcon>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Download"} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </BaseIcon>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Copy"} {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </BaseIcon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Clear"} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </BaseIcon>
  );
}

export function IconBold(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Bold"} {...props}>
      <path d="M7 4h6a4 4 0 0 1 0 8H7z" />
      <path d="M7 12h7a4 4 0 0 1 0 8H7z" />
    </BaseIcon>
  );
}

export function IconItalic(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Italic"} {...props}>
      <path d="M19 4h-7" />
      <path d="M12 20H5" />
      <path d="M14 4 10 20" />
    </BaseIcon>
  );
}

export function IconUnderline(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Underline"} {...props}>
      <path d="M6 4v6a6 6 0 0 0 12 0V4" />
      <path d="M4 20h16" />
    </BaseIcon>
  );
}

export function IconList(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "List"} {...props}>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </BaseIcon>
  );
}

export function IconListNumbers(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Numbered list"} {...props}>
      <path d="M10 6h11" />
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M3 6h2" />
      <path d="M3 12h2" />
      <path d="M3 18h2" />
    </BaseIcon>
  );
}

export function IconUndo(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Undo"} {...props}>
      <path d="M3 7v6h6" />
      <path d="M3 13c2-4 6-6 10-6 5 0 8 3 8 8" />
    </BaseIcon>
  );
}

export function IconRedo(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Redo"} {...props}>
      <path d="M21 7v6h-6" />
      <path d="M21 13c-2-4-6-6-10-6-5 0-8 3-8 8" />
    </BaseIcon>
  );
}

export function IconHeading(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Heading"} {...props}>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h12" />
    </BaseIcon>
  );
}

export function IconAlignLeft(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Align left"} {...props}>
      <path d="M4 6h16" />
      <path d="M4 10h10" />
      <path d="M4 14h16" />
      <path d="M4 18h10" />
    </BaseIcon>
  );
}

export function IconAlignCenter(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Align center"} {...props}>
      <path d="M4 6h16" />
      <path d="M7 10h10" />
      <path d="M4 14h16" />
      <path d="M7 18h10" />
    </BaseIcon>
  );
}

export function IconAlignRight(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Align right"} {...props}>
      <path d="M4 6h16" />
      <path d="M10 10h10" />
      <path d="M4 14h16" />
      <path d="M10 18h10" />
    </BaseIcon>
  );
}


export function IconLink(props: IconProps) {
  return (
    <BaseIcon title={props.title ?? "Link"} {...props}>
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
      <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 1 1-7-7l1-1" />
    </BaseIcon>
  );
}
