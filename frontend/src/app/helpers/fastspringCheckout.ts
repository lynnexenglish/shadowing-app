type FastSpringOrderReference = {
  id?: string;
  reference?: string;
};

declare global {
  interface Window {
    fastspring?: {
      builder: {
        reset: () => void;
        add: (productPath: string) => void;
        checkout: () => void;
      };
    };
    onFSPopupClosed?: (orderReference: FastSpringOrderReference | null) => void;
  }
}

function registerPathFromLocation(): string {
  if (typeof window === "undefined") return "/en/register";
  const locale = window.location.pathname.match(/^\/(en|ko)(?:\/|$)/)?.[1];
  return `/${locale ?? "en"}/register`;
}

/** Called by FastSpring SBL when popup closes (Continue / X). Redirects after paid orders. */
export function registerFastSpringPopupHandler() {
  window.onFSPopupClosed = (orderReference) => {
    if (!orderReference?.id) return;
    window.fastspring?.builder.reset();
    window.location.assign(registerPathFromLocation());
  };
}

export function openFastSpringCheckout(productPath: string): boolean {
  const builder = window.fastspring?.builder;
  if (!builder) return false;
  builder.reset();
  builder.add(productPath);
  builder.checkout();
  return true;
}
