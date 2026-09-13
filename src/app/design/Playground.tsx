"use client";
import { useState } from "react";
import { ChatInput, Chip, Segmented } from "@/components/ui";

/** 상태가 필요한 컴포넌트들 — 문서 페이지에서만 쓰는 데모 */

export function SegmentedDemo() {
  const [tab, setTab] = useState<"chat" | "browse">("chat");
  const [mode, setMode] = useState<"all" | "center" | "visit">("all");
  return (
    <div className="flex flex-col items-start gap-4">
      <Segmented
        aria-label="메인 메뉴"
        value={tab}
        onChange={setTab}
        options={[
          { value: "chat", label: "수달AI" },
          { value: "browse", label: "둘러보기" },
        ]}
      />
      <Segmented
        aria-label="이용 방식"
        full
        className="w-full max-w-md"
        value={mode}
        onChange={setMode}
        options={[
          { value: "all", label: "전체" },
          { value: "center", label: "기관 방문" },
          { value: "visit", label: "가정 방문" },
        ]}
      />
    </div>
  );
}

export function ChatInputDemo() {
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <ChatInput
        onSend={async (t) => {
          setBusy(true);
          await new Promise((r) => setTimeout(r, 900));
          setSent(t);
          setBusy(false);
        }}
        loading={busy}
      />
      <ChatInput placeholder="disabled 상태" onSend={() => {}} disabled />
      {sent && <p className="t-caption text-muted">보낸 문장: {sent}</p>}
    </div>
  );
}

export function ChipDemo() {
  const [picked, setPicked] = useState("서울");
  return (
    <div className="flex flex-wrap gap-2">
      {["서울", "경기", "인천"].map((c) => (
        <Chip key={c} selected={c === picked} onClick={() => setPicked(c)}>
          {c}
        </Chip>
      ))}
      <Chip tone="primary">네, 추천해주세요</Chip>
      <Chip disabled>disabled</Chip>
    </div>
  );
}
