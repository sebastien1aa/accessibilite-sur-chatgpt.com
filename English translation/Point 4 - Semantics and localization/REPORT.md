# Point 4 — Semantics and localization

This Point addresses five obstacles: role descriptions that obscure function, collapsed state on destinations, redundant groups, blocked arrow keys on first focus, and untranslated project pinning. Native mechanisms, interoperability, and requests for simplification are distinguished in each subpoint.

The [conditions and versions](../ENVIRONMENT.md) are shared. The [site procedures](reproductions/PROCEDURES.md), [evidence](evidence/OBSERVATIONS_AND_PROVENANCE.md), and [isolated tests](reproductions/RUNNING_TESTS.md) accompany the subpoints. The supplied demonstrator is **4.1.2**.

## 4A — “Sortable” and “draggable” instead of informative roles

**Problem.** The “sortable” and “draggable” announcements obscure the useful roles of sections, links, and buttons.

**Expected result.** Recognizable functions, with access to sorting and movement instructions preserved.

**Reproduction.** [Workflow 4A](reproductions/PROCEDURES.md#4a--role-descriptions).

On October 7, the user reconfirms “sortable” on the Épinglés (Pinned), Projets (Projects), and Récents (Recents) sections. Expansion states persist: in particular, the user specifies **“sortable étendu” (sortable expanded) for Projets**, which actually shows or hides its chats. In nested project lists, the user hears sortable instead of link/button, and **“sortable réduit menu” (sortable collapsed menu)** on action buttons. After Tab on a row, then Escape or a manual return to the Virtual PC Cursor and resumption with the arrow keys, **“draggable” also replaces link/button announcements**, particularly on the first Récents chat when that is the one focused with Tab; otherwise, this occurs for attributes in the group of the chat concerned. These English technical descriptions obscure the useful function in the workflow (usually “bouton” or “lien”, meaning button or link).

The same feedback connects this replacement with the chat whose Actions button has just been activated. Two observed triggers must therefore be recorded separately: access by Tab and activation of Actions. This dated correlation does not establish that every change described after Actions has the same cause as the technical initialization on first focus.

On October 4 at 01:46:16.351, three HTML `BUTTON` elements with the `button` role and five parent `DIV` elements with the `listitem` role natively have `aria-roledescription="sortable"`. Conversation links remain actual links. A later inspection finds `aria-roledescription="draggable"` on the `listitem` parent of a focused Récents link. The native code initializes the movement metadata for this row on first focus.

The role and its description must be distinguished: `button`, `link`, and `listitem` have not disappeared from the DOM. `aria-roledescription` provides another way to present the role to assistive technologies. Its substitution can obscure useful information in the announcement. The [WAI-ARIA definition](https://www.w3.org/TR/wai-aria-1.2/#aria-roledescription) explains this mechanism; it does not by itself establish JAWS speech in a given browser.

The workaround removes the exact values `sortable` within the recognized scope and `draggable` on recognized conversations or their owning parents. It preserves roles, links, controls, `aria-describedby` movement instructions, and native callbacks. It does not disable sorting. The [shared sources](../../extension/sidebar-sortable-accessibility.js) show this targeting and its restoration on shutdown.

The informative roles were validated by the user in the overall workflow on October 4. Startup was subsequently moved forward to `document_start`, with positive feedback. On October 6, the three native buttons without the extension still have `sortable` and `tabindex="0"`. The latter attribute must not be confused with the parent `tabindex="-1"` studied in 4D.

An upstream solution should keep the role recognizable, localize genuinely useful movement information, and check announcements on initial focus as well as after updates. Correcting the role description must not remove access to sorting or its instructions.

## 4B — “Réduit” on navigation destinations

**Problem.** Destinations are announced as collapsed even though activating them navigates; this state does not describe the current page.

**Expected result.** Navigation and the current page are clearly announced; expansion states are attached to the content they actually control.

**Reproduction.** [Workflow 4B](reproductions/PROCEDURES.md#4b--destination-state).

### Native observations and code

On October 7, the user confirms “réduit” (collapsed) on destinations and “page courante” (current page) when a destination is active. The [native record of October 8](evidence/4B-destinations-settings-2026-10-08.json), in Edge, finds Accueil (Home), Espace (Space), Planifié (Scheduled), and Plugins with aria-expanded=false; Accueil also has aria-current=page. The button navigates, while this state describes a secondary preview.

The currently identified React owner ep computes the current page and preview separately:

~~~js
"aria-current": f.isCurrentDestination ? "page" : void 0,
"aria-expanded": null != q ? H : void 0,
onClick: t => {
  t.defaultPrevented || (e?.onActivate(),
    f.onSelect(void 0, "CHATGPT_SIDEBAR_MENU_ITEM_PLACEMENT_PRIMARY"));
}
~~~

This native code excerpt comes from the committed component owning data-sidebar-destination. The same component defines `H = null != A && A.area === q && A.productMode === f.peekProductMode`: the announced state depends on the preview matching an area and mode, separately from `f.isCurrentDestination`. The minified identifier ep is dated; the historical diagnosis of the same mechanism identified oB. The onSelect action and preview state are distinct. The observation concerns their comprehensibility in this workflow: an actual panel trigger, such as “Explorer” (Explore), must keep its expansion state.

### Destinations pinned from “Explorer”

The case also concerns **Sites and Images buttons pinned in the rail from “Explorer”**, recorded on October 5. These pins must be distinguished from destination buttons inside the “Explorer” panel: in the native panel examined on October 8, destinations do not have aria-expanded; the “Explorer” trigger legitimately has aria-haspopup=dialog and its open/closed state.

The four main destinations have a recognized data-sidebar-destination/data-slate-sidebar-peek-area pair. Pins can have a destination identifier without this preview attribute. The workaround must therefore recognize this second structure, instead of depending on a list of names Sites/Images. The [evidence](evidence/4B-destinations-settings-2026-10-08.json) distinguishes the current record of main destinations from dated pin observations.

### Comparison with settings

On the native Paramètres (Settings) page, **Général** (General) is a category button with aria-current=page **without aria-expanded**. The other examined categories do not have that state either. This comparison shows a method already used by the product to expose a destination and its current page without announcing expansion. It assumes neither an identical component nor a direct transfer of all settings logic to the rail.

### Illustration of the workaround and result

In [ui-accessibility.js](../../extension/ui-accessibility.js), navigationButton checks a destination button in the rail, excludes any actual popup or aria-controls, and accepts either a known preview pair or a destination without peek. normalizeRailNavigation removes only aria-expanded within this scope. Nodes, callbacks, navigation, aria-current, order, and display are preserved; dynamic additions/removals are covered, and unknown widgets remain native.

The main destinations and Sites/Images pins received positive feedback, qualified for the latter on October 5. The current DOM comparison in Chrome with the adaptation finds all four states removed and aria-current preserved; it does not redefine that JAWS user validation. Actual Projets, Épinglés, and Récents expansions and “Explorer”/Profil menus remain distinct.

## 4C — Redundant groups around chats

**Problem.** Group boundaries add two repetitive stops around each chat and its actions.

**Expected result.** Direct navigation through chats and controls in their lists, without redundant boundaries.

**Reproduction.** [Workflow 4C](reproductions/PROCEDURES.md#4c--conversation-groups).

On October 7, the user reconfirms the groups and workflow described in the initial support report. This concerns ordinary and pinned conversations **as well as those in an expanded project**. Each group adds two lines to navigate; the cost repeats during a search through the list. Authorized initial transcription, with chat names replaced:

```text
Début du groupe [Nom du chat]
[Nom du chat]
Actions du chat
Épingler le chat
Fin du groupe
Début du groupe [Nom du chat suivant]
[Nom du chat suivant]
```

The requested result preserves the list, links, and their actions, without Début/Fin du groupe (Start/End of group) stops around each chat. This record describes useful lines and labels; it does not add a spoken role to each line. The demonstrator's scope includes all three chat families.

The inspected rendering has a `listitem` row, followed by a `.sidebar-item` element with the `group` role, containing the conversation link and Actions du chat (Chat actions) button. The `group` role is actually native; removing it is not a repair for a missing HTML role. The described problem is the repetition and navigation cost in this workflow. It must not be inferred that all ARIA groups are unnecessary: a group of distinct controls, such as those in the “Explorer” panel, is outside this targeting.

The workaround removes only the role and naming references of the group identified by its row, a conversation link, and its actions button. The list, row, link, and button retain their identity and behavior. No element is moved or cloned. The [interface module](../../extension/ui-accessibility.js) preserves groups that do not match this structure.

Historical DOM/Chromium checks cover ordinary conversations, then project conversations. Overall user validation on October 4 accepts the proposed workflows, including ordinary and project chats; DOM findings and reading feedback retain their provenance. The Edge update of October 6 concerns subpoints 4A and 4B.

## 4D — Blockage on the first pass through projects and lists

**Problem.** On first access by Tab or project expansion, a switch to Forms Mode blocks the arrow keys in the JAWS feedback.

**Expected result.** Arrow-key navigation is available from the first pass, without requiring a manual exit.

**Reproduction.** [Workflow 4D](reproductions/PROCEDURES.md#4d--first-pass-through-a-list).

After initial user validation of project controls, the user reports that a first Space or Enter on an expansion produces a sound suggesting activation of Forms Mode, and the arrow keys stop navigating the page normally. Returning to the Virtual PC Cursor restores navigation; repetition in the same document generally does not reproduce the phenomenon. The user subsequently specifies that Tab alone is enough to trigger it in a list context, particularly Récents, even before project activation. Simply reading with the arrow keys does not cause this new phenomenon.

On October 7, the user reconfirms the perceived switch to Forms Mode, sound, and blockage when showing/hiding project chats and after Tab before or within Récents. Escape or the manual command to return to the Virtual PC Cursor restores the arrow keys. This current native feedback adds to the historical observations. The agent did not measure the internal JAWS state; correlation with these gestures does not demonstrate the cause of its internal decision.

Two local comparisons nevertheless isolated an external mechanism:

| Synthetic comparison | Only relevant difference | Physical feedback of October 4 |
|---|---|---|
| A/B links, without extension or movement | `role="list"` parent without tabindex for A, with `tabindex="-1"` for B | A normal; B reproduces sound and blockage on the first pass, then normal repetition without reloading. |
| C/D buttons, same activation and synthetic forwarding | Same tabindex difference on the parent list | C normal; D reproduces sound and blockage, then normal repetition. D's Alt+Tab return differs from the site's and remains a limitation. |

Parent focusability is causal **in these two reproductions**. Observed focus remains on the child link or button: hearing the list context does not mean the list itself received focus. This result does not read JAWS's internal decision and does not establish a universal ARIA violation.

The workaround handles recognized document containers and rows with exactly `tabindex="-1"` at rest. It keeps links and buttons focusable and preserves necessary native focus calls, particularly for pagination. See [the lists module](../../extension/sidebar-list-accessibility.js). Transforming the project name into static text and placing a separate expansion button are, separately, requested organizational choices; they visually move the chevron and must not be presented as an invisible correction imposed on everyone.

The Récents and project workflows are validated by the user; the October 4 supplement also covers nested chats, with overall user validation of ordinary navigation and expansion. The correction of simple and nested lists is validated by the user; this validation of the adaptation and the native reconfirmation of October 7 remain separate evidence.

## 4E — “Pin project” and “Unpin project” in a French interface

**Problem.** The gallery exposes Pin project/Unpin project in a French interface, while sidebar-menu actions are translated.

**Expected result.** Consistently localized Épingler/Désépingler le projet (Pin/Unpin the project).

**Reproduction.** [Workflow 4E](reproductions/PROCEDURES.md#4e--localization-of-project-pinning).

On October 7, the user reconfirms the missing translation in **the project gallery**, as in the initial report: `Pin project` / `Unpin project` are the targeted labels. In the sidebar, pinning is in **Actions du projet** (Project actions), a menu reached only by Tab and inaccessible with arrow keys/Navigation Quick Keys, like Nouveau chat (New chat). The gallery localization defect and sidebar-menu access defect are distinct. The sidebar menu was already French during the October 3 inspection; all project controls must not be presented as English.

The module replaces the exact names with “Épingler le projet” and “Désépingler le projet” within its French scope, without changing callbacks. Checks on the actual interface counted six “Épingler le projet” buttons and no `Pin project` after adaptation. The result establishes the exposed name; names and activation of each action are separate measurements. See [the projects module](../../extension/project-accessibility.js).

The adapted names are covered by overall user validation. Human reconfirmation of October 7 updates the native gallery observation of October 3. The passive Edge update of October 6 did not concern this gallery. The expected upstream correction is consistent localization of names in every location offering the same action.

## Request to the ChatGPT teams

Examine semantics rendered on loading, on first focus, and after updates: recognizable role, localized movement information, collapsed/expanded state reserved for the corresponding control, useful groups, and consistent names between gallery and sidebar. For the first pass through lists, reproduce the two comparisons, then compare the actual rendering with their conditions, without assuming the screen reader's internal cause.

The extension serves as a local workaround and a demonstration of targeted changes. Corrections to names, descriptions, and groups can preserve the display; rearrangement of project controls is a separate preference with a visual effect. The dossier demonstrates neither a service correction nor a guarantee for all screen readers.
