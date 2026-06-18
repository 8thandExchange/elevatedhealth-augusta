const CHAT_BUTTON_SELECTORS = [
  '[aria-label="Open assistant"]',
  '[aria-label="Open chat"]',
  'button[data-widget-id="68d55e4eb4ddc5808f43b3d2"]',
  ".lc_text-widget--btn",
  '[id*="chat-widget"] button',
];

function clickChatLauncher(): boolean {
  for (const selector of CHAT_BUTTON_SELECTORS) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) {
      el.click();
      return true;
    }
  }
  return false;
}

/** Opens the GoHighLevel (Chloe) chat widget loaded in index.html. */
export function openAssistantChat(): void {
  if (clickChatLauncher()) return;

  let attempts = 0;
  const interval = window.setInterval(() => {
    attempts += 1;
    if (clickChatLauncher() || attempts >= 20) {
      window.clearInterval(interval);
    }
  }, 250);
}

export const OPEN_ASSISTANT_CHAT_EVENT = "open-assistant-chat";
