# Point 3 evidence: provenance, results, and limitations

This document is a **derived synthesis** of diagnoses and user validation of October 3–5, 2026, native human feedback of October 7, and inspection of the Évaluer la réponse (Rate the response) menu. Historical items retain their observations, dates, versions, and limitations. The [October 7 feedback JSON](native-user-feedback-2026-10-07.json) transcribes the testimony; the [3G record](3G-native-rating-menu-2026-10-07.json) separately documents structure and DOM focus. The [local procedures](../reproductions/PROCEDURES.md) connect these observations to reproduction workflows.

JSON strings were examined before selection: known product labels, structures, tracked keys, counters, and synthetic identifiers. No conversation content, personal project name, personally identifying Windows path, cookie, or token was selected. Retained tab titles designate synthetic trials. Traces can mention a region, target, or property without exposing its content.

## 3A — Projects, lists, and first focus

- [Initial project user validation, October 4](3A-user-validation-projects-2026-10-04.json): qualified direct positive feedback on the requested arrow-key/Navigation Quick Keys workflow, access to Actions, then Nouveau chat (New chat) without activating it, menu opened with Space, presence of Page d’accueil du projet (Project home page), then Escape. No independent record of each gesture or of speech.
- [Physical A/B link comparison, October 4](3A-link-comparison-2026-10-04.json): A without tabindex on the list, B with tabindex=-1. The user reports A normal, B reproducing exactly the sound/blockage on first pass, then normal repeated navigation without reloading. Eighteen structural events; focus on links, not on the DIV list in recorded passes. The absence of an arrow key in the trace does not contradict human feedback and does not establish when the sound occurred. No DnD or extension in the fixture.
- [Physical C/D button comparison, October 4](3A-button-comparison-2026-10-04.json): same buttons, states, and click forwarding; only relevant difference is tabindex=-1 on list D. C normal, D with reported initial blockage/non-repetition. D's Alt+Tab return differs from the site's: this divergence is retained. Thirty-seven events, without reading the name or internal state of JAWS mode.

Native notes of October 3 found Actions and Nouveau chat accessible with Tab, including according to feedback with the extension disabled. Buttons and ARIA menu relationships are exposed by Chrome. The interactive outer row and nesting are characteristics to examine, not proof of automatic hiding of descendants. The native keyboard contract required currentTarget===target; moving only role/tabindex to a child would have broken this contract.

The public list code examined on October 4 exposes role=list and tabindex=-1; its explicit focus calls concern pagination. In Récents (Recents), draggable initialization on first focus is also observed; it is not activation of keyboard DnD and is not enough to explain projects using a different branch. The two fixtures isolate the effect of the focusable parent; overall user validation on October 4 subsequently accepts simple/nested navigation and expansion in the declared context.

## 3B — Sidebar reopening and toggling

**Synthesis of October 3–4 observations**, without an additional attached raw trace: collapsed rail without a reopening control in the examined rendering, native Ctrl+Shift+S cycle checked; native control became inert on closure, then BODY. The placement preference after Profil (Profile) and correction of the old unstable local proxy are separate from these facts. Positive user validation of the persistent control, October 4.

Native feedback of October 7 reconfirms the lack of access to the reopening control with arrow keys and Tab. The former duplicate-controls point was removed from the report.

## 3C — Afficher plus pagination

**Synthesis of native inspection on October 4**: five chats before, six after; Afficher plus (Show more) button removed during loading; focus on DIV role=list tabindex=-1 during and after; last previous Actions button still connected/visible. The native onLoadMore callback is a function before loading, then absent when hasMoreItems=false. Public component JVh queues a microtask and focuses the available footer button or the list.

The targeted mechanism is checked in a Chromium fixture: 34 pagination/list checks for the pagination mechanism, including callback removal on the final page. This verifies the adaptation, not JAWS's decision. Physical user validation of pagination on October 4.

## 3D — Menus: virtual position and DOM focus

**Synthesis of notes and passive traces of October 4**, without a separate raw export available in this selection:

