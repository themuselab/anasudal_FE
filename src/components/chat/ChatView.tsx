"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, humanize, type AskResponse, type RecommendResponse, type Region,
  type ScreeningResult } from "@/lib/api";
import { askStream } from "@/lib/api/stream";
import { loadMessages, saveMessages } from "@/lib/session";
import { ChatInput, Notice } from "@/components/ui";
import { AppFooter } from "@/components/layout/AppHeader";
import { AnswerBlock } from "@/components/chat/AnswerBlock";
import { RecommendBlock } from "@/components/chat/RecommendBlock";
import { RegionPicker } from "@/components/chat/RegionPicker";
import { ScreeningBlock } from "@/components/chat/ScreeningBlock";
import { ScreeningResultBlock } from "@/components/chat/ScreeningResultBlock";
import { PrivacyNote, Thinking, UserBubble } from "@/components/chat/Bubbles";

type Msg =
  | { role: "user"; text: string }
  | { role: "ai"; res: AskResponse; streaming?: boolean }
  | { role: "region"; forAnswer: string | null; areaCodes?: string[] }
  | { role: "reco"; res: RecommendResponse }
  | { role: "screening"; ageMonths: number | null }
  | { role: "screenResult"; res: ScreeningResult }
  | { role: "error"; text: string };

/**
 * 대화 화면 (시안 pc-채팅 입력 로딩 중 / pc-답변 / pc-답변-기관 노출)
 *  · 메시지는 위로 쌓이고 입력창은 하단 고정, 스크롤은 그 아래로 흐른다
 *  · 답변은 SSE 로 글자가 차오르고 done 에서 볼드가 들어간 최종본으로 교체
 *  · 흐름: answer → [네, 추천해주세요] → (지역 없으면 지역 선택) → 기관 카드 3곳 + 둘러보기 배너
 */
