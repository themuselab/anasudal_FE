"use client";

/**
 * 카카오톡 공유 — 관찰 기록 링크를 보낸다.
 *
 * 카카오 로그인은 필요 없다. 필요한 건 두 가지다.
 *   · JS 키 (지도에 쓰는 것과 같은 키)
 *   · 개발자 콘솔 > 앱 설정 > 플랫폼 > Web 에 사이트 도메인 등록
 *     링크의 webUrl / mobileWebUrl 이 등록한 도메인과 같아야 한다. 다르면 4011 이 난다.
 *
 * 준비가 안 됐으면 조용히 false 를 돌려준다 — 화면은 링크 복사로 넘어간다.
 */

const SDK_ID = "kakao-share-sdk";
const SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

type KakaoSdk = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: { sendDefault: (opts: Record<string, unknown>) => void };
};

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

function load(): Promise<void> {
  if (window.Kakao) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SDK_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("kakao sdk")));
      return;
    }
    const el = document.createElement("script");
    el.id = SDK_ID;
    el.src = SDK_SRC;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("kakao sdk"));
    document.head.appendChild(el);
  });
}

export function kakaoReady(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
}

/**
 * 미리보기 카드에는 관찰 내용을 넣지 않는다.
 * 카카오톡 대화 목록에 그대로 뜨는 문구라, "2가지에서 반응이 약했어요" 같은 말이
 * 옆사람 눈에 들어갈 수 있다. 무엇이 있었는지는 링크를 연 사람만 본다.
 */
export async function shareRecord(link: string): Promise<boolean> {
  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) return false;
  try {
    await load();
    const kakao = window.Kakao;
    if (!kakao) return false;
    if (!kakao.isInitialized()) kakao.init(key);

    const origin = window.location.origin;
    kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: "안아수달에서 살펴본 기록",
        description: "아이와 함께 살펴본 내용이에요. 기관에 문의하실 때 보여주세요.",
        imageUrl: `${origin}/share-card.png`,
        link: { mobileWebUrl: link, webUrl: link },
      },
      buttons: [
        { title: "기록 보기", link: { mobileWebUrl: link, webUrl: link } },
      ],
    });
    return true;
  } catch {
    return false;      // 도메인 미등록·SDK 차단 등 — 화면은 링크 복사로 넘어간다
  }
}
