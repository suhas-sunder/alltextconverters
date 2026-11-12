import { useState } from "react";
import { CounterToolCard } from "../counter/CounterToolCard";

export function ByteCounterToolCard() {
  const [input, setInput] = useState("");

  return (
    <CounterToolCard
      focus="bytes"
      title="UTF-8 Byte Counter"
      description="Count UTF-8 bytes as you type or paste. Use the result to check a byte limit for a text field, message, or payload."
      input={input}
      setInput={setInput}
      example="Aé漢😀"
      relatedTools={[
        { href: "/character-counter", label: "Character Counter" },
        { href: "/word-counter", label: "Word Counter" },
        { href: "/text-to-hex", label: "Text to Hex" },
        { href: "/text-to-binary", label: "Text to Binary" },
      ]}
    />
  );
}
