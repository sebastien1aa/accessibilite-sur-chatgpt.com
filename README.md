# ChatGPT Web accessibility — issue report dossier

[Lire en français](README%20%28fr%29.md).

This repository presents barriers encountered on chatgpt.com with JAWS on Windows, their consequences, expected results and evidence useful for examination by technical teams. It brings together usage feedback, code and accessibility-structure inspections, reproductions and a local demonstration extension.

The author personally carried out the JAWS observations and user-validation tests. The dossier was primarily drafted and organized by **GPT-6.1 Sol in Codex**, under the author’s direction; Codex collected the technical evidence. **The author reviewed and approved the entire French dossier.** The [detailed account of the work’s origin](English%20translation/INTRODUCTION.md#scope-and-origin-of-the-work) distinguishes these contributions.

Observations concern an interface set to French. Navigation and rendering mechanisms are distinguished from translation defects. The general interface change was reported on 25 September 2026; dated evidence and confirmations from 7–8 October supplement earlier investigations.

The [English translation](English%20translation/INTRODUCTION.md) is a complete counterpart of the [authoritative French original](Original%20en%20français/INTRODUCTION.md). French announcements, native strings and raw evidence remain in their original language; explanatory translations do not represent speech heard with English JAWS. Both folders use the same 22 subpoint identifiers and share the demonstration sources and archive.

The [French-label glossary](English%20translation/METHODOLOGY.md#french-labels-used-in-the-reports) explains the French announcements and native labels retained in the reports.

## Reading order

1. Read the [introduction](English%20translation/INTRODUCTION.md) for the context, practical consequences and scope of the report.
2. Read the four Points below in the specified order. Each subpoint begins with **Problem**, **Expected result** and a direct link to its reproduction, followed by observations, the mechanism and the local illustration.
3. To reproduce a case, follow its **reproductions/PROCEDURES.md** file. To examine its evidence, open the items linked in the report; **reproductions/RUNNING_TESTS.md** explains tests and synthetic pages.
4. Consult the [environment](English%20translation/ENVIRONMENT.md), [methodology](English%20translation/METHODOLOGY.md) and [scope of evidence and user validation](English%20translation/EVIDENCE_SCOPE_AND_USER_VALIDATION.md) to interpret conditions, attribution and results.

## Index of the 22 subpoints

The order groups issues by navigation flow and priority. Product or organizational requests are identified within their subpoints.

### Point 1 — Model selector and composer

[Report](English%20translation/Point%201%20-%20Model%20selector%20and%20composer/REPORT.md) · [Site procedures](English%20translation/Point%201%20-%20Model%20selector%20and%20composer/reproductions/PROCEDURES.md) · [Tests and fixtures](English%20translation/Point%201%20-%20Model%20selector%20and%20composer/reproductions/RUNNING_TESTS.md)

| Case | Issue or request |
|---|---|
| [1A](English%20translation/Point%201%20-%20Model%20selector%20and%20composer/REPORT.md#1a--the-closed-selector-does-not-allow-the-choice-to-be-identified-quickly) | Current choice obscured by the selector’s generic name; inconsistent effort labels and fast-mode state. |
| [1B](English%20translation/Point%201%20-%20Model%20selector%20and%20composer/REPORT.md#1b--the--ajouter-des-fichiers-et-plus-encore--menu-closes-without-activating-the-intended-option) | Add menu not reached correctly; the option being read is not activated. |
| [1C](English%20translation/Point%201%20-%20Model%20selector%20and%20composer/REPORT.md#1c--up-arrow-unintentionally-inserts-an-old-prompt-into-an-empty-field) | Unintended prompt recall with Up Arrow, depending on previous use of the conversation or browser. |

### Point 2 — Reading and messages

[Report](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md) · [Site procedures](English%20translation/Point%202%20-%20Reading%20and%20messages/reproductions/PROCEDURES.md) · [Tests and fixtures](English%20translation/Point%202%20-%20Reading%20and%20messages/reproductions/RUNNING_TESTS.md)

| Case | Issue or request |
|---|---|
| [2A](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2a--navigating-a-long-conversation-without-losing-messages) | Reading disruptions in long conversations and off-screen turns that are not mounted. |
| [2B](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2b--locating-the-response-and-navigating-reasoning) | « ChatGPT a dit » heading present only after reasoning has finished with GPT-5.6 Sol; activity before completed steps in both models and repeated caption; GPT-6 with High reasoning effort has its initial heading. |
| [2C](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2c--extended-selection-and-accompanying-information) | Selection interrupted by jumps; including metadata in copied text as a separate product request. |
| [2D](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2d--understanding-copy-and-share-success-without-losing-position) | Copy/Share without reliable audible confirmation or preservation of position; availability exposed inconsistently. |
| [2E](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2e--inactive-writing-block-handles) | Invisible, inactive writing-block handles exposed as buttons. |
| [2F](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2f--redundant--derni%C3%A8re-r%C3%A9ponse--marker) | Redundant “Dernière réponse” heading: request for simplification. |
| [2G](English%20translation/Point%202%20-%20Reading%20and%20messages/REPORT.md#2g--web-references-and-source-preview-content) | Web references announced as menu buttons; abbreviated card names and extraneous favicon information. |

### Point 3 — Navigation and focus

[Report](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md) · [Site procedures](English%20translation/Point%203%20-%20Navigation%20and%20focus/reproductions/PROCEDURES.md) · [Tests and fixtures](English%20translation/Point%203%20-%20Navigation%20and%20focus/reproductions/RUNNING_TESTS.md)

| Case | Issue or request |
|---|---|
| [3A](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3a--project-controls-accessible-with-arrow-keys) | Project Actions and New chat absent from arrow-key navigation. |
| [3B](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3b--reopening-the-sidebar-and-a-stable-control) | Inaccessible control to reopen the hidden sidebar. |
| [3C](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3c--afficher-plus-for-a-projects-chats) | Show more returns to the start of a project’s chats. |
| [3D](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3d--return-after-escape-in-menus-and-panels) | Reading resumes at the top of the page after menus/panels are closed. |
| [3E](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3e--explorer-entry-closure-and-popup-property) | Entering/leaving Explorer is inconsistent with JAWS navigation. |
| [3F](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3f--cancelling-sharing-or-editing-returning-to-the-same-message) | Canceling sharing or editing does not return to the same message. |
| [3G](English%20translation/Point%203%20-%20Navigation%20and%20focus/REPORT.md#3g--rating-the-response-menu-role-and-resumption-after-escape) | The response-rating button does not expose its menu function; reading resumes elsewhere. |

### Point 4 — Semantics and localization

[Report](English%20translation/Point%204%20-%20Semantics%20and%20localization/REPORT.md) · [Site procedures](English%20translation/Point%204%20-%20Semantics%20and%20localization/reproductions/PROCEDURES.md) · [Tests and fixtures](English%20translation/Point%204%20-%20Semantics%20and%20localization/reproductions/RUNNING_TESTS.md)

| Case | Issue or request |
|---|---|
| [4A](English%20translation/Point%204%20-%20Semantics%20and%20localization/REPORT.md#4a--sortable-and-draggable-instead-of-informative-roles) | Sortable/draggable descriptions obscure meaningful roles. |
| [4B](English%20translation/Point%204%20-%20Semantics%20and%20localization/REPORT.md#4b--r%C3%A9duit-on-navigation-destinations) | Collapsed state on main and pinned destinations; comparison with settings buttons. |
| [4C](English%20translation/Point%204%20-%20Semantics%20and%20localization/REPORT.md#4c--redundant-groups-around-chats) | Repetitive group boundaries around chats. |
| [4D](English%20translation/Point%204%20-%20Semantics%20and%20localization/REPORT.md#4d--blockage-on-the-first-pass-through-projects-and-lists) | Arrow-key navigation blocked at the first focus in some lists or when a project is expanded. |
| [4E](English%20translation/Point%204%20-%20Semantics%20and%20localization/REPORT.md#4e--pin-project-and-unpin-project-in-a-french-interface) | Project pinning not translated in the gallery. |

## Evidence and demonstration extension

JAWS feedback describes the announcements and reading position actually reported. The DOM, accessibility tree and code establish the measured mechanisms; synthetic tests isolate those of the workaround. Reports distinguish native behavior, adaptation and unresolved interoperability attribution. Older evidence items retain their capture date and version.

The [4.1.2 demonstration extension](English%20translation/DEMONSTRATION_EXTENSION.md) illustrates targeted adaptations of native controls. Its [source files](extension/manifest.json), [archive](distribution/Accessibilite-pour-ChatGPT-web-4.1.2.zip) and [hashes](distribution/empreintes-sources-4.1.2.json) are supplied. It serves to compare mechanisms; lasting accessibility must be provided by the product.

## Organization

- **Original en français/**: authoritative French context and four reports, each with evidence, procedures and targeted tests.
- **English translation/**: corresponding English context and reports, using the same identifiers; original French evidence and executable reproductions are preserved.
- **extension/**: shared demonstration source files to load in Chrome or Edge.
- **distribution/**: shared demonstration archive and SHA-256 hashes.
- **licences/**: official license texts shared by both language versions.

Reuse conditions are set out in the [English license notice](LICENSE%20%28eng%29.md), which links to the authoritative [French notice](LICENCE%20%28fr%29.md).
