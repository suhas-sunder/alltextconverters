
import { useRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export function UppercaseToolCard({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleUppercase = () => {
    onChange(value.toUpperCase());
  };

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <section className="tool-card">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type text here"
        className="tool-textarea"
      />
      <div className="tool-actions">
        <button onClick={handleUppercase}>Convert to Uppercase</button>
        <button onClick={handleCopy}>Copy</button>
      </div>
    </section>
  );
}
