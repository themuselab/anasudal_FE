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

/**
 * 기다리는 동안 보여줄 문구. 실제로 일어나는 순서를 부모가 알아들을 말로 옮긴 것이다.
 * "임베딩 중", "벡터 검색 중" 같은 말은 여기서 아무 뜻이 없다.
 *   ① 질문을 읽는다(임베딩) → ② 자료를 찾는다(검색) → ③ 근거를 읽고 답을 쓴다(생성)
 */
const WAITING = ["아이 이야기를 읽고 있어요", "검증된 자료를 찾고 있어요"] as const;
const WAITING_STEP_MS = 1400;

/**
 * "몇 개월인가요?" 에 대한 답을 읽는다. AI 가 방금 물은 직후에만 쓰기 때문에
 * "30" 같은 맨숫자도 개월로 본다 — 평소 대화에서 이렇게 읽으면 "3가지를 못 해요" 를
 * 나이로 오해하지만, 여기서는 나이를 묻고 받은 답이다.
 */
function readAgeMonths(text: string): number | null {
  const t = text.replace(/\s+/g, " ");
  const y = /(\d{1,2})\s*(?:살|세|년)/.exec(t);
  const m = /(\d{1,3})\s*개월/.exec(t);
  let months: number | null = null;
  if (y && m) months = Number(y[1]) * 12 + Number(m[1]);
  else if (m) months = Number(m[1]);
  else if (y) months = Number(y[1]) * 12;
  else {
    const bare = /^\s*(\d{1,3})\s*$/.exec(t);
    if (bare) months = Number(bare[1]);
  }
  return months !== null && months >= 18 && months <= 48 ? months : null;
}

type Msg =
  | { role: "user"; text: string }
  | { role: "ai"; res: AskResponse; streaming?: boolean }
  | { role: "region"; forAnswer: string | null; areaCodes?: string[] }
  | { role: "reco"; res: RecommendResponse }
  | { role: "screening"; ageMonths: number }
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
  const [status, setStatus] = useState<string>(WAITING[0]);
  const stage = useRef<ReturnType<typeof setTimeout> | null>(null);
  // AI 가 월령을 물어본 직후인가 — 다음 입력을 나이로 읽는다
  const [askingAge, setAskingAge] = useState(false);
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
    setStatus("가까운 기관을 찾고 있어요");
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

    if (askingAge) {
      const months = readAgeMonths(text);
      setAskingAge(false);
      if (months !== null) {
        push({ role: "user", text });
        push({ role: "screening", ageMonths: months });
        return;                   // 나이만 받으면 되니 서버에 다시 묻지 않는다
      }
      // 나이가 아니면 평소처럼 질문으로 받는다
    }

    push({ role: "user", text });
    setBusy(true);
    setStatus(WAITING[0]);
    if (stage.current) clearTimeout(stage.current);
    stage.current = setTimeout(() => setStatus(WAITING[1]), WAITING_STEP_MS);

    let acc = "";
    let done: AskResponse | null = null;
    abort.current = new AbortController();

    await askStream(
      sid,
      text,
      {
        onMeta: (m) => {
          if (stage.current) clearTimeout(stage.current);   // 실제 진행이 앞섰으니 예고 타이머는 끈다
          setStatus(m.evidence_count ? `자료 ${m.evidence_count}건을 읽고 답을 쓰고 있어요` : "답을 쓰고 있어요");
        },
        onDelta: (t) => { acc += t; setLast(streamingShell(acc)); },
        onDone: (res) => { done = res; },
        onError: (e) => setLast({ role: "error", text: humanize(e) }),
      },
      abort.current.signal,
    );

    if (stage.current) clearTimeout(stage.current);
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
      if (res.screen_age_months === null) {
        setAskingAge(true);       // 다음 입력을 나이로 읽는다
        return;
      }
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