| Workflow | Human feedback | Retained DOM measurement |
|---|---|---|
| Profil | After Escape, Down Arrow resumes at the top. | Transient BODY; exact button focused approximately 34 ms after Escape, retained until 500 ms. |
| Recent-chat Actions | Same return to the top. | Exact button recovered approximately 35 ms after Escape, still focused until 500 ms. |
| Repeated Profil | Correct resumption this time. | Same DOM return, approximately 68 ms after Escape; no observed aria-hidden/inert mutation or masking in the twelve examined ancestors. |

These delays are trial measurements, not thresholds indicating that JAWS is ready. DOM return does not confirm the Virtual PC Cursor position. After correcting the local data-state=closed guard and extending to associated popovers, two Profil trials and one recent-chat trial still fail physically despite correct DOM. A single return in the removal microtask subsequently obtains positive Profil user validation, then repeated validation, and is integrated. Other menu navigation is accepted; “Explorer” (Explore) subsequently receives the separate workaround described in 3E.

Attached synthetic checks cover association, already-correct native return, actual removal and hiding, late tasks, and cancellation by user intent. On their own, they do not reproduce the Windows/JAWS accessible-event flow. The existing module also covers Autres actions (Other actions) on messages; the three 3F actions have a different association.

## 3E — “Explorer”: entry and popup property

| October 5 item | What it establishes | Limitation and result |
|---|---|---|
| [Entry aligned with destination](3E-explore-entry-2026-10-05.json) | Container → destination transfer; Escape closes then restores the button, Down Arrow reopens natively. | Bounded entry validated by the user; exit concern still present at this stage. |
| [Return after lifecycle](3E-exit-lifecycle-2026-10-05.json) | Panel removed, return to the button after native lifecycle, focus still present at 250 ms. | Physical result unchanged; variant not integrated. |
| [Popup-property comparison](3E-popup-property-2026-10-05.json) | Panel removal, exact return, and popup property absent at focus. | Qualified positive human feedback; no internal JAWS state measured. |
| [Integrated user validation of October 5](3E-user-validation-3.4.0-2026-10-05.json) | Expected behavior declared, including after user unpinning. | Physical user validation of the integrated distribution; pinning/unpinning actions are attributed to human feedback. |

Independent native comparison: Enter focused DIV dialog tabindex=-1; Down Arrow focused the first destination, Projets (Projects). The twelve destination/pinning buttons had the same roles/tabindex in both observed openings. The closed button exposed hasPopup=dialog in the Chrome tree; the property is valid for the dialog panel. The final popup-property adaptation is an interoperability workaround and does not demonstrate a native semantic error.

Native entry and arrow keys are preserved in the final distribution validated by the user. Repetitions in the same document are not counted as independent trials.

## 3F — Sharing/editing the same message

[Message returns and passive trace of October 5](3F-user-validation-3.6.0-2026-10-05.json): positive user feedback on returning to the same message after sharing a response, sharing the prompt, and cancelling editing. The initial-mode clarification is retained. The trace reaches **60 events**, its cap; it therefore does not exhaustively establish every step of all three returns.

**Synthesis of native inspection**: before the new module, actual closure to BODY; sharing preserves its button, editing removes the form then recreates the button. All three adapted returns were checked in Chrome. Eleven synthetic closure/cancellation checks passed for return to the same message. The three physical gestures subsequently received positive feedback with this version on October 5; this adaptation is retained in demonstrator 4.1.2.

First Escape in editing Forms Mode: switch to Virtual PC Cursor, editing still open. Closing Escape: the native jump concerned. Already at Virtual PC Cursor: one press closes. No DOM event is inferred for the initial mode-change keypress. This observation does not determine the mechanisms of other menus.

## 3G — Évaluer la réponse: native structure and workaround

**Direct native feedback of October 7**: the control present is “Évaluer la réponse”, announced as “bouton” (button), although it opens a menu. One Escape closes it, then returns focus to the top of the page. No ARIA relationship or internal cause is measured by this testimony; no newly validated correction is asserted.

