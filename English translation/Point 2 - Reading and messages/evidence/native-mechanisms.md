# Native sources and mechanisms — Point 2

The local times cited in this document are Brussels time (Europe/Brussels, UTC+02:00 for the September and early October 2026 dates). Technical timestamps retain their explicit time zone; the ISO suffix `Z` denotes UTC.

This document provides the technical basis of the findings. It distinguishes the inspected public site code, the properties actually rendered, adaptation trials, and human validation. It does not substitute the corrective module's behavior for site code as evidence of a native defect.

Minified identifiers and asset names are historical markers. They may change and are not necessarily unique within a bundle. Searching by name alone is insufficient: check the contract and branch described. No bundle dump or conversation content is included.

## 2A — Two generations of virtualization

| Generation and inspected public source | Observed contract/rendering | Possible verification |
| --- | --- | --- |
| Legacy, September 17 observation: asset `8b34dbc2-ebqp55m3e77tmmob.js`, function `z$n`; asset `conversation-small-j1kh59k03k5v196u.js`, function `fGa` exported as `$l` | `z$n` makes the children of `data-turn-id-container` containers conditional on intersection and forced rendering modes. `fGa` creates an IntersectionObserver with `rootMargin: "1000px 0px 1000px 0px"`, threshold 0.01. Descendants are actually removed and replaced by empty placeholders; CSS alone does not restore these nodes. | Compare container descendants at the top/bottom. Distinguish the prompt table observer, whose margin is `-49% 0px -49% 0px`: it is not targeted by the fix. |
| Modern, September 30 observation: asset `97193.e58693f09d.js`, module `iBd` | List under `.thread-scroll-container`, `data-chatgpt-conversation-selection-target`, `data-turn-key` rows. The component receives `retainedTurnKeys`, `synchronousMeasurementTurnKey`, `getPendingRestoreScrollDistanceFromBottomPx`, `RowComponent`. Its range depends on scrolling; retained keys keep turns outside the range in the React rendering. | On the component actually mounted, check these four properties together. The historical observation counts five mounted rows for 126 entries; the reversible retained-key trial renders all 126 and preserves their identity after scrolling. |

The [October 7 observation](2A-virtualization-2026-10-07.json) finds the same contract in asset `672590.d8b5b4b48a.js`, module `if6`. It limits the native rendering examined to 6 mounted rows for 17 available entries, then the technical workaround to 27/27. User validation of navigation up/down is reported separately by the user.

Assets help locate a historical load; they are not hard-coded as a compatibility guarantee. The [modern tests](../reproductions/keep-modern-turns.test.cjs) exercise the synthetic contract and its guards; the [modern fixture](../reproductions/modern-browser.html) checks node preservation and identity in a browser. The [legacy tests](../reproductions/keep-turns.test.cjs) and [legacy fixture](../reproductions/browser.html) check observer isolation and stability of the 80 synthetic messages. These fixtures prove the local mechanism, not a new inspection of the site or JAWS speech.

Corresponding adaptation functions: `matches` and `ContinuousTurns` in [keep-modern-turns.js](../../../extension/keep-modern-turns.js). The contract is applied only to entries from the same conversation, and the export hook is restored after discovery/expiration. The legacy code [keep-turns.js](../../../extension/keep-turns.js) preserves the other native observers.

## 2B — Markers, native state and the 43-card branch

