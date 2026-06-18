export const OPEN_ASSISTANT_CHAT_EVENT = "open-assistant-chat";

const LAUNCHER_SELECTORS = [
  '[aria-label="Open chat"]',
  '[aria-label="Open assistant"]',
  '[aria-label="Chat"]',
  ".lc_text-widget--btn",
  'button[data-testid="launcher"]',
  "button",
] as const;

function tryLeadConnectorApi(): boolean {
  const open = window.leadConnector?.chatWidget?.openWidget;
  if (typeof open === "function") {
    open();
    return true;
  }
  return false;
}

function clickLauncher(root: ParentNode): boolean {
  for (const selector of LAUNCHER_SELECTORS) {
    const nodes = root.querySelectorAll(selector);
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) continue;
      const label = node.getAttribute("aria-label")?.toLowerCase() ?? "";
      if (selector === "button" && !label.includes("chat") && !label.includes("assistant")) {
        continue;
      }
      node.click();
      return true;
    }
  }

  const children = root.querySelectorAll("*");
  for (const child of children) {
    if (child instanceof Element && child.shadowRoot && clickLauncher(child.shadowRoot)) {
      return true;
    }
  }
  return false;
}

function tryShadowDomClick(): boolean {
  const hosts = document.querySelectorAll("chat-widget, [data-widget-id]");
  for (const host of hosts) {
    if (host.shadowRoot && clickLauncher(host.shadowRoot)) return true;
  }
  return clickLauncher(document);
}

function tryOpen(): boolean {
  return tryLeadConnectorApi() || tryShadowDomClick();
}

/** Opens the GoHighLevel (Chloe) chat widget loaded in index.html. */
export function openAssistantChat(): void {
  if (tryOpen()) return;

  const onLoaded = () => {
    tryOpen();
  };
  window.addEventListener("LC_chatWidgetLoaded", onLoaded, { once: true });

  let attempts = 0;
  const interval = window.setInterval(() => {
    attempts += 1;
    if (tryOpen() || attempts >= 40) {
      window.clearInterval(interval);
      window.removeEventListener("LC_chatWidgetLoaded", onLoaded);
    }
  }, 250);
}
