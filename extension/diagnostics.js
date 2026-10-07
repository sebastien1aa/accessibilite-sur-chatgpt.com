"use strict";
chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (sender.id !== chrome.runtime.id || message?.type !== "navigation-continue-status") return;
  const thread = document.querySelector("#thread");
  const views = [...document.querySelectorAll('.thread-scroll-container [data-chatgpt-conversation-selection-target]')];
  const visible = views.filter(view => view.getClientRects().length > 0);
  if (views.length) {
    // SPA navigation may keep an old transcript mounted but display:none.
    // The global count cannot be attributed safely while both views exist.
    const modern = visible.length === 1 ? visible[0] : null;
    if (!modern) {
      respond({ containers: 0, rendered: 0, turns: 0, interface: "modern", coverageUnknown: true });
      return;
    }
    const turns = modern.querySelectorAll('[data-turn-key]').length;
    const expected = views.length === 1
      ? Number(document.documentElement.getAttribute('data-chatgpt-continuous-turn-count')) || 0 : 0;
    respond({ containers: expected, rendered: turns, turns, interface: "modern", coverageUnknown: views.length !== 1 });
    return;
  }
  const containers = thread ? [...thread.querySelectorAll("div[data-turn-id-container][data-is-intersecting]")]
    .filter(e => e.dataset.turnIdContainer !== "client-created-root") : [];
  const rendered = containers.filter(e => e.querySelector("[data-testid^='conversation-turn-']"));
  respond({
    containers: containers.length,
    rendered: rendered.length,
    turns: thread?.querySelectorAll("[data-testid^='conversation-turn-']").length ?? 0
  });
});
