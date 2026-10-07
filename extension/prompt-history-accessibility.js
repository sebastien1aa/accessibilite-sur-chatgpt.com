/* Install before the site creates its composer. No editor discovery, mutation
 * observer or stored prompt content is needed for this event-time guard. */
(() => {
  "use strict";
  const marker = Symbol.for("chatgpt-navigation-continue.prompt-history.v1");
  if (window[marker]) return;
  const editorSelector = '.ProseMirror[contenteditable="true"][role="textbox"]';
  let active = true;

  // ProseMirror runs MHF's history keymap from the editor's bubbling listener.
  // Capture only an unmodified ArrowUp in its focused, empty French composer.
  function guardHistory(event) {
    if (!active || !/^fr(?:-|$)/i.test(document.documentElement?.lang || "") ||
        event.key !== "ArrowUp" || event.isComposing || event.keyCode === 229 ||
        event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    const editor = document.activeElement;
    if (!editor?.isConnected || !editor.matches(editorSelector) ||
        !editor.contains(event.target) ||
        editor.getAttribute("aria-expanded") === "true" ||
        editor.hasAttribute("aria-activedescendant") ||
        editor.querySelector('[contenteditable="false"], img, pre, table, [data-node-view-wrapper]') ||
        editor.textContent.trim() !== "") return;
    const addSelector = 'button[aria-label="Ajouter des fichiers et plus encore"]';
    const add = editor.closest('form')?.querySelector(addSelector) ||
      Array.from(document.querySelectorAll(addSelector)).find(button =>
        button.getClientRects().length && !button.closest('[inert], [hidden], [aria-hidden="true"]'));
    if (add?.getAttribute("aria-expanded") === "true") return;
    const selection = document.getSelection();
    if (selection?.rangeCount && (!selection.isCollapsed ||
        !editor.contains(selection.anchorNode) || !editor.contains(selection.focusNode))) return;
    // Preserve the browser default; do not write the editor or read history.
    event.stopImmediatePropagation();
  }

  document.addEventListener("keydown", guardHistory, true);
  const api = Object.freeze({ stop() {
    if (!active) return;
    active = false;
    document.removeEventListener("keydown", guardHistory, true);
    if (window[marker] === api) delete window[marker];
  } });
  window[marker] = api;
})();
