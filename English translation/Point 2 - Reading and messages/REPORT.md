# Point 2 — Reading, selection and message controls

This Point covers reading and message controls: continuity of long conversations, reasoning markers, selection, copy/share confirmations, generated fields, headings and Web references. Requests concerning organization and metadata inclusion are distinguished from accessibility barriers.

The [conditions and versions](../ENVIRONMENT.md) are shared. The [site procedures](reproductions/PROCEDURES.md), [native evidence and JAWS feedback](evidence/native-user-validation-2026-10-07.json), [native mechanisms](evidence/native-mechanisms.md) and [isolated tests](reproductions/RUNNING_TESTS.md) accompany the subpoints. The supplied demonstrator is **4.1.2**; evidence retains its date and distinguishes DOM/AX results from JAWS feedback.

## 2A — Navigating a long conversation without losing messages

**Problem.** Reading jumps and unmounted turns interrupt arrow-key navigation through a long conversation.

**Expected result.** Read and select loaded turns continuously, even outside the visible area.

**Reproduction.** [Workflow 2A](reproductions/PROCEDURES.md#2a--reading-a-long-conversation).

**Difficulty reported and confirmed on October 7.** Reading a long conversation with the arrow keys produces jumps both up and down, particularly when navigating from bottom to top. No precise length threshold is claimed. Messages far from the visible area may disappear from the rendered document; navigation and a selection spanning them then lose their position or content. Preserving an empty space with the message's height does not make its text available to the Virtual PC Cursor.

**Observed mechanism.** The inspected interface generation uses a virtualizer that calculates the range of turns to render according to scrolling. A historical technical observation from September 30 counted 126 conversation entries, five initially mounted. The internal `retainedTurnKeys` parameter allowed entries outside the range to be retained: testing this parameter rendered all 126 entries with their nodes preserved after scrolling in both directions. This observation describes that specific load; it does not count every conversation or retrieve messages absent from the server.

**Local adaptation.** [keep-modern-turns.js](../../extension/keep-modern-turns.js) retains already available turns through this rendering contract, without cloning their nodes. [keep-turns.js](../../extension/keep-turns.js) separately covers the legacy generation based on intersections. The extension does not disable every observer on the page or substitute replacement messages.

**Additional observation on October 7.** The native component retains the retention contract described above. In the visible view examined without local retention applied, 6 rows are mounted for 17 available entries. The workaround then renders 27 entries/27 rows in the technical trial, with the seven initial nodes still connected on returning to the bottom. The user positively validates navigation up and down with the adaptation tested at that time: « d'après mon test, c'est OK. » The [dated evidence](evidence/2A-virtualization-2026-10-07.json) specifies the conditions and distinguishes DOM counts from user validation. These results support the mechanism already reported; they are not an additional native defect.

**User validation and limit.** Two historical comments are retained with their dates: September 17 at 21:39:32 Brussels time, « d’après mes tests, la navigation et la sélection dans la page fonctionnent »; September 30 at 20:53:56, « Je confirme qu’à priori, l’ajustement semble fonctionner ». The conversation navigation proposed in the overall October 4 user validation is subsequently accepted for points without reservations. October 7 adds user validation of navigation up and down. This establishes reading and stability in the reported use. DOM presence and node identity are technically verified; they are not an exact comparison between an entire long conversation and its content copied to the Windows clipboard. The site's internal contract may evolve.

**Desired product outcome.** Allow continuous reading and extended selection of loaded turns with a screen reader, even when visual rendering optimizes off-screen messages. Check navigation up, down and between conversations without inferring text access solely from the height of its placeholders.

## 2B — Locating the response and navigating reasoning

**Problem.** With GPT-5.6, the « ChatGPT a dit » heading is missing at the start of reasoning. GPT-6 has a « ChatGPT a dit » heading from the start of reasoning. In both models, the current activity precedes completed details and its caption can be read twice.

**Expected result.** An « ChatGPT a dit » heading from the start with GPT-5.6 and preservation of the native heading with GPT-6; completed steps followed by the current activity in both models, an explicit control, and the final duration without duplication.

**Reproduction.** [Workflow 2B](reproductions/PROCEDURES.md#2b--markers-and-reasoning-order).

### Native observations: two reasoning renderings

**GPT-5.6 Sol.** The « ChatGPT a dit » heading appears only after reasoning has finished and then remains normally present once the response has been added to the chat. The native comparison on October 7 documents this distinction between ongoing reasoning and the response added to the chat. The ongoing activity is above the marker in JAWS navigation; completed details follow the marker in the correct order.

**GPT‑6 with High reasoning.** The « ChatGPT a dit » heading is present from the start of reasoning. Completed generations also contain several intermediate comments with « ChatGPT a dit » headings. The remaining issue is reading order: the current activity stays before completed steps in JAWS navigation. The user specifies High as the level; counts and phases are separate structural observations.

The main evidence is the [contract of a completed turn on October 7](evidence/2026-10-07-reasoning-contract-gpt6.json), the [regions and headings observed on October 8](evidence/2026-10-08-reasoning-regions.json), and the [active-then-completed trace excerpt](evidence/2B-completed-generations-gpt6-2026-10-08.json). Native properties show completed=true and a final response started; the trace also shows a region transitioning from activity to completion. The first [GPT‑6/GPT‑5.6 comparison](evidence/2B-reasoning-heading-gpt6-gpt56-2026-10-07.json) retains only its historical scope, particularly the GPT‑5.6 timeline.

**Caption and control.** The activity or « Réfléchi pendant [durée] » is announced by the button, then repeated on the next line without a particular role, according to JAWS feedback. This exact duplication is distinct from legitimate comment headings. During activity, « bouton réduit/étendu » alone does not clearly communicate Show/Hide details.

**Standalone cards.** The documented example contains 43 native Python cards, siblings of the reasoning group and independent of its collapse state. Their presence increases the number of reading stops. This specific rendering is distinguished from ordinary textual details and GPT‑6 regions.

### Measurements and user validation

**Historical measurements.** The October 3 captures are sampled: a first window contains 78 frames, 73 with an active action; a second contains 138 frames of the new turn, 32 with a fixed name and no reference conflict. An end-of-generation inspection records a completed caption, no Stop control, and no remaining active name. These observations are neither continuous observation of every transition nor a capture of JAWS speech.

The October 3–4 examinations confirm exposure/hiding of the same 43 cards and actual keyboard expansion. Other inspected reasoning contains ordinary text, without an individual expansion control: the absence of a button in these renderings does not prove the general removal of a historical feature. The adaptation does not add false buttons to every paragraph.

**User validation.** On October 4, points without reservations in the overall validation are accepted. The user also accepts analysis grouping unless a contrary observation arises, specifying that reproducing new cases is difficult and that the examined case seemed to work. This reproducibility limit remains: grouping is a local organization validated in the observed case, not a universal requirement demonstrated for all reasoning.


**Provenance of the additional observation.** JAWS feedback on October 7 around 23:20 Brussels time (Europe/Brussels, UTC+02:00) specifies the activity order and repetition described in the native observations above. Distinct comment headings remain outside this duplication.

### Native code and illustration of the workaround

**Two native contracts.** The inspected GPT-5.6 group exposes, among other properties, `summary`, `shouldAnimateInitialCollapse` and, during activity, `defaultExpanded`. The GPT-6 regional component exposes `region`, `completed`, `reasoningRecap`, `activeSummary`, `canExpand`, `hasStandaloneItems` and `hideHeader`. The [additional structural observation on October 8](evidence/2026-10-08-reasoning-regions.json) finds successive « ChatGPT a dit » headings in intermediate comments. These distinct headings are not treated as duplicates of the activity or duration caption. The `prefix` and `suffix` regions have their own phase: an assistant comment already started elsewhere in the turn does not mean their activity has finished. The caption referenced by the button remains a separately exposed element in the inspected rendering. See [the native contract and its code excerpt](evidence/2026-10-07-reasoning-contract-gpt6.json) and [the mechanism analysis](evidence/native-mechanisms.md#2b--markers-native-state-and-the-43-card-branch).

**Illustration in demonstrator 4.1.2.** [analysis-details-accessibility.js](../../extension/analysis-details-accessibility.js) provides a group control for recognized standalone cards, preserving their « Analysé » buttons and content. The [reasoning module](../../extension/reasoning-accessibility.js) distinguishes these contracts and tracks the local phase of the recognized group. It also recognizes the region from its initial activities, without requiring a first reasoning-type item to be present already. A direct group whose properties arrive late is re-examined when its descendants mutate, without reading their bodies. It places a summary of the current status at the end of expanded details, supplies an explicit action name during reasoning, then restores the button's native name and duration after completion. The repeated caption remains visible but is excluded from a second separate reading. The missing initial heading concerns GPT-5.6; GPT-6 retains its native initial heading. Placing the current activity after completed steps applies to both renderings. Native reasoning bodies, elements and callbacks are preserved. This demonstration illustrates accessible continuity without prescribing an implementation to the teams. The [module's 60 tests](reproductions/reasoning-accessibility.test.cjs) and [15 regional Chromium checks](evidence/2026-10-08-reasoning-regions.json) verify mechanisms; the [October 8 user feedback](../Point%201%20-%20Model%20selector%20and%20composer/evidence/2026-10-08-adapted-user-validation.json) positively validates the requested adapted regional navigation. Native feedback and technical checks retain their provenance. The [4.1.2 confirmation](../Point%201%20-%20Model%20selector%20and%20composer/evidence/2026-10-08-confirmation-4.1.2.json) preserves this result and validates the final prefix.

## 2C — Extended selection and accompanying information

**Problem.** A reading jump interrupts extended selection; some visible metadata is separately absent from the copy.

**Expected result.** Stable accessible selection; separate examination of including speakers, durations and timestamps as a product request.

**Reproduction.** [Workflow 2C](reproductions/PROCEDURES.md#2c--selecting-and-copying-several-messages).

**Distinction confirmed on October 7.** Native selection works as long as a position jump does not interrupt it. The accessibility defect concerns these jumps, retention of messages in the document, keyboard reading, and copying long passages. The user separately observes that native copying includes neither **« Vous avez dit »**, nor **« ChatGPT a dit »**, nor the reasoning duration, nor dates/times. Their inclusion remains a **product request**, useful for identifying the speaker and timestamps, not an accessibility defect established in itself. The historical October 4 feedback in which « ChatGPT a dit » was copied concerns the adapted workflow and retains its context.

**Technical findings.** In the inspected rendering, user speaker headings and visible dates have `user-select: none`. This mechanism is distinct from the virtualization in Point 2A. [page-selection.js](../../extension/page-selection.js) and [reasoning-selection.css](../../extension/reasoning-selection.css) make the targeted text selectable, including both speakers and displayed dates, without revealing collapsed panels or changing editors. Dates are neither recalculated nor added.

A small synthetic selection in Chrome includes both speakers, a date/time and navigation text, without duplication. Browser-session copying preserves these elements. On October 4, this small selection/copy is then validated among the accepted points of the adaptation tested at that time. This does not prove complete copying of every long conversation under Windows/JAWS.

**Native comparison on October 6, 2026, at 23:48 Brussels time.** In Edge, without the extension according to the user's statement and with no adaptation marker recorded, the interface is in `fr-FR`. A mouse selection of two response paragraphs produces 607 characters; Ctrl+C provides 606 characters in the browser-session channel. Exact equality is false, but equality after whitespace normalization is true. Edge reports 154.0.4258.62 and Chromium 154.0.8037.98.

**What this comparison establishes.** Manual native selection spanning multiple paragraphs and a corresponding copy exist in the tested rendering without the extension. It would therefore be inaccurate to claim that all native selection is impossible. The measurement validates neither JAWS cursor gestures under Windows, nor large-scale global selection, nor the presence of all requested metadata. It does not reveal an intended OpenAI selection policy: it limits the problem to the accessible workflow and extent actually verified.

**Desired outcome.** Ensure stability of turns and selection through assistive technology controls. Separately examine the request to include already exposed speakers, durations and timestamps in copying. Distinguish rendered text, selection, copied formats and the clipboard as read back, without assuming that a product exclusion of metadata is an accessibility defect.

## 2D — Understanding Copy and Share success without losing position

**Problem.** Copy and Share do not provide reliable audible confirmation and may move the reading position; control unavailability is inconsistently exposed.

**Expected result.** Confirmation after success, preserved position, and understandable unavailability while waiting.

**Reproduction.** [Workflow 2D](reproductions/PROCEDURES.md#2d--copy-and-share).

### Sharing the conversation

On October 7, the user rechecks and confirms the unchanged native defect: **sharing the conversation returns to the top of the page, without a JAWS confirmation announcement**. Both confirmation sentences were present in the native notification inspected on October 5: « Le lien public a été copié. » and « Toute personne disposant du lien peut consulter cette conversation. » The button is temporarily disabled natively; DOM focus falls to `BODY` and is not subsequently restored to the button.

The extension's first delayed focus return was insufficient: the user still experienced the initial jump before focus was recalled. The variant keeping the button focusable while waiting, with unavailability exposed and a second activation prevented, is user-validated on October 5: the button seems to work as expected. [feedback-actions.js](../../extension/feedback-actions.js) uses the native sentences after confirmation and preserves position. DOM focus retention and JAWS user validation were checked separately.

### Copying a message

The site gives the button the temporary name « Copié » after success. No separate native « Message copié » notification was found in the inspected path. **The separate « Message copié » announcement is added by the extension**, based on the native success signal; it is not presented as revealing a hidden native sentence.

On October 7, the native defect is again confirmed: **no copy announcement and a jump to « Partager » for responses**. Historical feedback described Copy being absent from JAWS navigation for one to two seconds. For sent messages, JAWS repeated « Copier le message », sometimes at the expense of confirmation. Yet DOM traces kept the button connected and focused: they do not, by themselves, explain JAWS cursor position. Adapted user validations from October 5 remain established.

The site exposes `aria-busy` and `aria-disabled` while waiting for response copying, unlike sent messages. After success, the rendered callback is temporarily removed in both families: about two seconds for responses and one and a half seconds for sent messages. Isolated trials of a stable name followed by a decorative icon were insufficient to resolve the physical symptoms.

Targeted handling of the busy state on responses preserves their actual unavailability and makes the button navigable again in the October 5 user validation, without a reading jump. The confirmation delay of **500 ms after native success** is user-validated for both families. Sent-message unavailability is then locally exposed while their action is actually suspended, without HTML disabling that would lose focus; this indication and its return to normal are also validated.

**Attribution.** Lack of audible confirmation, the transient absence of Copy in reported navigation, and unexposed functional unavailability are distinct facts. The added notification and chosen delay are local adaptations; busy-state handling is a compatibility measure validated in the tested combination, without evidence of an internal JAWS defect.

## 2E — Inactive Writing Block handles

**Problem.** Invisible, inactive Writing Block handles remain navigable as buttons without informative names.

**Expected result.** Exclude inactive controls from navigation while preserving active, named controls.

**Reproduction.** [Workflow 2E](reproductions/PROCEDURES.md#2e--writing-block-handles).

On October 7, the user confirms the unchanged native Writing Blocks problem. The reproduction is to request reusable, copyable text, wait until generation has completely finished, then go to the very bottom of the page: the unnecessary buttons remain there, without a clearly identifiable function. The historical observation counts four buttons in pairs, corresponding to table row/column handles. Their only text is « ⋮⋮ »; visually invisible (`opacity: 0`) and unusable with the mouse (`pointer-events: none`), they remain accessible as buttons. The recent user feedback does not include a new technical count of these nodes.

Two problems must be distinguished: exposure of currently inactive controls and absence of an informative name. Native code associates them with row or column add/delete menus when a table is targeted.

[writing-block-accessibility.js](../../extension/writing-block-accessibility.js) excludes only these handles when they are invisible and inactive. Nodes, fields, Copy controls and callbacks are preserved. A handle that actually becomes active/visible regains its native state; the adaptation does not artificially label active controls.

Sixteen Chromium checks verify, among other things, the transition from four accessible buttons to zero, their omission from Tab navigation, intact editing/copying, and reversibility. Removal of inactive handles and preservation of the field/Copy are user-validated in the October 4 feedback at 21:15. No exhaustive speech test or test of every active table is inferred.

## 2F — Redundant « Dernière réponse » marker

**Problem.** The « Dernière réponse » heading adds a redundant stop in heading navigation.

**Expected result.** Preserve useful markers without this additional stop; a request to simplify navigation.

**Reproduction.** [Workflow 2F](reproductions/PROCEDURES.md#2f---derni%C3%A8re-r%C3%A9ponse--heading).

On October 7, the user confirms the persistent native presence of **« Dernière réponse »**. This `h4` heading, outside the message, adds a navigation stop that the user wishes to remove while retaining message headings. [ui-accessibility.js](../../extension/ui-accessibility.js) excludes only this exact marker from navigation and focus; useful content headings are preserved.

Its removal is among the points accepted without reservations during the overall October 4 user validation. This is a requested navigation simplification; the mere presence of an additional heading does not, by itself, demonstrate a universal design violation.

## 2G — Web references and source preview content

**Problem.** Web navigation references are announced as menu buttons; their cards obscure available information behind an abbreviated name and an extraneous favicon.

**Expected result.** Identifiable links, a named preview, and readable available content without an extraneous image address.

**Reproduction.** [Workflow 2G](reproductions/PROCEDURES.md#2g--references-and-source-previews).

### Native observations and mechanism

**Observed difficulties.** In GPT-6 responses, JAWS announces references as **« Bouton de menu réduit dialogue »**, although activating them opens an Internet page. The [native inspection on October 8, 2026](evidence/2026-10-08-native-sources.json), Brussels time (Europe/Brussels, UTC+02:00), confirms a `popover-trigger` component `span` with button role, `tabindex="0"`, `aria-haspopup="dialog"` and `aria-expanded`, without `href`. Grouped references add a count to the source name. Activating a single-source reference opens a page on `codex-reset.com`; activating a grouped reference opens a page on `www.sotwe.com`. These activations also open a preview containing one and two cards respectively. Web navigation is thus the observed action, with a secondary preview, but the exposed role prevents the reference from being found as a link.

**Card content and name.** The panel is a non-modal dialog appended through a portal to the end of the document; it contains interactive cards and is not a simple tooltip. Focusing the reference opens the preview without navigation. In the examined rendering, Tab enters its card and Escape closes the panel, restoring focus to the reference. Each card uses a `pressable` button named `Open [source]`, even in the French interface. Yet its title and available text are present in the DOM and in non-ignored StaticText nodes in the accessibility tree. The `aria-label` abbreviates the control name to the source rather than its content. The abbreviated control name thus obscures its available information in the described navigation.

Reduced native structural excerpt; private identifiers and content omitted:

```html
<span data-d-component="popover-trigger" role="button" tabindex="0"
      aria-haspopup="dialog" aria-expanded="false">…source…</span>
<div role="dialog" id="…">
  <button data-d-component="pressable" type="button"
          aria-label="Open [source]">…source, titre et texte…</button>
</div>
```

The native keyboard handler converts Enter/Space into control activation. The preview component supplies button/dialog properties, while the configured action opens the destination. [WAI-ARIA links](https://www.w3.org/WAI/ARIA/apg/patterns/link/) represent this navigation; [naming rules](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) explain the priority of an explicit name over link or button content. The [tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) distinguishes information without a focusable control from interactive non-modal panels.

[W3C explains empty alternative text for decorative images](https://www.w3.org/WAI/tutorials/images/decorative/): an image accompanying a text link without additional information should be ignorable; without an alt attribute, some readers announce its filename. This rule corresponds to the favicon address actually reported by JAWS.

### Illustration in demonstrator 4.1.2

**Targeted illustration.** In 4.1.2, [source-links-accessibility.js](../../extension/source-links-accessibility.js) exposes references and their cards as links on existing hosts, preserving callbacks, keyboard handling and preview. For recognized non-empty cards, it removes the abbreviated name: the accessible name comes from existing visible content. A source dialog without a native name receives « Aperçu des sources : [source] »; an existing native name is preserved. The guard requires, among other things, an inline citation with a badge/favicon and native callbacks, a dialog connected by `aria-controls` with a unique ID, and no nested interactive control. A favicon without a meaningful alternative in a recognized reference or card receives empty alt: its address should not be announced, and the image adds no information to the adjacent name. Meaningful native alternatives, thumbnails and DOM writes made by other code are preserved. Other buttons and panels are excluded. Attributes are restored on stopping, changing to a language other than French, or if the contract ceases to match. No title, excerpt or article body is invented, copied or moved.

### Measurements, relevant timeline and user-validated result

**First name output.** After an initial adaptation of the role and prefix, JAWS feedback reports only « Ouvrir [nom du lien hypertexte] » at the bottom of navigation. This intermediate feedback does not describe the current output; it establishes that information present in DOM/AX did not become usefully readable through this adaptation alone.

**Intermediate stage: favicon and presentation.** The [JAWS feedback and image structure](evidence/2026-10-08-jaws-preview-feedback-4.1.0.json) record « lien graphique » and « S2/favicons », followed by concatenated text and a repeated source. The favicon is an image without an `alt` attribute; its parent's presentation role does not give it empty alternative text. Its address is not part of the card's visible text. Visual verification shows three lines: source, title and « Total lines: 277 ». This metadata is actually displayed by the site. Line breaks in copied text and the announcement of a single link control are two different presentations; visual layout does not guarantee line-by-line reading. The preview must provide its content without an extraneous image address or misleading repetition.

The [name and content evidence](evidence/2026-10-08-source-preview-content.json) records, after adaptation, the link **« Codex Reset Codex Radar: Reset, Limits & Service Signals Total lines: 277 »** and the dialog **« Aperçu des sources : Codex Reset »**. The text « Total lines: 277 » is what this card supplies; it is not the full article text. Enter preserves the Web destination and Escape preserves the return to the trigger. [Eighteen Node tests and the source fixture](reproductions/RUNNING_TESTS.md#checking-source-references-and-cards--2g) cover guards and restoration; [nine stabilized Chromium states](evidence/2026-10-08-favicon-checks.json) pass without failure. Computed names and technical invariants are distinguished from JAWS feedback.

**Current user validation.** The [October 8 user feedback](../Point%201%20-%20Model%20selector%20and%20composer/evidence/2026-10-08-adapted-user-validation.json) positively validates the targeted selector, preview and reasoning workflows in 4.1.1; the [final prefix is confirmed in 4.1.2](../Point%201%20-%20Model%20selector%20and%20composer/evidence/2026-10-08-confirmation-4.1.2.json). Older captures retain their result at the time they were produced.

**Expected result.** A navigation reference must be identifiable as a link, with an accessible, named secondary preview. The card must allow its available information to be read without replacing it with a single abbreviated name, in a presentation consistent with the interface language. An HTML link with its destination would also provide ordinary browser features; this ARIA demonstrator preserves the implemented navigation without inventing an `href` or prescribing a solution to the teams.

## Scope of the report

These specific cases can serve as checks for future interfaces: reading continuity, control names/stability, functional availability, updated announcements, exposure of inactive controls, and reading references with their accessible previews. They do not validate every account, browser, screen reader or future rendering.

Adapted workflows remain validated on the stated dates. Navigation up and down is also user-validated on October 7. Native feedback from October 7 confirms barriers involving long-conversation reading, copying, sharing and Writing Blocks, as well as the presence of Dernière réponse. The GPT-6/GPT-5.6 comparison establishes the heading and current-state behaviors described in 2B; the corresponding adaptations are retained.

Findings and measurements describe the renderings examined on the stated dates. Internal contracts may evolve.
