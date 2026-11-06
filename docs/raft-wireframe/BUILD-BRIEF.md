# Build brief: RAFT case study, problem section

## Goal

Replace the **"The Challenge"** section on `defense-funding.html` with the new problem section specified in `problem-section-wireframe.html`. This is the first of several sections that will be rebuilt one at a time, so the components built here should be reusable in later sections.

## Files in this folder

- `problem-section-wireframe.html`: the spec. Structure, block order, and copy are final. Each block is labeled with a `<!-- COMPONENT: ... -->` comment.
- `BUILD-BRIEF.md`: this file.
- `screenshots/` (optional): visual exports of the wireframe for reference.

## What is final and what isn't

**Final**
- Block order and hierarchy (one H2 for the section, H3s for subsections)
- All copy. Use it verbatim, including typographic quotes and apostrophes (’ “ ”). Don't rewrite, shorten, or "improve" it.
- Which content is a card, a pull quote, a callout, a figure, and so on

**Not final (wireframe conventions only)**
- Grayscale colors, the Inter font, and all inline styles. Match the site's existing stylesheet instead: its fonts, colors, type scale, spacing, and content width. Don't import Inter or add the wireframe's gray palette.
- Small uppercase labels ("The ask", "Shared with the client", "Step 1", "Decision 1"). Keep the label text, but style it to fit the site.
- A full color and visual design pass comes later as a separate task.

## Scope

**Change**
1. Replace the entire "The Challenge" section with the content between `<!-- NEW PROBLEM SECTION -->` and `<!-- END NEW PROBLEM SECTION -->`.
2. In "The Solution," delete the first paragraph (it begins "Working with finance and policy personnel from 14 DoD agencies..."). It repeats the new section and conflicts with its numbers. Leave the rest of "The Solution" and all of "The Impact" as they are.

**Don't change**
- The existing page header, hero image, title, subtitle, and Role/Responsibilities/Team/Timeline row. They appear in the wireframe for context only.
- Anything else on the site.

## Components to build

Build these as reusable, class-based components in the site's CSS, not inline styles.

| Component | Notes |
|---|---|
| Section header + lead | H2, then a larger lead paragraph |
| Role line | One short, muted line under the lead |
| Stat bar | 4 stats, each a large figure with a small label; wraps on narrow screens |
| Subhead + body | H3 plus paragraphs; keep body text at a readable line length (about 720px max) |
| Process flow | 5 steps joined by chevrons; HTML/CSS, not an image |
| Pull quote | Quote, attribution, and an optional lead-in line above the quote |
| Card grid | 2-up cards with a title, text, and an optional footer line |
| Callout | Highlighted box with a label, title, and text ("The ask") |
| Two-column text + figure | Text on one side, donut chart and caption on the other; stacks on mobile |
| Two-tier card rows | Two labeled rows of cards ("Shared with the client" / "Raised only by submitters"). The two tiers must differ by more than color, such as border weight or fill. |
| Root cause chain | A group of 3 causes, then 3 effect steps joined by chevrons; HTML/CSS |
| Lightbox link | Opens the full pain point analysis image in an accessible dialog (native `<dialog>`, closes on Esc, returns focus). The image isn't ready yet, so use a placeholder. |
| Stage strip figure | 5 process stages in a grid, a severity curve above them, and two brackets below: "Submission portal" spanning stage 3 only, "Coordination tool" spanning all 5 |
| Decision cards | 3-up cards with a number label, title, text, and optional "Instead of" footer |
| Vision panel | Tinted panel, smaller type, a label, and a `<blockquote>`; reads as a quoted period document |
| Closing callout | Larger text with a top rule; leads into the next section |

## Graphics

- **Process flow and root cause chain:** build them in HTML/CSS as specified.
- **Donut chart:** the wireframe's inline SVG is drawn from real data (14, 9, 5, 3, 3; 34 total). Keep it data-driven so it can be restyled. The legend and center label are HTML, not SVG text.
- **Severity curve in the stage strip:** placeholder only. Keep it as a swappable SVG slot. A final SVG will replace it.
- Final styled SVGs for all four graphics will be delivered later. Structure each graphic so it can be swapped without touching the surrounding layout.

## Responsive behavior

- Card rows, the stat bar, and the two-column block stack on narrow screens.
- The process flow, root cause chain, and stage strip scroll horizontally inside their own container on narrow screens (`overflow-x: auto`); the page itself must never scroll sideways.
- Check at 375px, 768px, and desktop widths.

## Accessibility

- Semantic structure: one H2 for the section, H3s for subsections, `<figure>`/`<figcaption>` for graphics, `<blockquote>` for quotes.
- Decorative SVGs (chevrons, arrows) get `aria-hidden="true"`. Data graphics (donut, severity curve) get `role="img"` and a descriptive `aria-label`.
- Text contrast of at least 4.5:1 and visible keyboard focus on all links and controls.

## Open TODOs

Leave each of these as an HTML comment in the built page so they're easy to find.

1. Confirm the "Portal fix" footers on the client frustration cards (optional; may be cut).
2. Confirm that "Form confusion" belongs in the "Raised only by submitters" row.
3. Confirm the sanitized donut labels (Client analysts, Implementing agencies, Client IT office, Partner programs office, Subject-matter reviewers).
4. Replace the illustrative severity curve with one re-plotted from the research chart.
5. Sanitize every quote and diagram: no agency names, seals, office names, or program acronyms.
6. The "Instead of" footers on the decision cards are optional.
7. Separate task: reconcile Team and Timeline in the existing header.

## Out of scope for this pass

- The color and visual design pass
- Final SVG graphics
- Sections after this one ("The Solution" and "The Impact" rewrites)

## Suggested prompt

> Read `docs/raft-wireframe/BUILD-BRIEF.md` and `docs/raft-wireframe/problem-section-wireframe.html`, then look at `defense-funding.html` and the site's existing CSS. Replace "The Challenge" section with the new problem section as the brief describes, building the listed components as reusable classes that match the site's existing styles. Show me the plan before editing any files.
