"use client";

import { useEffect, useState } from "react";
import { api, humanize, type ScreeningResult, type ScreeningTask, type ScreeningTaskSet } from "@/lib/api";
import { Button, Card, Chip, Notice, Text } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * 같이 살펴보기 — 대화 안에서 과제를 하나씩 해본다.
 *
 * 별도 화면으로 빼지 않은 이유: 말풍선과 칩이 그대로 쓰인다. 동의·연령·준비물 화면을
 * 따로 만들 필요가 없다. 월령을 모르면 대화로 먼저 묻고(ChatView), 답을 받아서 들어온다.
 *
 * 대사는 5초 간격으로 하나씩 열리지만 선택지는 처음부터 누를 수 있다.
 * 아이가 첫 번에 반응하면 부모가 기다릴 이유가 없다.
 */
export function ScreeningBlock({
  ageMonths,
  onDone,
}: {
  ageMonths: number;
  onDone: (res: ScreeningResult) => void;
}) {
  const [set, setSet] = useState<ScreeningTaskSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [at, setAt] = useState(0);
  const [answers, setAnswers] = useState<{ task_code: string; option_no: number }[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    api.screening
      .tasks(ageMonths)
      .then((s) => { if (alive) setSet(s); })
      .catch((e) => { if (alive) setError(humanize(e)); });
    return () => { alive = false; };
  }, [ageMonths]);

  const finish = async (
    done: { task_code: string; option_no: number }[],
    skip: string[],
  ) => {
    setSaving(true);
    try {
      onDone(await api.screening.save({ child_age_months: ageMonths, answers: done, skipped: skip }));
    } catch (e) {
      setError(humanize(e));
      setSaving(false);
    }
  };

  const advance = (nextAnswers: typeof answers, nextSkipped: string[]) => {
    setAnswers(nextAnswers);
    setSkipped(nextSkipped);
    if (!set) return;
    if (at + 1 >= set.tasks.length) void finish(nextAnswers, nextSkipped);
    else setAt(at + 1);
  };

  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!set) return <Text variant="caption">살펴볼 것을 준비하고 있어요…</Text>;

  if (!started) {
    return (
      <Card padding="lg" className="rounded-xl">
        <Text variant="title-s" as="h3">{set.tasks.length}가지를 같이 해볼게요</Text>
        <Text variant="caption" tone="body" className="mt-2">
          아이와 함께 해보면서 어떤 모습이 보이는지 적어둘게요. 진단이 아니라 참고용 기록이에요.
        </Text>
        {set.tools.length > 0 && (
          <div className="mt-4">
            <Text variant="label" as="p">이런 게 있으면 더 볼 수 있어요</Text>
            <ul className="mt-2 flex flex-col gap-1.5">
              {set.tools.map((t) => (
                <li key={t} className="t-caption flex items-center gap-2 text-body">
                  <span className="size-1.5 shrink-0 rounded-pill bg-green-300" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <Text variant="caption" className="mt-2">
              없어도 괜찮아요. 준비물이 필요한 건 건너뛸 수 있고, 건너뛴 건 결과에 불리하게 들어가지 않아요.
            </Text>
          </div>
        )}
        <div className="mt-5">
          <Button onClick={() => setStarted(true)}>시작하기</Button>
        </div>
      </Card>
    );
  }

  const task = set.tasks[at];
  if (!task) return null;

  return (
    <TaskCard
      key={task.task_code}
      task={task}
      index={at}
      total={set.tasks.length}
      busy={saving}
      onPick={(option_no) => advance([...answers, { task_code: task.task_code, option_no }], skipped)}
      onSkip={() => advance(answers, [...skipped, task.task_code])}
    />
  );
}

function TaskCard({
  task, index, total, busy, onPick, onSkip,
}: {
  task: ScreeningTask;
  index: number;
  total: number;
  busy: boolean;
  onPick: (optionNo: number) => void;
  onSkip: () => void;
}) {
  // 대사를 하나씩 연다. 다 열린 뒤엔 타이머를 걸지 않는다.
  const [shown, setShown] = useState(1);

  useEffect(() => {
    if (shown >= task.steps.length) return;
    const wait = (task.steps[shown - 1]?.wait_sec ?? 5) * 1000;
    const t = setTimeout(() => setShown((n) => Math.min(n + 1, task.steps.length)), wait);
    return () => clearTimeout(t);
  }, [shown, task.steps]);

  return (
    <Card padding="lg" className="rounded-xl">
      <Text variant="label" as="p">
        {index + 1} / {total} · {task.observes}
      </Text>
      <Text variant="title-s" as="h3" className="mt-1">{task.title}</Text>

      <ol className="mt-4 flex flex-col gap-3">
        {task.steps.slice(0, shown).map((s, i) => {
          const now = i === shown - 1;
          return (
            <li key={s.step_no} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill text-label",
                  now ? "bg-primary text-white" : "bg-sunken text-muted",
                )}
              >
                {s.step_no}
              </span>
              <Text variant="caption" tone={now ? "strong" : "placeholder"} as="p">
                {s.script}
              </Text>
            </li>
          );
        })}
      </ol>

      {shown < task.steps.length && (
        <Text variant="caption" className="mt-3">
          아직 반응이 없다면 잠시 뒤 다음 순서를 알려드릴게요
        </Text>
      )}

      <Text variant="caption" tone="body" className="mt-5">아이가 어떻게 했나요?</Text>
      <div className="mt-2 flex flex-col gap-2">
        {task.options.map((o) => (
          <button
            key={o.option_no}
            type="button"
            disabled={busy}
            onClick={() => onPick(o.option_no)}
            className="t-caption rounded-md border border-line bg-card px-3.5 py-2.5 text-left text-body transition-colors hover:border-primary hover:bg-green-50 disabled:opacity-60"
          >
            {o.label}
          </button>
        ))}
      </div>

      {task.skippable && (
        <div className="mt-4">
          <Chip onClick={onSkip} disabled={busy}>
            {task.tool ? `${task.tool}이 없어요` : "건너뛸게요"}
          </Chip>
        </div>
      )}
    </Card>
  );
}
