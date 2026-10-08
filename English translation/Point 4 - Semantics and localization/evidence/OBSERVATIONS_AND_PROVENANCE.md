# Selected evidence for Point 4

Local times cited in this document are Brussels time (Europe/Brussels, UTC+02:00 for dates in September and early October 2026). Technical timestamps retain their explicit time zone; the ISO suffix `Z` denotes UTC.

This item is a **derived synthesis**, prepared on October 6, 2026, then updated on October 7 from historical diagnostic notes, validation and user validation, the initial report, a passive update of October 6, and new native human feedback. It does not replace a raw log and does not claim to be a new capture. Private items are not linked from this deliverable. No real project name, identifier, personal path, account address, or conversation link is retained.

## 4A — Structures and results

DOM record of **October 4, 2026 at 01:46:16.351, Brussels**: three `BUTTON role=button` and five `DIV role=listitem` elements, parents of links, have `aria-roledescription=sortable`. Values in native props and restoration after stopping the correction: native provenance established. Before/after: eight values, then zero; AX of the three sections: button role without a substituting description after correction. Roles, movement instructions, and callbacks preserved. Historical tests: 179 Node tests, including 11 on descriptions; 15 Chromium description checks at that stage.

Later inspection: the active Récents (Recents) link remains `A`; its `listitem` parent has `aria-roledescription=draggable` and `aria-describedby`. Native code adds movement metadata on the row's first focus. Historical markers in the public bundle, **UTF-16 offsets, not bytes**: `hA`, initial state 5191253, focus capture 5191697; `px` 5151889; `useDraggable` attributes 58206. These minified identifiers describe the bundle inspected at the time and are not stable APIs.

Normalized structural excerpt, real names and identifiers omitted; **this is not a literal copy of the React code**:

```html
<button role="button" tabindex="0" aria-roledescription="sortable">Section</button>
<div role="listitem" aria-roledescription="draggable" aria-describedby="instructions">
  <a href="/c/exemple-synthetique">Conversation synthétique</a>
</div>
```

The essential workaround excerpt can be consulted in [the shared source](../../../extension/sidebar-sortable-accessibility.js): the `suppressedValue` function recognizes exactly `sortable`, or `draggable` when `chatRole` confirms a conversation. This code belongs to the extension, **not to a native site excerpt**.

October 4 check: 227 Node tests, including 18 on descriptions; 26 Chromium description checks and eight combined checks. Overall user validation accepts the informative roles. On moving to early startup, automatic scripts switch to `document_start`; user feedback is positive. No precise delay before announcements become available is measured.

## 4B — Preview state and navigation

The [October 8 record: destinations, “Explorer” (Explore), and settings](4B-destinations-settings-2026-10-08.json) contains the current contrast, the native ep component excerpt, and the demonstrator's guards. The [4B report](../REPORT.md#4b--r%C3%A9duit-on-navigation-destinations) introduces main destinations, pins, and the category comparison before the local solution.

October 4 diagnosis on the native rail: the public `oB` component connects expanded state to the secondary preview; selecting it navigates. After switching to Espace (Space), current destination true, expanded=false. No expansion control for this preview observed in that rendering. The component's full original fragment is not attached; this mechanism is a technical paraphrase of the retained diagnosis, **not an invented native code quotation**.

The [shared interface module](../../../extension/ui-accessibility.js) preserves the four demonstrated pairs and leaves an unknown widget intact. In the supplied demonstrator, recognized pins without a real associated control/popup are covered dynamically. Native order and display preserved. States of destinations already adapted were historically validated by the user; pinned buttons are accepted with qualification on October 5. Integrated user validation of October 5 retains these results without a new exhaustive trial.

## 4C — Chat groups

October 3 diagnosis: extra groups on native ordinary-chat rows. Later feedback: the same difficulty in projects, initially omitted by the adaptation. The V2 interface fixture then covers these chats among 16 Chromium checks. Overall user validation of October 4 accepts the points without reservation and ordinary navigation, without a separate verbatim recording of an announcement for each row type.

Normalized structure with a synthetic route; **this illustrates recorded attributes, not the entire private DOM**:

```html
<div role="listitem">
  <div class="sidebar-item" role="group">
    <a href="/g/projet-synthetique/c/chat-synthetique">Conversation synthétique</a>
    <button aria-label="Actions du chat"></button>
  </div>
</div>
```

The `flattenChatGroups` workaround checks the row, native group role, conversation link, and Actions button before removing the role and naming references from the wrapper alone. It preserves the link, button, and list. See [the shared source](../../../extension/ui-accessibility.js).

## 4D — Physical reproductions and boundaries

