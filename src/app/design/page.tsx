import type { Metadata } from "next";
import { palette, semantic, type } from "@/design/tokens";
import { Badge, Button, Card, Divider, Field, Input, Notice, Tag, Text, Textarea } from "@/components/ui";
import { ChatInputDemo, ChipDemo, SegmentedDemo } from "./Playground";

export const metadata: Metadata = { title: "디자인 시스템" };

/**
 * 디자인 시스템 문서 — 피그마 시트와 1:1 대조용. 서비스 화면 아님.
 * 창 폭을 768px 경계로 오가며 타이포가 모바일 ↔ PC 로 바뀌는지 확인한다.
 */
export default function DesignPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-10 md:py-16">
      <Text variant="label">Design System</Text>
      <Text variant="display" className="mt-2">안아수달</Text>
      <Text variant="body-l" className="mt-3">
        Pretendard Variable · 모든 값은 <code className="rounded-sm bg-sunken px-1.5">globals.css</code> 의{" "}
        <code className="rounded-sm bg-sunken px-1.5">@theme</code> 한 곳에만 있다.
      </Text>

      <Card surface="soft" className="mt-6 flex items-center gap-3">
        <Badge tone="primary">현재</Badge>
        <Text variant="body-m" tone="strong" as="span">
          <span className="md:hidden">모바일 — 768px 미만. 타이포 모바일 값 적용 중</span>
          <span className="hidden md:inline">PC — 768px 이상 (태블릿 포함). 타이포 데스크톱 값 적용 중</span>
        </Text>
      </Card>

      {/* ── 팔레트 ─────────────────────────────────────────── */}
      <Section title="Color palette" sub="900 → 50 · ★ 600 = primary">
        <div className="grid grid-cols-5 gap-3 md:grid-cols-10">
          {Object.entries(palette)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([step, hex]) => (
              <div key={step} className="text-center">
                <div className="mx-auto aspect-square w-full rounded-pill border border-line-subtle" style={{ background: hex }} />
                <p className="t-caption mt-2 text-muted">{step === "600" ? "★ " : ""}{step}</p>
                <p className="t-label font-medium text-placeholder">{hex}</p>
              </div>
            ))}
        </div>
      </Section>

      {/* ── 의미 토큰 ───────────────────────────────────────── */}
      <Section title="Semantic tokens" sub="클래스는 이름 그대로 — bg-primary · text-strong · border-line · bg-soft …">
        <Card padding="none" className="overflow-hidden">
          {semantic.map(([name, hex, role], i) => (
            <div key={name}>
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[190px_40px_110px_1fr]">
                <span className="t-caption text-body">{name}</span>
                <span className="size-9 shrink-0 rounded-sm border border-line-subtle" style={{ background: hex }} />
                <span className="t-caption hidden text-muted md:block">{hex}</span>
                <span className="t-caption hidden text-muted md:block">{role || "-"}</span>
              </div>
              {i < semantic.length - 1 && <Divider />}
            </div>
          ))}
        </Card>
      </Section>

      {/* ── 타이포 ─────────────────────────────────────────── */}
      <Section
        title="Typography"
        sub="모바일 값이 기본, 768px 이상에서 데스크톱 값. 굵게 표시된 쪽이 지금 적용 중인 값"
      >
        <Card padding="none" className="overflow-hidden">
          {(Object.keys(type) as (keyof typeof type)[]).map((k, i, arr) => {
            const t = type[k];
            return (
              <div key={k}>
                <div className="px-4 py-4 md:grid md:grid-cols-[140px_1fr_300px] md:items-baseline md:gap-3">
                  <span className="t-caption text-muted">{k}</span>
                  <Text variant={k} as="p" className="mt-1 md:mt-0">안아수달 발달재활</Text>
                  <span className="t-caption mt-1 block text-muted md:mt-0">
                    {t.weight} · <b className="md:font-normal">{t.mobile[0]}/{t.mobile[1]}</b>
                    {" → "}
                    <b className="font-normal md:font-bold">{t.desktop[0]}/{t.desktop[1]}</b>
                    {" · "}{t.spacing} · {t.role}
                  </span>
                </div>
                {i < arr.length - 1 && <Divider />}
              </div>
            );
          })}
        </Card>
      </Section>

      {/* ── 컴포넌트 ───────────────────────────────────────── */}
      <Section title="Button" sub="primary / soft / outline / ghost / danger · sm 36 · md 48 · lg 56">
        <div className="flex flex-wrap items-center gap-3">
          <Button>기관 추천받기</Button>
          <Button variant="soft">네, 추천해주세요</Button>
          <Button variant="outline">둘러보기</Button>
          <Button variant="ghost">더 물어볼게요</Button>
          <Button variant="danger">신고</Button>
          <Button disabled>disabled</Button>
          <Button loading>보내는 중</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm">small</Button>
          <Button size="md">medium</Button>
          <Button size="lg">large</Button>
        </div>
      </Section>

      <Section title="Segment button menu" sub="트랙 sunken · padding 2 · gap 4 · radius 999 · 세그먼트 106×46 · 선택 = primary">
        <SegmentedDemo />
      </Section>

      <Section title="Chat input field" sub="H 64 · radius 999 · padding 28/20/16 · card · 테두리 없음(입력 중에도) · 아이콘 green-200 → primary">
        <ChatInputDemo />
      </Section>

      <Section title="Chip · Tag · Badge" sub="필터 UI 없이 칩만 (회의 결정)">
        <ChipDemo />
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag>언어치료</Tag>
          <Tag>감각통합</Tag>
          <Tag>놀이치료</Tag>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="primary">근거 3건</Badge>
          <Badge tone="success">방문 가능</Badge>
          <Badge tone="warning">2026 공시</Badge>
          <Badge tone="danger">확인 필요</Badge>
          <Badge>회기당 5.3만원</Badge>
        </div>
      </Section>

      <Section title="Input" sub="H 48 · radius 12 · line/default → 포커스 primary">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="아이 월령" hint="문장에 '30개월'처럼 적어도 읽어요">
            <Input placeholder="예: 30" inputMode="numeric" />
          </Field>
          <Field label="사유" error="사유를 골라주세요">
            <Input placeholder="입력 힌트" invalid />
          </Field>
          <Field label="걱정되는 모습">
            <Textarea placeholder="예: 30개월인데 아직 두 단어 문장을 못 만들어요" />
          </Field>
          <Field label="비활성">
            <Input placeholder="disabled" disabled />
          </Field>
        </div>
      </Section>

      <Section title="Surface · Notice">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <Text variant="title-s">surface/card</Text>
            <Text variant="body-m" className="mt-1">기관 카드, 답변 카드</Text>
          </Card>
          <Card surface="soft">
            <Text variant="title-s">action/soft</Text>
            <Text variant="body-m" className="mt-1">AI 말풍선, 선택 강조</Text>
          </Card>
          <Card surface="sunken">
            <Text variant="title-s">surface/sunken</Text>
            <Text variant="body-m" className="mt-1">근거 박스, 세그먼트 트랙</Text>
          </Card>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Notice tone="neutral" title="안내">안아수달은 진단하지 않아요. 확인해볼 영역과 자료를 찾아드립니다.</Notice>
          <Notice tone="warning" title="공시 단가">2026년 공시 기준 · 변동될 수 있어요.</Notice>
          <Notice tone="success" title="저장됨">의견 고마워요.</Notice>
          <Notice tone="danger" title="연결 실패">서버에 연결할 수 없어요. 네트워크를 확인해주세요.</Notice>
        </div>
      </Section>

      <Section title="AI 답변 본문" sub="서버가 **굵게** 를 내려주고 prose-answer 가 text/strong 으로 렌더">
        <div className="prose-answer t-body-m max-w-3xl text-body">
          <p>
            말씀해주신 내용을 보면 또래 대비 <strong>언어 발달 지연</strong>과 감각 예민 반응이 함께 있는 경우로 보여요.
            이런 경우 <strong>언어치료</strong>와 <strong>감각통합치료</strong>를 함께 고려해볼 수 있어요.
          </p>
          <p>기관을 추천해드릴까요?</p>
        </div>
      </Section>

      <Section title="Numeric" sub="통계 숫자 — tabular-nums 고정폭">
        <div className="flex flex-wrap gap-8">
          <div>
            <Text variant="numeric-xl">96.3%</Text>
            <Text variant="caption">적중률 (top_k = 3)</Text>
          </div>
          <div>
            <Text variant="numeric-xl">2,866</Text>
            <Text variant="caption">전국 기관</Text>
          </div>
          <div>
            <Text variant="numeric-xl">1,473</Text>
            <Text variant="caption">근거 자료 조각</Text>
          </div>
        </div>
      </Section>
    </main>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 md:mt-16">
      <Text variant="title-m">{title}</Text>
      {sub && <Text variant="caption" className="mt-1">{sub}</Text>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
