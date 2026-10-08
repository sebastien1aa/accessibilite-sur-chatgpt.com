# Tests and fixtures — Point 3

The [site procedures](PROCEDURES.md) are separate from the synthetic checks below.

## Subpoint coverage

| Case | Workflow or reproduction | Demonstrator mechanism |
|---|---|---|
| 3A | Project procedure, physical A/B and C/D comparisons | [Project controls](../../../extension/project-accessibility.js), [lists](../../../extension/sidebar-list-accessibility.js) |
| 3B | Sidebar closure/reopening procedure | [Persistent control](../../../extension/ui-accessibility.js); native observation and user validation described in the evidence |
| 3C | Afficher plus procedure on an existing list | [Pagination](../../../extension/sidebar-list-accessibility.js); 34 historical Chromium pagination/list checks |
| 3D | Procedures by menu family, menu-return page | [Association and return](../../../extension/sidebar-menu-focus.js) |
| 3E | “Explorer” (Explore) procedure, popup-property page | [“Explorer” entry](../../../extension/explorer-accessibility.js) and [return](../../../extension/sidebar-menu-focus.js) |
| 3F | Sharing/editing procedure, message-actions page | [Return to the same message](../../../extension/message-action-focus.js) |
| 3G | Évaluer procedure, Évaluer menu page | [Semantics](../../../extension/evaluation-menu-accessibility.js) and [return](../../../extension/sidebar-menu-focus.js) |

Each case has a workflow on the site and dated evidence. The synthetic pages isolate the indicated mechanisms; they do not reproduce the entire ChatGPT interface.

## Included synthetic pages

| Page | Function and dependencies | Evidential value |
|---|---|---|
| [A/B links](list-first-focus.html) | Standalone, no extension loaded. Same link under a list without tabindex, then tabindex=-1. | Physically validated by the user on October 4; a focusable parent is sufficient in this structure. |
| [C/D buttons](list-button-first-focus.html) | Standalone, same collapsed/expanded buttons and forwarding; only difference is the focusable parent. | Physically validated by the user on October 4; Alt+Tab return that differs from the site is retained. |
| [Menu returns](sidebar-menu-focus.html) | Loads [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js). Exécuter les contrôles de focus (Run focus checks) button. | Checks DOM association, return/cancellation; does not prove the JAWS cursor position or all site code. |
| [“Explorer” popup property](explorer-popup-hint-release.html) | Loads [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js) and [explorer-accessibility.js](../../../extension/explorer-accessibility.js). Vérifier la propriété (Check the property) button. | Checks the integrated distribution and property restoration; measures no JAWS mode. |
| [Message actions](message-action-focus.html) | Loads [message-action-focus.js](../../../extension/message-action-focus.js). Exécuter les contrôles (Run checks) button. | Checks returns, late tasks, and cancellations. The historical Réagir case is an exclusion check; it does not reproduce the current Évaluer la réponse control. |
| [Évaluer menu](evaluation-menu.html) | Loads [evaluation-menu-accessibility.js](../../../extension/evaluation-menu-accessibility.js) and [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js). Exécuter les contrôles button. | Eleven Chromium checks passed in mechanism validation; menu properties, relationship, Escape, return, ambiguities, and restoration. |

The pages are retained as the working fixtures, with **only the paths to the extension adjusted** for this folder. Automated results displayed on screen are synthetic DOM checks. They are neither additional tickets nor new user validation.

The [native human feedback of October 7](../evidence/native-user-feedback-2026-10-07.json) updates the site symptoms, including Évaluer la réponse. The [record of this menu](../evidence/3G-native-rating-menu-2026-10-07.json) provides its native structure and DOM focus return. The [procedures](PROCEDURES.md) distinguish menu families and their reported numbers of Escape presses.

The [adapted passive inspection](../evidence/3G-adapted-rating-menu-2026-10-07.json) confirms menu properties on nine existing buttons and `hasPopup=menu` on the targeted accessible node. It complements the synthetic checks with a structural check on the site, without measuring JAWS speech or activating the menu again.

### Opening the fixtures

The two A/B and C/D pages can be opened directly. The four pages that load or reread a module with fetch must be served over HTTP with the **root of this standalone repository** as the server root, so that ../../../extension correctly points to the shared extension. An already available file server is suitable; for example, from the root, if Python is installed:

```text
python -m http.server 8765 --bind 127.0.0.1
```

Then open, for example:

```text
http://127.0.0.1:8765/English%20translation/Point%203%20-%20Navigation%20and%20focus/reproductions/sidebar-menu-focus.html
```

Change only the final filename for the other pages. Stop the server with Ctrl+C after use. These instructions do not constitute a new test result.

For a physical A/B comparison: on a freshly loaded page, Tab to link A, then Down Arrow; compare the first pass to B with Tab, then Down Arrow, without activating the links. For C/D: use the usual arrow keys/Navigation Quick Keys to reach C, then D, activate with Space, and record the first workflow. The button shortcut depends on the screen-reader configuration.

## Évaluer la réponse menu

[evaluation-menu.html](evaluation-menu.html) reproduces the SPAN container and its native button, then loads the semantics module and return controller. The Exécuter les contrôles button checks eleven DOM invariants: state/association, native Escape, return after BODY, removal of stale relationships, ambiguities, preservation of callbacks, and restoration. This synthetic page submits no ChatGPT rating or message.
