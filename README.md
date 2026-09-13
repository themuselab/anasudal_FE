# 안아수달 — 프론트엔드

아이 발달이 걱정될 때, 검증된 공공 자료로 확인해볼 영역을 찾아주고 가까운 발달재활 기관을 추천하는 서비스.
이 저장소는 화면(웹)이고, API 는 [anasudal_BE](https://github.com/themuselab/anasudal_BE) 에 있습니다.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Pretendard

---

## 시작하기

```bash
cp .env.example .env.local     # 아래 "환경 변수" 참고
npm install
npm run dev                    # http://localhost:3000
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 검사 포함) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | 타입 검사만 |

### 환경 변수

| 이름 | 필수 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | O | 백엔드 주소. 뒤의 `/v1` 은 클라이언트가 붙인다. 예: `http://localhost:8000` |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | X | 카카오 지도 **JavaScript 키** (REST 키와 다름). 없으면 기관 상세의 지도 자리에 카카오맵 링크만 나온다. developers.kakao.com 에서 발급하고 **플랫폼 > Web** 에 접속 도메인(`http://localhost:3000`, 배포 도메인)을 등록해야 지도가 그려진다 |

---

## 화면

| 경로 | 화면 | 내용 |
|---|---|---|
| `/` | 채팅 메인 | 수달 인사 · 입력창 · 추천 질문 칩 3개(서버가 호출마다 회전) |
| `/chat?s=<세션>` | 대화 | 질문 → SSE 스트리밍 답변 → 👍👎 → 기관 추천 3곳 + 둘러보기 배너 |
| `/browse` | 둘러보기 | 지역 설정 · 기관명/치료영역 검색 · 무한 스크롤(가상화) |
| `/institutions/[사업자번호]` | 기관 상세 | 지도 · 주소 · 전화 · 운영시간 · 영역별 공시 단가 · 홈페이지 |
| `/design` | 디자인 시스템 문서 | 팔레트 · 의미 토큰 · 타이포 · 컴포넌트 전체. 피그마 시트 대조용 |

로그인이 없습니다. 세션 id 만 `localStorage` 에 두고, 대화 내용은 탭을 닫으면 사라지는 `sessionStorage` 에만
잠시 보관합니다(기관 상세를 보고 돌아왔을 때 대화가 비지 않게). 서버에는 대화 원문을 저장하지 않습니다.

---

## 디자인 시스템

값은 **`src/app/globals.css` 의 `@theme` 한 곳**에만 있습니다. 컴포넌트는 토큰 유틸리티만 쓰고 임의값(`text-[20px]`)은 쓰지 않습니다.

### 브레이크포인트 — 768px 하나뿐

미만은 모바일, 이상은 PC(태블릿 포함). Tailwind 기본 `sm/lg/xl/2xl` 은 `@theme` 에서 지워서 쓰려고 해도 생성되지 않습니다.
반응형은 전부 `md:` 입니다. 타이포도 이 경계에서 모바일 값 ↔ 데스크톱 값으로 바뀝니다.

### 색

팔레트 900→50 은 `bg-green-600` 처럼, 의미 토큰은 이름 그대로 씁니다.

| 토큰 | 값 | 클래스 예 |
|---|---|---|
| primary | `#295E56` | `bg-primary` `text-primary` |
| text/strong · body · muted · placeholder | `#1B2A27` `#40534F` `#5A6B67` `#9AA8A5` | `text-strong` `text-body` `text-muted` `text-placeholder` |
| line/default · subtle | `#D8DDD6` `#EFEFE9` | `border-line` `border-line-subtle` |
| action/press · soft · disabled | `#204A44` `#DEEBE7` `#E9E8E0` | `active:bg-press` `bg-soft` `bg-disabled` |
| surface/card · base · sunken | `#FFFFFF` `#F3F2EC` `#E9E8E0` | `bg-card` `bg-base` `bg-sunken` |
| success · warning · danger (+ `-bg`) | `#24634A` `#B26200` `#9E382E` | `text-danger` `bg-danger-bg` |

### 타이포 9종

`<Text variant="title-m">` 이 태그와 색까지 맞춰주고, 클래스로는 `t-title-m` 처럼 씁니다. 폰트는 전부 Pretendard Variable 자체 호스팅(`next/font/local`).

| 변형 | 굵기 · 자간 | 모바일 | PC | 쓰는 곳 |
|---|---|---|---|---|
| display | 700 · -2.5% | 34/44 | 52/66 | 온보딩 완료 대제목 |
| title-l | 700 · -2% | 26/36 | 36/48 | 화면 제목 |
| title-m | 600 · -2% | 21/30 | 26/38 | 섹션 헤딩, 채팅 메인 인사 |
| title-s | 600 · -1.5% | 18/26 | 20/30 | 카드 제목, 세그먼트 라벨 |
| body-l | 400 | 17/29 | 18/32 | 설명 문단, AI 답변 본문 |
| body-m | 400 | 16/26 | 16/28 | 기본 본문 (최소 본문 크기) |
| caption | 500 | 14/22 | 14/24 | 주석, 보조정보 |
| label | 700 · +1% | 12/18 | 12/18 | 스테퍼, 오버라인 |
| numeric-xl | 700 | 40/44 | 56/60 | 통계 숫자 |

### 컴포넌트

`src/components/ui` — `Text` `Button`(primary/soft/outline/ghost/danger × sm/md/lg) `Chip`·`Tag` `Card`(card/soft/sunken)·`Divider`
`Input`·`Textarea`·`Field` `Badge`·`Notice` `Segmented`(세그먼트 버튼 메뉴) `ChatInput`(채팅 입력창).

`/design` 에서 전부 상태별로 볼 수 있습니다. 창 폭을 768px 경계로 옮기면 타이포가 바뀌는 것도 확인됩니다.

---

## 구조

```
src/
  app/            화면 (App Router) — page.tsx 는 조립만, 내용은 components 로
  components/
    ui/           디자인 시스템 컴포넌트 (화면 로직 없음)
    layout/       상단 바·푸터
    chat/         채팅 메인·대화·답변·추천
    browse/       둘러보기 (지역 필터·검색·가상 목록)
    institution/  기관 카드·상세 조각·카카오 지도
  lib/
    api/          백엔드 클라이언트 (client·types·stream)
    session.ts    세션 id 보관, 대화 임시 보관
    format.ts     표시용 포맷 (시·도 약칭, 가격, 치료영역 표기)
    cn.ts         클래스 합치기
  design/tokens.ts  CSS 와 같은 토큰 값 (JS 에서 필요할 때만)
```

---

## API 클라이언트

백엔드는 모든 응답을 봉투로 감쌉니다. 클라이언트가 이를 벗기고 실패는 `ApiError` 로 던집니다.

```
성공  { "success": true,  "data": ... }
실패  { "success": false, "error": { "code": "SESSION_NOT_FOUND", "message": "...", "details": ... } }
```

```ts
import { api, askStream, humanize } from "@/lib/api";

const s = await api.session.create();

// 답변은 SSE 스트리밍 — delta 로 글자가 차오르고, done 의 text(볼드 포함)로 교체한다
await askStream(s.session_id, "30개월인데 두 단어 문장을 못 만들어요", {
  onMeta:  (m)   => setStatus(`근거 ${m.evidence_count}건`),
  onDelta: (t)   => setText((prev) => prev + t),
  onDone:  (res) => setAnswer(res),
  onError: (e)   => setError(humanize(e)),
}, abort.signal);
```

`intent` 로 다음 화면이 갈립니다. `answer` 답변 · `pick_region` 지역 먼저 물어보기 · `recommend` 바로 추천 ·
`need_context` 아이 설명 요청 · `diagnosis` 진단 요구 거절 · `out_of_scope` 범위 밖.

타입은 `src/lib/api/types.ts` 에 백엔드 스키마와 1:1 로 있습니다.

---

## 코드 규칙

- **`any` 금지.** `tsconfig` 는 `strict` + `noUncheckedIndexedAccess`, ESLint 는 `@typescript-eslint/no-explicit-any: error`.
  타입이 없는 외부 SDK(카카오 지도)는 쓰는 부분만 좁혀서 선언합니다 — `components/institution/KakaoMap.tsx` 참고.
- **임의값 금지.** 색·타이포·간격은 토큰 클래스로. 피그마 치수는 스케일로 환산합니다(예: 106px = `min-w-26.5`).
- **반응형은 `md:` 만.** 다른 접두사는 생성되지 않습니다.
- 둘러보기 목록은 창 스크롤 가상화(`@tanstack/react-virtual`)라 2,866곳이어도 DOM 에는 10~20장만 있습니다.

---

## 배포 (Vercel)

프로젝트 루트를 이 저장소로 두고 환경 변수 `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_KAKAO_MAP_KEY` 를 설정합니다.
백엔드가 HTTP 주소면 브라우저가 mixed content 로 막으므로 API 게이트웨이에 HTTPS 를 먼저 붙여야 합니다.
백엔드의 `CORS_ORIGINS` 에 Vercel 도메인을 추가하세요.
