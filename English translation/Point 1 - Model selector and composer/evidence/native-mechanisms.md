# Native mechanisms examined on October 3

This note is a synthesis derived from inspections of public code and the DOM. It is not a new raw capture or JAWS user validation. Minified names change between versions.

Inspected public source: `https://chatgpt.com/cdn/assets/385910.71a81f043e.js`. SHA-256 of the copy examined at the time: `389E8668E39CD03B070D49E54CCC2063936B982FF5B657E53A5B5A59F14132DF`. Offsets refer to **UTF-16 characters**, not bytes. The large bundle is not included; the relevant mechanism is described here.

| Subpoint | Historical module and location | Observed mechanism |
|---|---|---|
| 1A, translation | `fZ0`, line 405, offset 6627793 | The selection caption is determined by `selectedLabel ?? title` |
| 1A, translation | `e47.O`, line 432, offset 8639966 | `sliderLabel` is taken before the fallback that calls translation |
| 1B, closing | `tfV`, line 433, offset 8840139 | composer-suggestion-ui plugin: editor blur sends dismiss; an exception was identified for emoji, but not for the add buttons |
| 1B, keyboard | `UPl.k`, line 430, offset 8429557 | Navigation created with captureWindowKeydown=true |
| 1B, activation | `VCs.a`, line 947, offsets 15136200–15137604 | Capturing keydown listener on window; action chosen by highlighted index |

The actual popup was identified through `data-mention-section-id=chatgpt-actions` and `data-mention-list-scroll-area`. Its buttons carried `data-list-navigation-item=true`. Initial focus remained in `.ProseMirror[role=textbox]`. These facts connect the public code to the examined rendering and justify a targeted fix rather than global interception of all menus.

For 1C, the evidence is the recall of 163 characters into the editor before protection and an editor remaining empty after protection. The local guard corresponds to the native ProseMirror keymap, loaded before the editor's bubbling handler. This information does not claim knowledge of the product's general intent or JAWS's internal mode.

Post-adaptation measurements and the overall user validation of October 4 are distinct from the native observations of October 3. The accompanying tests exercise the adaptation on synthetic structures and preserve their same nodes and callbacks.

The [October 7 inspection](1A-native-labels-2026-10-07.json) supplements the historical localization findings for 1A: Chrome, `fr-FR` page, selector module inactive. In Chat, the statuses are « Instantané », « Moyenne », « Élevée », « Très élevé », « Pro »; the last caption was recorded as « 6Pro ». In Work for GPT-6.1 Sol, the captions « Minimal », « Moyen », « Élevé », « Très élevé », « Max », « Ultra » correspond to the accessible statuses « Minimal », « Moyenne », « Élevée », « Très élevé », « Maximum », « Ultra ». These native values provide the reference spelling, without inferring an audible difference from the phonetically equivalent forms written by the user. The adaptation preserves the French accessible status.

The [human user validation of October 7](native-user-validation-2026-10-07.json) separately confirms the English announcements in Chat, French levels in Work, the caption/status difference, and the ambiguity of « Activer le mode standard coché » when fast mode is active. This last point is a state observation, with no new extension fix claimed. French DOM/AX names do not replace the reported speech or demonstrate its internal mechanism. The focus and activation behavior of the add menu, as well as recall in previously used conversations and its absence in a new Opera chat before any prompt creating a conversation had been submitted from that browser, are also confirmed by user feedback; no new technical cause involving Opera or JAWS is inferred.

## October 8 addition — selector caption

The inspected DOM contains `data-selected-reasoning-effort=high`. The visible caption is Élevée, while the button's native props retain `aria-label=Sélectionner le modèle ChatGPT`. The choice's presentation metadata has `labels.effort=Élevée`, `labels.model=null`, and `labels.triggerPrefix=null`: the model's absence from this caption is part of the native rendering. The [Edge user validation without the extension at 01:55](2026-10-08-selector-user-validation-edge.json), Brussels time, confirms the generic name for both models tried. The workaround preserves the scope of the visible text and adapts its prefix.

## October 8 addition — reset in the GPT‑5.6 menu

The [native/adapted inspection and JAWS feedback](1A-gpt56-reset-to-default-2026-10-08.json) describe the three items in Chat mode when GPT‑5.6 is selected. The additional control is a DIV with the menuitem role, aria-label « Rétablir la sélection par défaut », and class ResetToDefault-niy99b; its text content is empty. The Edge/Chrome comparison finds the same attributes. The supplied module adapts the selector and its levels, but does not remove this command's spoken repetition. The item's presence and the double announcement are two distinct sources of evidence.
