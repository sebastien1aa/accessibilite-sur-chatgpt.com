# Point 3 — Navigation and focus return on chatgpt.com

This Point addresses access to controls and reading resumption: project actions, sidebar, Afficher plus (Show more), menus and panels, “Explorer” (Explore), sharing/editing, and rating a response. Correct DOM focus and correct resumption of the Virtual PC Cursor are two distinct results.

The [conditions and versions](../ENVIRONMENT.md) are shared. The [site procedures](reproductions/PROCEDURES.md), [observations and user validation](evidence/OBSERVATIONS_AND_USER_VALIDATION.md), and [isolated tests](reproductions/RUNNING_TESTS.md) accompany the subpoints. The described adaptations are retained in demonstrator **4.1.2**.

## 3A — Project controls accessible with arrow keys

**Problem.** A project's Actions and Nouveau chat (New chat) are reached with Tab, but not through arrow-key navigation.

**Expected result.** Controls accessible and activatable from the usual page-reading workflow.

**Reproduction.** [Workflow 3A](reproductions/PROCEDURES.md#3a--project-controls).

### Observations and native structure

Native feedback of October 7 confirms that **a project's Actions and Nouveau chat remain accessible only with Tab and inaccessible through arrow-key navigation or JAWS Navigation Quick Keys**. The user confirms that Tab reaches them with the extension disabled as well. These controls therefore appear inaccessible in the user's usual reading workflow. The expectation is to make them accessible through that workflow too, without requiring Tab, since many users navigate with arrow keys without necessarily using Tab.

The October 3 record shows a project row with button role and tabindex=0, containing a first DIV with the name and chevron, followed by native controls. Actions has an HTML button with aria-haspopup=menu, not ignored in the accessibility tree. The menu contains Page d’accueil du projet (Project home page). This native control was found; its actual navigation was checked separately in a diagnostic tab.

### Adaptation and user validation

[project-accessibility.js](../../extension/project-accessibility.js) separates the document control from native controls and preserves their handlers and nodes; [sidebar-list-accessibility.js](../../extension/sidebar-list-accessibility.js) handles recognized list structures separately. On October 4, the workflow — arrow keys/Navigation Quick Keys to Actions, then Nouveau chat, opening Actions with Space, presence of Page d’accueil du projet, closing with Escape — receives a qualified positive response. It establishes neither activation of Nouveau chat nor user navigation to the home page.

The later organization, “static name, native actions, separate Afficher/Masquer les chats du projet (Show/Hide project chats) button,” is an **explicitly requested preference**, with visual relocation of the chevron. It must not become a universal organizational requirement. Project and simple/nested-list navigation are accepted overall on October 4.

### Separate difficulty on first focus

Blocked arrow keys after Tab or project expansion are addressed separately in [4D](../Point%204%20-%20Semantics%20and%20localization/REPORT.md#4d--blockage-on-the-first-pass-through-projects-and-lists), with physical comparisons of focusable lists. The control access described here and this mode change are two separate obstacles.

## 3B — Reopening the sidebar and a stable control

**Problem.** The hidden sidebar provides no accessible reopening control in the tested JAWS workflows.

**Expected result.** The sidebar can be reopened using the keyboard, with continuity of the navigation position when toggling it.

**Reproduction.** [Workflow 3B](reproductions/PROCEDURES.md#3b--reopening-the-sidebar).

### Native observation

On October 7, the user confirms that the control for showing the hidden sidebar is **inaccessible with both arrow keys and Tab**, as during the initial investigations. In the rail examined on October 3, no available control allowed reopening it. A collapsed → open → collapsed cycle was checked with the native Ctrl+Shift+S shortcut. In the October 4 observations, the native control changes location between open and closed sidebar states, becomes inert on closure, and can leave focus on BODY.

The functional expectation is to be able to reopen the sidebar and retain a navigation position after toggling. The precise placement of a stable control after Profil (Profile) is a **secondary organizational choice** requested by the user.

### Adaptation and user validation

In [ui-accessibility.js](../../extension/ui-accessibility.js), a persistent control forwards to native mechanisms. User validation is positive on October 4. The control preserves its identity and forwards native opening/closing; its precise location is an organizational choice.

## 3C — Afficher plus for a project's chats

**Problem.** Afficher plus resumes at the beginning of the project's chats instead of continuing near added items.

**Expected result.** Reading continues at the first new chat.

**Reproduction.** [Workflow 3C](reproductions/PROCEDURES.md#3c--afficher-plus-for-a-projects-chats).

On October 7, the user reconfirms that Afficher plus returns focus to the beginning of the project's chats instead of allowing reading to resume just before the first new chat. On October 4, the user also reported sound and blocked arrow keys. In the rendering examined then, five chats become six; the button is removed during loading, and the site focuses a DIV role=list tabindex=-1. This container remains focused after completion, while the last previous Actions control is still connected and visible.

The observed public list-component code queues a microtask, then chooses the footer button or the list. This native target explains movement to the list; it does not read the screen reader's internal decision.

[sidebar-list-accessibility.js](../../extension/sidebar-list-accessibility.js) keeps a position near the footer, then reaches the first new link, a new pagination button, or the last previous control, depending on the result. Intentional focus/navigation changes cancel its tracking. It preserves the native loading action. **Pagination validated by the user on October 4.** Expected upstream result: continue near new items without jumping to the beginning or losing the reading workflow.

## 3D — Return after Escape in menus and panels

**Problem.** Closing menus and panels can make reading resume at the top of the page; the number of Escape presses varies with family and initial mode.

**Expected result.** Resumption at the trigger after actual closure, distinguishing a mode change from closure.

**Reproduction.** [Workflow 3D](reproductions/PROCEDURES.md#3d--closing-menus-and-panels).

### Symptom and families

Closing a menu without choosing an action returns the JAWS reading position to the top. On October 7, the user specifies that **Profil and chat Actions menus require two Escape presses**, while a single press closes **Filtrer (Filter), Options de la barre latérale du projet (Project sidebar options), and Options de la barre latérale du chat (Chat sidebar options)**. These families must remain distinct: neither the number of presses nor the cause is generalized. Project menus, settings, and other panels associated with a trigger also appear in historical observations, without a newly established number of presses for each. The user reproduces the problem without the extension; Chrome notably observed BODY after Profil/chat closure. This targeted observation does not prove the same DOM path for all families.

The user connects the two Escape presses with the inappropriate switch to Forms Mode observed in lists. This is a human correlation, not demonstrated internal JAWS causation. The user also observes replacement of link/button announcements for the chat whose Actions has just been activated; this context complements [Point 4A](../Point%204%20-%20Semantics%20and%20localization/REPORT.md#4a--sortable-and-draggable-instead-of-informative-roles).

### DOM focus and virtual position

Later traces give a more precise result: the original button regains DOM focus and retains it until 500 ms, but JAWS can resume at the top. A repeated Profil trial succeeds without a change. No aria-hidden or inert masking was found in that last workflow. Attribution of the virtual desynchronization remains open between content, browser, and screen reader; no delay constitutes a measurement of JAWS processing completion.

### Illustration of the workaround and user validation

Returning in the microtask that detects panel removal obtains positive user validation on Profil, then on menus on October 4. “Explorer” subsequently receives its separate adaptation, described in 3E. [sidebar-menu-focus.js](../../extension/sidebar-menu-focus.js) preserves Escape closure, association with the precise button, and user intentions. The expectation is to recover this button and the corresponding reading position, without cancelling a concurrent intentional move.

## 3E — “Explorer”: entry, closure, and popup property

**Problem.** “Explorer” has a different entry target depending on the gesture; after Escape, an arrow key can reopen the panel instead of continuing reading.

**Expected result.** Consistent entry and exit, resumption at the trigger, and intentional opening with an arrow key preserved.

**Reproduction.** [Workflow 3E](reproductions/PROCEDURES.md#3e--explorer-explore).

“Explorer” is a nonmodal role=dialog popover with destination groups and pinning controls. **aria-haspopup=dialog is valid for this panel**. The groups and lack of modality are not, by themselves, a demonstrated cause of a defect.

Observations of October 4–5 distinguish initial entry through ordinary activation, which focuses the container, from opening with an arrow key, which focuses a destination. In the traces, a first Escape received by the DOM actually closes the panel; a subsequent Down Arrow can **reopen it natively**. This is not always two Escape presses required by the site for a single closure, or a vanished panel that JAWS merely continues reading.

[explorer-accessibility.js](../../extension/explorer-accessibility.js) aligns ordinary entry with the first destination; this workflow is validated by the user on a freshly loaded page. Navigation bounded to the panel is considered expected; intentional opening with an arrow key remains preserved. A physical comparison shows that returning DOM focus alone does not suffice to ensure reading resumption.

For this recognized trigger, [sidebar-menu-focus.js](../../extension/sidebar-menu-focus.js) removes the popup property just before returning focus, then restores it on the next relevant opening/interaction. The button role, aria-expanded, callbacks, and arrow keys remain native. This adaptation receives a qualified positive result; **its integrated distribution is validated by the user on October 5**, including after user unpinning. This compatibility adaptation does not prove that the valid native attribute was wrong, or which internal JAWS decision caused the phenomenon.

## 3F — Cancelling sharing or editing: returning to the same message

**Problem.** Cancelling Partager (Share) or Modifier (Edit) on a message makes reading resume at the top of the page.

**Expected result.** Return to the same message's button after actual closure.

**Reproduction.** [Workflow 3F](reproductions/PROCEDURES.md#3f--cancelling-sharing-or-editing).

Native feedback of October 7 reconfirms returns to the top of the page after Partager, Actions, Modifier, and the other chat buttons described before the local adaptations. On October 5, after cancelling Partager below a response, Partager le prompt envoyé (Share the sent prompt), or Modifier le message (Edit the message), the user was already finding reading at the top. Before the new module, native closure was measured as moving to BODY. Message sharing does not always have the ARIA association used for menus; editing replaces the button with an inline form, then recreates a button.

The [message-action-focus.js](../../extension/message-action-focus.js) module associates activation with a newly opened surface and returns to the **same message's** button after actual closure. Sharing returns to the original button; editing can return to its unique recreated button in the same message object.

**All three returns are validated by the user on October 5**, with a qualified overall positive response. The conditions of these returns and the scope of the supplementary trace are detailed in the evidence.

### Editing: distinguishing mode and closure

With focus in the field, JAWS is initially in Forms Mode. A first Escape can return to the Virtual PC Cursor and leave editing open; the second closes it. **The native jump concerns actual closure.** If the Virtual PC Cursor is already active, a single Escape closes editing. DOM transmission of the first mode-change press was not established and is not assumed. The extension does not consume Escape and does not change JAWS modes.

## 3G — Rating the response: menu role and resumption after Escape

**Problem.** Évaluer la réponse (Rate the response) is announced as an ordinary button; after Escape, reading resumes at the top of the page.

**Expected result.** Menu function exposed on the button, and resumption at the same message.

**Reproduction.** [Workflow 3G](reproductions/PROCEDURES.md#3g--%C3%A9valuer-la-r%C3%A9ponse).

On October 7, the user no longer finds “Réagir” (React): the current control is **“Évaluer la réponse”**, announced as **“bouton” (button)** although it opens a menu. **One Escape closes this menu, then reading resumes at the top of the page.** The expectation is to announce its menu function and recover the same message's control on closure. The structural record below specifies native semantics; the demonstrator provides a targeted adaptation.

The studied control is “Évaluer la réponse”; other menu families retain their own observations.

The [native record](evidence/3G-native-rating-menu-2026-10-07.json) confirms that the menu properties `aria-haspopup` and `aria-expanded` are on a SPAN surrounding the button; the button itself does not have them. The native menu contains Bonne réponse (Good response) and Mauvaise réponse (Bad response). In the inspection, Escape closes the menu, then returns DOM focus to the button; user feedback describes resumption of the reading cursor at the top. These positions are distinct. The [WAI-ARIA pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) places menu semantics on the button control.

The [evaluation-menu-accessibility.js](../../extension/evaluation-menu-accessibility.js) module transfers native properties to the existing button and checks its relationship to the menu. It preserves its children and callbacks and does not consume Escape. The association allows the existing return controller to intervene, with a guard on message identity. The [local fixture](reproductions/evaluation-menu.html) checks these invariants and their restoration.

Mechanism validation includes 35 Node tests of these semantics, 36 of the return controller, and 11 Chromium fixture checks. It covers ambiguous relationships, unrelated attributes, restoration on shutdown, and recycling a turn to another message, among other cases. These results establish the workaround's DOM operation; they do not constitute a measurement of JAWS speech or cursor position.

The [passive record of the adapted button](evidence/3G-adapted-rating-menu-2026-10-07.json), on October 7, confirms `aria-haspopup=menu` and `aria-expanded=false` on all nine Évaluer buttons present. The targeted accessible node retains its name and exposes `hasPopup=menu`, with its closed state. This inspection confirms the adapted structure without measuring JAWS speech or causing menu opening or closure.

## Request for investigation

Examine opening/closing paths and continuity of the reading position, comparing native behavior with targeted adaptations. Synthetic reproductions isolate certain conditions; site trials must also check accessible-event order and the actual screen-reader workflow. Preserve native controls, intentional openings with arrow keys, pagination, and intended focus changes.

The investigation concerns the native obstacles and interoperability mechanisms described. Adapted workflows validated by the user retain their scope; DOM focus alone does not establish the JAWS reading position.