The October 3 public snapshot for reasoning state is [385910.71a81f043e.js](https://chatgpt.com/cdn/assets/385910.71a81f043e.js). The recorded SHA-256 fingerprint is `389E8668E39CD03B070D49E54CCC2063936B982FF5B657E53A5B5A59F14132DF`. Local comparison with the snapshot retained for investigation confirms this fingerprint; the bundle is not distributed here. The following offsets are **UTF-16 characters**, not bytes.

| Precise marker | Public code/rendering fact |
| --- | --- |
| Module `rM5`, function `p`, offset 11442962 | The renderer chooses the supplied message, otherwise `thinkingShimmer.default` (« Thinking » in the English default). This establishes the native origin of the translated generic label; the extension does not create a more specific action. |
| Shimmer, offset 11441741 | Meaningful text in `.cadencedShimmerHighlight-VcX29h`, visual copy `.cadencedShimmerSweep-ICUAVH` hidden by `aria-hidden`. |
| Module `ZA`, function `z`, offset 6385886 | The projection can supply a reasoning title or an activity without a title. This does not justify rendering undisplayed text as a new accessible step. |
| Inspection of React owners of the active turn in the committed tree, October 3 at 23:45:58.833 Brussels time | `completed=false`, `hasFinalAssistantStarted=false`, no specific activity; header `dK` uses the renderer without a message. |

**GPT-5.6 « ChatGPT a dit » heading.** With GPT-5.6 Sol, the heading appears only after reasoning has finished and then remains normally present once the response has been added to the chat. DOM/AX captures document its absence during reasoning and its presence afterward. GPT-6 has a « ChatGPT a dit » heading from the start; its absence is not a reported defect for that model. The final caption supplies the button name by reference and also remains separately exposed. This establishes duplicate exposure in the inspected rendering, without guaranteeing every transition instant. The `labelReference`, `groupParts`, `updateTurn` and `repairControl` functions in [reasoning-accessibility.js](../../../extension/reasoning-accessibility.js) handle these relationships; the [corresponding tests](../reproductions/reasoning-accessibility.test.cjs) check their invariants on synthetic test doubles.

**GPT‑5.6 and GPT‑6 with High reasoning.** The first [native comparison](2B-reasoning-heading-gpt6-gpt56-2026-10-07.json) establishes that GPT-5.6 Sol shows the « ChatGPT a dit » heading only after reasoning has finished and keeps it once the response has been added to the chat. For GPT‑6, the main evidence is now the [completed turn](2026-10-07-reasoning-contract-gpt6.json), the [regions and successive markers](2026-10-08-reasoning-regions.json), and the [active-then-completed trace excerpt](2B-completed-generations-gpt6-2026-10-08.json). High is the level specified by the user. GPT-6 has a « ChatGPT a dit » heading from the start of reasoning. JAWS feedback places the current activity before completed details in both models. The supplied module distinguishes these contracts to address the absence of the « ChatGPT a dit » heading during GPT-5.6 Sol’s reasoning and the activity’s reading order in both renderings.

**GPT-6 regional contract, additional observation on October 7 around 23:20 Brussels time.** The [inspected native structure](2026-10-07-reasoning-contract-gpt6.json) exposes a direct button, a name by reference and a SPAN caption outside the button that is separately accessible. Its committed owner supplies `region`, `completed`, `reasoningRecap`, `activeSummary`, `canExpand`, `hasStandaloneItems` and `hideHeader`. The GPT-5.6 contract properties `summary` and `shouldAnimateInitialCollapse` are absent from this group. Reduced native code excerpt, with minified names preserved and no conversation content:

```text
region:d, completed:u, reasoningRecap:g, activeSummary:m,
canExpand:p, hasStandaloneItems:f, hideHeader:b, children:_
// Choix de l’ouverture ; suffix représente ici la branche de région.
C = g?.type === keep_inline ||
    (x ?? (w?.visibility === visible ? w.default_expanded : !u || suffix === d.kind));
disclosure: p ? {expanded:C, onToggle:()=>I(!C)} : undefined;
summary: k ?? (u ? Previous activity : m);
```

This is a structural logic excerpt, not a standalone program: constants and labels come from the component context. The local `completed` boolean selects the group's activity and expansion. The global response phase is therefore insufficient to represent the group's completion. Additional JAWS feedback places the current status before already completed details and describes a second line without a role repeating the activity or « Réfléchi pendant [durée] ». The separate exposure of the referenced caption supports this observed duplication; it is not a voice recording.

The [demonstrator 4.1.2 module](../../../extension/reasoning-accessibility.js) recognizes both signatures, preserves independent tool controls, adds the current status at the end of expanded details and removes only the second reading of the caption. Native names and duration are restored on completion; bodies and callbacks are preserved. [60 Node tests](../reproductions/reasoning-accessibility.test.cjs) and [15 regional Chromium checks](2026-10-08-reasoning-regions.json) verify mechanisms without replacing JAWS user validation of this adaptation. The [local fixture](../reproductions/reasoning-regions.html) is synthetic and sends no message.

The [additional October 8 observation](2026-10-08-reasoning-regions.json) preserves the order of markers and groups without recording their content. The local regional signature is handled from the initial activity, before a reasoning item is necessarily available. The context remains a committed, bounded activity list with boolean indicators; nested tool controls do not become main groups.

**43 Python cards: inspected native branch.** The verified native type is `chatgpt-python-execution`. The inspected parent rendering function `dU`, with `streamingParentRegion` absent, separates analysis items, renders the rest through `dK`, then renders the cards through `o8` as siblings in a Fragment. They are therefore outside the main collapse control. This case belongs to this actually mounted branch, not another prefix branch of `dK`.

These names come from inspection of the **actually mounted** public functions and their contracts; no `dU/dK` offset is claimed in the snapshot above. Identically named functions exist there in other components. To re-examine this, connect the rendered owner to types/phase/region and the actual sibling rather than keeping the first occurrence of a minified name.

The real check counts the same 43 nodes before/after collapsing and expanding them as a group, then opens a native « Analysé » button with Space. Examination of other loaded reasoning finds no individual expansion control on their ordinary text; it does not demonstrate a general historical removal of details. Adaptation functions: `rendererProps`, `eligibleRenderer`, `inspectContext`, `toolWrapper`, `findGroup`, `hideTool`, `showTool` in [analysis-details-accessibility.js](../../../extension/analysis-details-accessibility.js); [tests](../reproductions/analysis-details-accessibility.test.cjs).

October 4 user validation: results without reservations accepted, analysis grouping validated for the examined case with explicit difficulty reproducing new cases. Sampled captures and node checks do not amount to user validation of all future turns.

## 2C — Native selection styles

In the rendering inspected on October 4: `.thread-scroll-container`, `[data-turn-key]` turns, user headings `h4.sr-only.select-none` containing « Vous avez dit : », visible dates `time[datetime]` under `div[role="separator"]`. The computed style of user headings and dates is `user-select: none`. This exclusion is a native CSS fact distinct from descendant removal through virtualization. Local « ChatGPT a dit » headings are already selectable; their hidden native duplicates must not enter the copy a second time.

The [selection fixture](../reproductions/page-selection.html) reproduces synthetic metadata with these exclusions, then checks selection, focus, editors, collapsed text and reversibility of the adaptation [page-selection.js](../../../extension/page-selection.js) / [reasoning-selection.css](../../../extension/reasoning-selection.css). Visible code examples in the [historical reasoning fixture](../reproductions/reasoning-selection.html) remain explicitly displayed synthetic content.

The [native Edge comparison on October 6](native-selection-2026-10-06.json) is independent: manual selection of two paragraphs, corresponding copy after whitespace normalization, without adaptation. It prevents a conclusion that native selection is generally impossible; it validates neither large-scale global selection nor Windows JAWS gestures.

The [native feedback on October 7](native-user-validation-2026-10-07.json) confirms functioning selection outside position jumps. The accessibility stability problem is associated with 2A. Inclusion of speakers, durations and timestamps absent from native copying is retained as a product request; their exclusion alone is not classified as a demonstrated accessibility defect.

## 2D — Public copy code, native states and notifications

### Share

The [native trace from October 5](2026-10-05-native-sharing-and-copying.json) preserves the causal order of the observed rendering: click at 131 ms, HTML disabled attribute at 148 ms, focus moves to BODY at 154 ms, reactivation at 1615 ms, notification at 1620 ms. The same button remains connected and does not regain focus.

The notification is `LI[data-sonner-toast]`, inside `OL[data-sonner-toaster]`. Its outer region already has `aria-live=polite`, `aria-relevant="additions text"`, `aria-atomic=false`. The native text includes both sharing sentences. It would therefore be incorrect to present the site as having no live region. Its silence according to JAWS feedback does not, by itself, reveal its internal cause.

### Copy

The inspected public helper `TqJ` uses `navigator.clipboard.write` / `writeText` and `ClipboardItem`; the examined path returns false and displays an error on failure. No `execCommand`, focused temporary field, Selection transaction or explicit focus call was found in this helper. User callbacks concern analytics/feedback; the response-copy path prepares HTML on a detached clone. The asset/offset identification for this helper is not retained in the materials: its bundle therefore cannot be attributed to the October 3 snapshot. The rendered button callback identifies the relevant helper; this historical identifier does not extend to other assets.

The [native availability measurement](2026-10-05-native-copy-availability.json), with local feedback modules stopped for this comparison, records the response button connected and focused: `aria-busy=true` and `aria-disabled=true` during writing, then the rendered React callback absent for about two seconds after success. DOM `onclick` remains, and AX still exposes a focusable/non-ignored button on success. **The absence of the React callback therefore does not prove that the button is absent for JAWS.** A later measurement corrects the first interpretation for sent messages: their rendered callback also disappears for about 1.5 s, but their unavailability is not exposed through the same native ARIA states.

Inspected SVG difference: Share contains persistent text and an `aria-hidden=true` icon; Copy controls contain an unnamed, accessible SVG image that is then replaced. In one observation, AX button 1286 retains its identity, while its image child 1287 is replaced by 4910. This change is observed, but does not prove that JAWS anchors its cursor there.

**Physical feedback refutes proposed sufficient causes.** Stabilizing the name (constant name), then hiding the decorative SVG (decorative icon), leaves the symptom unchanged. These changes therefore cannot be presented as a complete explanation. Targeted busy-state handling keeps the response button and eliminates the jump, with confirmation still poorly timed; 500 ms after success (delayed confirmation) is user-validated for both families; unavailability of the sent-message button during its suspension (exposed unavailability) is validated afterward. The [dated findings](observations-2026-10-03-05.json) separate these user validations.

The `protect`, `protectCopyName`, `maintainCopyIcons`, `onClick`, `inspect`, `announce` functions in [feedback-actions.js](../../../extension/feedback-actions.js) correspond to the local guards. The [Node tests](../reproductions/feedback-actions.test.cjs) and [fixture](../reproductions/feedback-actions.html) exercise synthetic confirmations, availability, focus and cancellations. The site exposes the name « Copié »; « Message copié » is an announcement added locally on success, unlike the sharing sentences that are actually native.

The two native JSON files copied here are the original historical observations, containing only control names, attributes, relative times, styles and booleans. They contain no message bodies or clipboard text. Subsequent window/document movements are not automatically attributed to copying.

On October 7, the user again confirms unchanged native defects: silent copying and a jump to Share for responses; silent conversation-wide sharing with a return to the top of the page. These workflows confirm the native defects; earlier adapted user validations remain established.

## 2E — Writing Blocks

The October 4 inspection records four BUTTON elements directly under BODY: `type=button`, `contenteditable=false`, `data-writing-block-table-grab-handle=row/column`, classes `writing-block-table-grab-handle` and the corresponding suffix. Sole text « ⋮⋮ », with no descriptive name. Computed style `opacity=0`, `pointer-events=none`; despite this visual/mouse inactivity, the buttons are still exposed.

The public code of the inspected handlers opens menus for adding a row above/below or deleting it, and adding a column left/right or deleting it, for the targeted table row/column. The asset/module reference for these handlers was not retained. The name and DOM signature allow the controls to be located, then their native callback connected to the menu actually rendered, without changing the document.

Local functions `handle`, `inactive`, `update`, `restore` in [writing-block-accessibility.js](../../../extension/writing-block-accessibility.js). The [existing fixture](../reproductions/writing-block-accessibility.html) checks the four synthetic controls, their exclusion when inactive, their return when activated, preserved callbacks, and editing/Copy. It does not demonstrate correct labeling for every active table menu. Removal of inactive handles is user-validated on October 4; their lack of a descriptive native name remains a separate fact.

On October 7, the native defect is confirmed as unchanged: request reusable/copyable writing, wait for generation to finish completely, then navigate to the bottom of the page. This user validation is not a new DOM count of the four handles.

## 2F — Dernière réponse

The basis is a DOM/AX observation: `h4.sr-only`, exact text « Dernière réponse », outside the message. This exposure adds a heading stop; no particular native navigation algorithm is attributed to this element alone. The `hideLastResponseHeading` function in [ui-accessibility.js](../../../extension/ui-accessibility.js) targets the exact marker and preserves headings within messages. Human reproduction and its overall acceptance are in [the procedures](../reproductions/PROCEDURES.md) and [the findings](observations-2026-10-03-05.json). This is a requested simplification, not universal proof that such a heading is invalid.

The user confirms this heading's native presence on October 7.

## 2G — Web navigation, card name and dialog

The relevant observations come from JAWS feedback on references (« Bouton de menu réduit dialogue »), October 8 feedback reporting only « Ouvrir [nom du lien hypertexte] » in the card, and DOM/AX inspections and reversible activations on October 8, 2026, Brussels time (Europe/Brussels, UTC+02:00). The [content and name evidence](2026-10-08-source-preview-content.json) distinguishes before/after without private conversation text.

The [native structure and navigation evidence](2026-10-08-native-sources.json) records a SPAN popover-trigger with button role; Enter/Space calls its activation. A single-source citation opens `https://codex-reset.com/radar/`, a grouped citation opens a page on `www.sotwe.com`, while also opening their previews. The keyboard handler and callback dispatcher are retained in this document; destinations are established by observed activation, not inferred from a favicon.

The native card is a pressable BUTTON with `aria-label="Open [source]"`. Text descendants for the source, title and text are present in the DOM and as non-ignored StaticText in AX. The non-modal dialog has no name in this example. The explicit card name abbreviates the content presented as the control's name. Focusing the trigger opens the preview without navigation; Tab reaches the card; Escape closes it and returns to the reference. This interactive panel is not classified as a non-focusable tooltip.

In the 4.1.2 illustration, the [targeted module](../../../extension/source-links-accessibility.js) preserves hosts and callbacks, exposes navigation controls as links, removes abbreviated names from recognized non-empty cards, and names source panels without a native name. The computed link name becomes « Codex Reset Codex Radar: Reset, Limits & Service Signals Total lines: 277 », and the dialog name « Aperçu des sources : Codex Reset ». The example information is not artificially translated or enriched with an article absent from the card. Historical checks of card content (twelve Node tests and thirteen Chromium scenarios, 172 repeated checks, zero failures) check guards, activation, identity and restoration; new adapted JAWS speech remains distinct from these technical results.

Site reproduction and the expected result appear in [PROCEDURES.md](../reproductions/PROCEDURES.md#2g--references-and-source-previews), and synthetic checks in [RUNNING_TESTS.md](../reproductions/RUNNING_TESTS.md#checking-source-references-and-cards--2g).

The [October 8 favicon evidence](2026-10-08-favicon-checks.json) distinguishes visible content from the extraneous image filename. Empty alt on the recognized favicon excludes this decorative graphic; meaningful alternatives and other images are preserved. Eighteen Node tests and nine stabilized Chromium states pass. The text Total lines: 277 remains the visible content supplied by the site.