export function ChatView() {
  const sp = useSearchParams();
  const router = useRouter();
  const sid = sp.get("s");

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("검증된 자료에서 찾고 있어요");
  const bottom = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const abort = useRef<AbortController | null>(null);

  const push = (m: Msg) => setMsgs((prev) => [...prev, m]);

  /** 마지막이 스트리밍 중인 답변이면 교체, 아니면 추가 */
  const setLast = (m: Msg) =>
    setMsgs((prev) => {
      const last = prev.at(-1);
      return last?.role === "ai" && last.streaming ? [...prev.slice(0, -1), m] : [...prev, m];
    });

  const streamingShell = (text: string): Msg => ({
    role: "ai",
    streaming: true,
    res: {
      answer_id: null, intent: "answer", text, highlights: [], areas: [], evidence_count: 0,
      fallback_tier: 0, can_recommend: false, ask_region: false, recommend_for: null, next_prompts: [],
      screen_age_months: null,
    },
  });

  /** answerId 는 대화에서, areaCodes 는 관찰 기록에서 온다 */
  const recommend = async (
    answerId: string | null,
    region?: Region,
    areaCodes?: string[],
  ) => {
    if (!sid) return;
    setBusy(true);
    setStatus("근처 기관 중 조건에 맞는 곳을 찾고 있어요");
    try {
      const res = await api.chat.recommend({
        session_id: sid,
        answer_id: answerId ?? undefined,
        area_codes: areaCodes,
        region_id: region?.region_id,
      });
      push({ role: "reco", res });
    } catch (e) {
      push({ role: "error", text: humanize(e) });
    } finally {
      setBusy(false);
    }
  };

  /** 관찰 기록에서 기관으로. 세션에 지역이 없으면 먼저 묻는다 (대화 흐름과 같은 순서) */
  const recommendFromScreening = async (areaCodes: string[]) => {
    if (!sid) return;
    try {
      const s = await api.session.get(sid);
      if (s.region_id == null) {
        push({ role: "region", forAnswer: null, areaCodes });
        return;
      }
    } catch {
      /* 세션 조회가 안 되면 지역부터 묻는 쪽이 안전하다 */
      push({ role: "region", forAnswer: null, areaCodes });
      return;
    }
    await recommend(null, undefined, areaCodes);
  };

  const send = async (text: string) => {
    if (!sid || busy) return;
    push({ role: "user", text });
    setBusy(true);
    setStatus("검증된 자료에서 찾고 있어요");

    let acc = "";
    let done: AskResponse | null = null;
    abort.current = new AbortController();

    await askStream(
      sid,
      text,
      {
        onMeta: (m) =>
          setStatus(m.evidence_count ? `근거 자료 ${m.evidence_count}건으로 답변을 쓰고 있어요` : "답변을 쓰고 있어요"),
        onDelta: (t) => { acc += t; setLast(streamingShell(acc)); },
        onDone: (res) => { done = res; },
        onError: (e) => setLast({ role: "error", text: humanize(e) }),
      },
      abort.current.signal,
    );

    setBusy(false);
    if (!done) return;
    const res: AskResponse = done;

    // 추천 요청은 본문 없이 라우팅만 — 지역이 없으면 먼저 묻는다
    if (res.intent === "pick_region" && res.recommend_for) {
      push({ role: "region", forAnswer: res.recommend_for });
      return;
    }
    if (res.intent === "recommend" && res.recommend_for) {
      await recommend(res.recommend_for);
      return;
    }
    // 관찰은 생성 없이 화면만 바뀐다 — 안내 한 줄을 남기고 과제 블록을 띄운다
    if (res.intent === "screening") {
      setLast({ role: "ai", res });
      // 월령을 모르면 관찰 블록이 먼저 묻는다 (첫 화면 고정 칩으로 들어온 경우)
      push({ role: "screening", ageMonths: res.screen_age_months });
      return;
    }
    setLast({ role: "ai", res });
  };

  useEffect(() => {
    if (!sid) { router.replace("/"); return; }
    if (started.current) return;
    started.current = true;
    // 기관 상세를 보고 돌아왔을 때 대화가 비지 않게 복원 (브라우저 세션에만 보관)
    const restored = loadMessages<Msg>(sid);
    const first = sessionStorage.getItem("anasudal.first");
    if (first) sessionStorage.removeItem("anasudal.first");
    if (restored.length || first) {
      queueMicrotask(() => {                  // effect 안 동기 setState 회피
        if (restored.length) setMsgs(restored);
        if (first) void send(first);
      });
    }
    return () => abort.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  // 스트리밍 중인 조각은 빼고 보관
  useEffect(() => {
    if (!sid || busy) return;
    saveMessages(sid, msgs.filter((m) => !(m.role === "ai" && m.streaming)));
  }, [sid, msgs, busy]);

  const last = msgs.at(-1);
  const showThinking = busy && !(last?.role === "ai" && last.streaming);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 md:px-0">
      <div className="flex flex-1 flex-col gap-8 pb-2 pt-4 md:pt-6">
        {msgs.map((m, i) => {
          switch (m.role) {
            case "user":
              return <UserBubble key={i} text={m.text} />;
            case "error":
              return <Notice key={i} tone="danger">{m.text}</Notice>;
            case "ai":
              return <AnswerBlock key={i} res={m.res} streaming={m.streaming} onPrompt={send} />;
            case "region":
              return (
                <RegionPicker
                  key={i}
                  onPick={(r) => {
                    push({ role: "user", text: `${shortLabel(r)}` });
                    void recommend(m.forAnswer, r, m.areaCodes);
                  }}
                />
              );
            case "reco":
              return <RecommendBlock key={i} res={m.res} />;
            case "screening":
              return (
                <ScreeningBlock
                  key={i}
                  ageMonths={m.ageMonths}
                  onDone={(res) => push({ role: "screenResult", res })}
                />
              );
            case "screenResult":
              return (
                <ScreeningResultBlock
                  key={i}
                  res={m.res}
                  onRecommend={(areaCodes) => void recommendFromScreening(areaCodes)}
                />
              );
          }
        })}

        {showThinking && <Thinking status={status} />}
        <div ref={bottom} />

        {/* 푸터는 대화 영역 맨 아래 — 입력창 영역에 있으면 모바일에서 키보드가 올라와도 남는다 */}
        <AppFooter className="mt-auto pt-4" />
      </div>

      <div className="sticky bottom-0 bg-base pb-3 pt-2">
        {/* 안내 문구는 첫 입력 전까지만 */}
        {msgs.length === 0 && <PrivacyNote className="mb-2" />}
        <ChatInput onSend={send} loading={busy} placeholder="수달 AI에게 물어보기" />
      </div>
    </div>
  );
}

function shortLabel(r: Region) {
  return `${r.sido} ${r.sigungu}`;
}