The Réagir (React) label from the October 5 report is no longer found during the latest user validation. Its former mention of two Escape presses remains a historical limitation and does not describe the current control. The historical 3F fixture includes a Réagir exclusion control; it reproduces neither the current panel nor its announcement.

The [native record of October 7](3G-native-rating-menu-2026-10-07.json) shows a `BUTTON type=button` named Évaluer la réponse, without `aria-haspopup`, `aria-expanded`, or `aria-controls`. Its `SPAN` parent has `aria-haspopup=menu`, `aria-expanded=false` in the closed state, and a unique identifier. The menu has `role=menu`, references that identifier through `aria-labelledby`, and contains Bonne réponse/Mauvaise réponse (Good response/Bad response). On native closure with Escape, DOM focus returns to the button. The reported resumption at the top therefore concerns another level: the reading cursor's position.

The [evaluation-menu-accessibility.js](../../../extension/evaluation-menu-accessibility.js) module carries `aria-haspopup` and the open/closed state onto the existing button. It supplies `aria-controls` only when the associated menu and its identifier are unique; stale relationships are removed, unrelated properties preserved. The [return controller](../../../extension/sidebar-menu-focus.js) checks turn identity before returning focus, so a recycled node does not designate another message.

Technical validation comprised 35 Node tests of the semantics module, 36 of the return controller, and 11 Chromium checks of the [Évaluer fixture](../reproductions/evaluation-menu.html), among 478 Node tests passed in total. These checks cover native callbacks, Escape, return from BODY, preservation of an already-correct native return, ambiguities, recycling, and restoration. They establish the workaround's DOM mechanism without providing a measurement of JAWS speech or cursor position.

The [passive inspection of the adapted structure](3G-adapted-rating-menu-2026-10-07.json) subsequently records nine existing buttons with `aria-haspopup=menu` and `aria-expanded=false`. The targeted AX node is a focusable, nonignored button named Évaluer la réponse, with `hasPopup=menu` and `expanded=false`. No speech is recorded and no menu is opened during this record; the evidence concerns the exposed semantics of the closed button.

## Native human feedback of October 7, 2026

Source: the user's detailed answers to supplementary user-validation questions and subsequent clarifications. Time range **19:18–22:40**, Europe/Brussels. The [derived JSON](native-user-feedback-2026-10-07.json) retains only product observations. JAWS version 2021 remains unchanged; the user reports the same results with Edge/JAWS 2025 from experience, and during a new Opera trial. These are human reports, not measurements by the agent.

| Case | Current reported observation |
|---|---|
| 3A | Projects' Actions and Nouveau chat reached only by Tab, inaccessible with arrow keys/Navigation Quick Keys. Afficher/masquer les chats (Show/hide chats) and Tab before/within Récents cause sound, a perceived switch to Forms Mode, and blockage; Escape or a manual return to the Virtual PC Cursor allows resumption. |
| 3B | Showing the hidden sidebar inaccessible with arrow keys and Tab. |
| 3C | Afficher plus returns to the beginning of the project's chats. |
| 3D | Profil and chat Actions require two Escape presses; Filtrer and project/chat sidebar Options require one. Link/button replacement also observed on the chat whose Actions has just been activated. |
| 3F | Returns to the top of the page after Partager (Share), Actions, Modifier (Edit), and other chat buttons unchanged since earlier adjustments. |
| 3G | Évaluer la réponse announced as bouton, opens a menu; one Escape closes it, then return to the top of the page. |

Connections between Forms Mode, the number of Escape presses, and role replacement are reported correlations. They demonstrate neither the same DOM path nor internal JAWS causation.

## Shared provenance limitations

Historical technical evidence retains its October 3–5 dates; human feedback of October 7 updates explicitly reconfirmed symptoms without redating these measurements. User validation applies to the declared context and retains its qualifications. Attribution of native focus loss to BODY is better supported on certain paths than across all cited families. The internal cause of virtual phenomena remains open.