On October 4, declared JAWS version 2021: A normal, B reproduces exactly the sound and blockage on first pass; repetition without reloading is normal. Difference: list parent `tabindex=-1` only in B. No movement code or extension in this reproduction. The 18-event trace records focus on the links, not the list; it does not date the sound and contains no arrow-key event. User feedback and the trace must not be conflated.

C/D comparison: C normal; D initial sound and blockage, normal repetition. Identical relevant difference on the parent; same HTML buttons, guards, and synthetic forwarding. Passive trace: 37 entries, arrow keys received in the DOM on button-d. D's Alt+Tab return reproduces a blockage that the user distinguishes from the site. No internal mode measured. The [two local pages](../reproductions/PROCEDURES.md) are copies of historical synthetic examples rather than an account capture.

The focusable parent is causal in these structures. The initial project symptom on the site has neither an exclusive attribution nor a known internal JAWS decision. Simple workflows, then nested chats, are validated by the user, with overall user validation of ordinary navigation. The [sidebar-list-accessibility.js](../../../extension/sidebar-list-accessibility.js) module preserves native direct focus and pagination while handling tabindex values of recognized structures at rest.

## 4E — Localization

On October 3, gallery: native presence of `Pin project`, sidebar menu already French. After localization: six French buttons, zero English buttons. The translation of `Unpin project` is present in the code, but the preceding count does not constitute exhaustive physical user validation of this counterpart.

Literal excerpt from **the extension code**, localization function in the project module; it must not be presented as native OpenAI code:

```js
const translation = label === "Pin project" ? "Épingler le projet" : label === "Unpin project" ? "Désépingler le projet" : null;
```

Source: [project-accessibility.js](../../../extension/project-accessibility.js). Historical overall user validation; current human observations are documented separately below.

## Passive update of October 6

**23:48, Europe/Brussels, UTC+02:00.** Record taken in Edge, without the extension, in a shared conversation. Three `BUTTON` elements, `button` role, `aria-roledescription=sortable`, `tabindex=0`. Accueil (Home), Espace (Space), Planifié (Scheduled), and Plugins exposed as reduced/collapsed in the accessibility tree. The rendering also includes an h4 “Dernière réponse” (Last response), addressed in another Point of the dossier.

This summary retains no discussion URL or identifier. The high-entropy record indicates Edge 154.0.4258.62 and Chromium 154.0.8037.98. No click, JAWS speech, or new trial of groups, projects, or gallery is established by these observations. They update only 4A and 4B.

## Native human feedback of October 7

Direct source: the user's detailed answers to supplementary user-validation questions, and subsequent clarifications. The [derived JSON](native-user-feedback-2026-10-07.json) includes only useful product facts; it is neither a DOM trace nor an audio recording. Time range **19:18–22:40**, Brussels, with the end declared by the user. JAWS version 2021 remains unchanged. The user reports the same results from experience with Edge/JAWS 2025 and in a new Opera trial; no physical measurement by the agent is substituted for these reports.

- **4A:** sortable persists on Épinglés (Pinned), Projets (Projects), and Récents; “sortable étendu” (sortable expanded) for Projets, “sortable réduit menu” (sortable collapsed menu) for nested actions, and substitution for link/button in project chats. After Tab on the first Récents chat, leaving Forms Mode and returning to the arrow keys, draggable replaces link/button announcements. The user also correlates replacement with activating Actions du chat (Chat actions). Historical first-focus initialization code and this current correlation remain distinct.
- **4B:** destinations are still announced as “réduites” (collapsed), with “page courante” (current page) on the active destination. Projets/Épinglés/Récents controls actually expand their lists; their expanded state is not equated with the navigation-destination defect.
- **4C:** groups reconfirmed as described in the initial report. Authorized, anonymized transcription: Début du groupe [Nom du chat]; [Nom du chat]; Actions du chat; Épingler le chat; Fin du groupe; then the next group. Two additional lines are added per group. No unprovided spoken role is invented.
- **4D:** showing/hiding project chats and Tab before or within Récents cause the sound, perceived switch to Forms Mode, and blocked arrow keys; Escape or a manual return to the Virtual PC Cursor allows resumption. Human correlation; internal JAWS cause not measured.
- **4E:** missing translation still observed in the gallery for pinning labels. The project's sidebar Actions menu, where pinning is located, remains reachable only by Tab, like Nouveau chat (New chat). The already French sidebar menu is not presented as an English Pin/Unpin case.

The initial support report is an authorized textual source for the passage on groups, reconfirmed on October 7. Only that workflow is included; personal contact details and account information from that source are not incorporated in the deliverable. Historical DOM/AX evidence and fixtures retain their dates, counts, and limitations.
