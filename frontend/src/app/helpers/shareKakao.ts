const KAKAO_SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

interface KakaoShare {
  init: (key: string) => void;
  isInitialized: () => boolean;
  Share: {
    sendDefault: (options: Record<string, unknown>) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoShare;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Kakao share is only available in the browser")
    );
  }
  if (window.Kakao) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Kakao SDK"));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export type KakaoShareResult = "shared" | "copied";

export async function shareReferralViaKakao(options: {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
}): Promise<KakaoShareResult> {
  const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.trim();

  if (!key) {
    const text = `${options.description}\n\n${options.link}`;
    await navigator.clipboard.writeText(text);
    return "copied";
  }

  await loadKakaoSdk();

  if (!window.Kakao) {
    throw new Error("Kakao SDK unavailable");
  }

  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(key);
  }

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: options.title,
      description: options.description,
      imageUrl: options.imageUrl,
      link: {
        mobileWebUrl: options.link,
        webUrl: options.link,
      },
    },
    buttons: [
      {
        title: options.title,
        link: {
          mobileWebUrl: options.link,
          webUrl: options.link,
        },
      },
    ],
  });

  return "shared";
}
