export const OPEN_ASSISTANT_CHAT_EVENT = "open-assistant-chat";

const LAUNCHER_SELECTORS = [
  '[aria-label="Open chat"]',
  '[aria-label="Open Chat"]',
  '[aria-label="Open assistant"]',
  '[aria-label="Chat"]',
  '[aria-label="Chat with us"]',
  ".lc_text-widget--btn",
  '[class*="text-widget"][class*="btn"]',
  'button[data-testid="launcher"]',
  '[class*="launcher"]',
  "button",
] as const;

const CLOSE_SELECTORS = [
  '[aria-label="Close chat"]',
  '[aria-label="Close Chat"]',
  '[aria-label="Close assistant"]',
  '[aria-label="Close"]',
  ".lc_text-widget--close",
  'button[data-testid="close"]',
] as const;

function markChatWidgetsLoaded(): void {
  document.querySelectorAll("chat-widget").forEach((el) => {
    el.setAttribute("data-loaded", "true");
  });
}

function tryLeadConnectorApi(): boolean {
  const widget = window.leadConnector?.chatWidget;
  if (!widget) return false;

  const open = widget.openWidget;
  if (typeof open === "function") {
    open.call(widget);
    markChatWidgetsLoaded();
    return true;
  }

  return false;
}

function tryLeadConnectorClose(): boolean {
  const close = window.leadConnector?.chatWidget?.closeWidget;
  if (typeof close === "function") {
    close();
    return true;
  }
  return false;
}

function clickMatching(root: ParentNode, selectors: readonly string[]): boolean {
  for (const selector of selectors) {
    const nodes = root.querySelectorAll(selector);
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (node.matches('button, [role="button"], a')) {
        node.click();
        markChatWidgetsLoaded();
        return true;
      }
    }
  }

  const children = root.querySelectorAll("*");
  for (const child of children) {
    if (child instanceof Element && child.shadowRoot && clickMatching(child.shadowRoot, selectors)) {
      return true;
    }
  }
  return false;
}

function forEachChatHost(fn: (root: ParentNode) => boolean): boolean {
  const hosts = document.querySelectorAll("chat-widget, [data-widget-id]");
  for (const host of hosts) {
    if (host.shadowRoot && fn(host.shadowRoot)) return true;
  }
  return fn(document);
}

function tryShadowDomClick(): boolean {
  return forEachChatHost((root) => clickMatching(root, LAUNCHER_SELECTORS));
}

function tryShadowDomClose(): boolean {
  return forEachChatHost((root) => clickMatching(root, CLOSE_SELECTORS));
}

function tryOpen(): boolean {
  return tryLeadConnectorApi() || tryShadowDomClick();
}

/** Opens the GoHighLevel (Chloe) chat widget loaded in index.html. */
export function openAssistantChat(): void {
  if (tryOpen()) return;

  const onLoaded = () => {
    markChatWidgetsLoaded();
    tryOpen();
  };
  window.addEventListener("LC_chatWidgetLoaded", onLoaded, { once: true });

  let attempts = 0;
  const interval = window.setInterval(() => {
    attempts += 1;
    if (window.leadConnector?.chatWidget) {
      markChatWidgetsLoaded();
    }
    if (tryOpen() || attempts >= 40) {
      window.clearInterval(interval);
      window.removeEventListener("LC_chatWidgetLoaded", onLoaded);
    }
  }, 250);
}

/** Closes the GHL chat widget — used on SPA route changes so back/forward navigation isn't blocked. */
export function closeAssistantChat(): void {
  tryLeadConnectorClose() || tryShadowDomClose();
}

if (typeof window !== "undefined") {
  window.addEventListener("LC_chatWidgetLoaded", () => {
    markChatWidgetsLoaded();
  });
}
