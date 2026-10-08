# ChatGPT Web accessibility: issue report dossier

This dossier describes barriers encountered in **the chatgpt.com interface**, using JAWS on Windows: model selection, composition, reading long conversations, navigating projects, focus management and announced information. These difficulties have practical consequences: functions that are difficult or impossible to activate, repeated loss of the reading position, content unintentionally added to the draft, and important information that cannot be identified quickly. Although observations were made with the site's interface set to French, the investigations concern the site's functionality and code; the issues and reproduction steps therefore remain applicable regardless of interface language, except for the French translation issues observed.

The work represents **a substantial number of hours of personal testing and technical investigation with Codex**. Its purpose is to be sent to the teams responsible for ChatGPT accessibility and its interface for examination and, if possible, follow-up. It can also help prevent the same regression mechanisms in future interfaces.

**Reinvestigation of the native site on 7 October 2026, from 19:18 to 22:40**, supplementing the evidence from September and 3–6 October. It includes a comparison of reasoning with GPT-6 followed by GPT-5.6; Point 2B describes the results. Additional reasoning observations continued around **23:20**, Brussels time, followed by user validation of GPT-6 cards and regions on **8 October**. Human validation of the native site, in Edge without the extension for the selector's name, took place on **8 October at 01:55, Brussels time (UTC+02:00)**. Each evidence item retains its date and provenance.

## Reading the four sets of issues

The order reflects the impact and the user's priorities. Each folder contains its detailed report and the evidence or reproductions needed to read it. Subpoints have stable identifiers and can be examined independently.

1. [Model selector and composer](Point%201%20-%20Model%20selector%20and%20composer/REPORT.md): model and reasoning effort, localization of that effort, the add menu, unintentional prompt recall.
2. [Reading and messages](Point%202%20-%20Reading%20and%20messages/REPORT.md): long conversations, reasoning, selection, copying and sharing, generated writing areas and navigation markers.
3. [Navigation and focus](Point%203%20-%20Navigation%20and%20focus/REPORT.md): project actions, sidebar, pagination, closing menus and panels, the Explorer case, the response-rating menu.
4. [Semantics and localization](Point%204%20-%20Semantics%20and%20localization/REPORT.md): role descriptions, destination states, redundant groups, entering a blocking mode on the first pass, and project controls in English.

The [methodology](METHODOLOGY.md) explains the levels of evidence. The [complete extension](../extension/manifest.json), version **4.1.2**, is the shared demonstration extension; its [loading instructions](DEMONSTRATION_EXTENSION.md) allow comparison of behavior with and without the adaptation.

## Timeline and environment

The general interface change was observed **on 25 September 2026 at 23:16, Brussels time**, while the previous layout had still been present a few hours earlier. This is the user's account, not a technical deployment timestamp. The difficulty caused by virtualization of long conversations had already been examined starting on **17 September**; it was subsequently reexamined after the rendering change.

The [current versions, JAWS scripts and user confirmations](ENVIRONMENT.md) are collected in the environment document: Chrome 154.0.8037.98, Edge 154.0.4258.62, Opera 136.0.6008.80, JAWS 2021.2107.12.400 and 2025.2503.39.400. Confirmations for the browsers and JAWS versions listed are specified in each Point; Opera is used in particular as the control case for a new chat with no prior submission. The demonstration sources and instrumented evidence are presented separately.

Local human observation times cited in this dossier are in **Brussels time (Europe/Brussels, UTC+02:00)** for September and early October 2026. Technical evidence timestamps retain their explicit time zone: ISO values ending in `Z` are in UTC, and values with an offset retain that offset. A date without a time means that only that degree of precision is supported.

## Scope and origin of the work

The user personally carried out the usage observations and physical validation. Inspection of the DOM, accessibility tree and public code, tests and the extension were carried out with Codex, primarily using **GPT-6.1 Sol**, under the user's direction. The dossier was also primarily drafted and organized by this model in Codex, which collected the technical evidence. The user reviewed and approved the entire French dossier. This provenance explains how the work was divided; it does not give the model evidentiary authority. The user can describe their navigation and announcements, but should not be assumed able to personally recall every React or Chromium detail.

Several difficulties were also encountered or described in the Windows application combining ChatGPT and Codex. The technical evidence in this dossier concerns the **Web**. It would be useful for the teams to examine equivalent behavior in the Windows application without assuming that it shares exactly the same code or cause.

Purely visual captures generally do not suffice to demonstrate these issues. The dossier prioritizes interactions, available JAWS feedback, exposed names and roles, focus traces and verifiable mechanisms. No audio or video recording is supplied unsolicited; a targeted request can be considered according to its necessity and feasibility.

## What is included and what is not

The four sets distinguish observed native mechanisms, interoperability difficulties, organizational requests and limitations of the adaptation. A successful workaround does not mean the site has been fixed and is not sufficient to attribute its cause to OpenAI.

In conversations already used, or in a new chat after a prompt creating a conversation has been submitted from that browser, reinserting prompts with Up Arrow remains a navigation barrier and a risk of unintended submission; the extension's limitation is the lack of an alternative way to access that history. Grouping analysis sections and keeping the sidebar in a stable location are described with their organizational aspect. The current control is “Évaluer la réponse” (rate the response): its menu function and the reading position after closing it are examined in Point 3G.

Manual selection and copying work when no reading-position jump occurs, as confirmed by native-site feedback on 7 October. Jumps in long conversations interrupt the continuity of reading and selection. Including speakers, thinking durations and timestamps in copied text is identified as a separate product request in Point 2C.

The extension's other preferences—removing the Home link on the home page, quick project creation in the single-list layout, or the exact arrangement of a project row—are not treated as universal defects.

## Scope of the results

The mechanisms describe the renderings examined. Dated evidence distinguishes observed renderings and product changes; unresolved attribution retains that qualification. Names computed in the accessibility tree are never presented as speech that was heard.
