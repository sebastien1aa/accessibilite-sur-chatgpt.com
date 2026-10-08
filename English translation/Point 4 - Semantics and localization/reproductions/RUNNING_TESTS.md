# Tests and fixtures — Point 4

These pages use synthetic names and routes. They do not contact ChatGPT and contain no real account or conversation. The A/B and C/D comparisons received the physical user feedback of October 4 described below. The third page's DOM checks separately verify the adaptation's invariants.

## Subpoint coverage

| Case | Reproduction and evidence | Demonstrator mechanism |
|---|---|---|
| 4A | Sections/chats procedure after Tab or Actions; synthetic role-descriptions page | [Targeted description removal](../../../extension/sidebar-sortable-accessibility.js); historical Node/Chromium checks and user validation |
| 4B | Destinations procedure; native DOM/AX records and comparison after adaptation | [Navigation guards](../../../extension/ui-accessibility.js), preservation of actual expansion controls |
| 4C | Ordinary, pinned, and project chats procedure; normalized structure and historical DOM/Chromium checks | [Removal of recognized groups](../../../extension/ui-accessibility.js), links/actions/lists preserved |
| 4D | First-pass procedure; physical A/B and C/D comparisons | [Simple and nested lists](../../../extension/sidebar-list-accessibility.js), native focus and pagination preserved |
| 4E | Gallery/sidebar-menu procedure; before/after counts and exact names in code | [Localization](../../../extension/project-accessibility.js), callbacks preserved |

The [dated evidence](../evidence/OBSERVATIONS_AND_PROVENANCE.md) specifies the results for each case. The dedicated pages below isolate 4A and 4D; 4B, 4C, and 4E are examined using their workflows on the site and the shared sources. Historical mechanism validation does not become a measurement of JAWS speech.

## Comparing the first pass through lists — 4D

Open [list-first-focus.html](list-first-focus.html) in a new document. From the Virtual PC Cursor, reach the first link with Tab, then try Down Arrow. Compare A, then B, without clicking the link. A has a `role=list` parent without tabindex; B adds `tabindex=-1`. Note any sound, arrow-key navigation availability, and the need for a manual return to the Virtual PC Cursor. Repeat in the same document to distinguish the first pass from repetition; reload for another independent trial.

Historical feedback of October 4: A normal, B reproduces the initial blockage, repetition normal. The trace neither reads nor controls JAWS mode. Expected results are no guarantee for another browser or setting.

Then open [list-button-first-focus.html](list-button-first-focus.html) in a new document. Reach button C with the usual keys, then activate it with Space. Compare D on its first pass. Each case uses the same native button and the same row forwarding; only D has the parent list `tabindex=-1`. Note list opening and continued arrow-key navigation, using the button shortcut of the configuration in use.

Historical feedback: C normal, D blocks on the first pass, then repetition normal. D's Alt+Tab behavior explicitly differs from the site's and must remain reported.

## Checking role descriptions — 4A

[sidebar-sortable-accessibility.html](sidebar-sortable-accessibility.html) loads the shared module through `../../../extension/sidebar-sortable-accessibility.js`. Keep this directory structure when opening it, or serve the public folder on a local origin. In the production installation, the manifest restricts its loading to ChatGPT; this page explicitly loads the shared file on synthetic elements. The page is not an installer.

The “Exécuter les contrôles DOM” (Run DOM checks) button checks targeted removal of sortable/draggable, preservation of roles, instructions, and callbacks, and restoration of native values on language change or shutdown. The movement data is synthetic; the routes need not be activated. The result is written as text in the page. Historical validation counts appear in the evidence; no new result is attributed to the public copy.

This reproduction checks DOM invariants; it does not certify JAWS announcements. To compare native speech with the correction, use freshly loaded pages and distinguish JAWS version/configuration, browser, DOM role, and computed name.

Site workflows for the five subpoints are collected in [PROCEDURES.md](PROCEDURES.md).

The [native human observations of October 7](../evidence/native-user-feedback-2026-10-07.json) complement the historical evidence without adding a new fixture execution. In particular, they distinguish role replacements after Tab and after Actions du chat (Chat actions), and leaving Forms Mode with Escape or a manual return to the Virtual PC Cursor. These correlations do not measure the internal JAWS cause.
