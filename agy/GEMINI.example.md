# Global context

Everything in this file is conditional. Each section states when it applies.
If the work at hand does not meet that condition, the section has nothing to
say about it and should be ignored entirely.

<!--
  agy (and the Antigravity IDE) load ~/.gemini/GEMINI.md as global "rules"
  context, plus any GEMINI.md / AGENTS.md found walking up from the workspace.
  The pattern below — narrow "Only when..." headers with an explicit
  "Does not apply to" line — keeps unrelated turns from dragging in house
  tooling they don't need. Replace the examples with your own.
-->

## Only when the task involves <YOUR DATA SYSTEM>

Applies to: <the concrete kinds of questions this system answers>.

Does not apply to: <everything else — name it, so this section stays quiet>.

**<System> is the house source.** <One paragraph: what it is, where it runs,
which MCP server exposes it, what it holds.>

- <Rule 1 — e.g. check it before searching the web.>
- <Rule 2 — e.g. always call `<identify>` once per session.>
- <Rule 3 — e.g. state the vintage / significance / provenance of anything quoted.>

## Only when the work produces a spreadsheet

Applies to: Excel and any other spreadsheet — workbooks, dashboards, models,
exports, anything generated with openpyxl / xlsxwriter / pandas `to_excel`.

**Never use freeze panes.** Repeat the header band, keep the sheet short, or
split across sheets instead.

**Always hide gridlines** on every sheet the code creates
(`worksheet.sheet_view.showGridLines = False` in openpyxl).

## Only when the work produces a user interface

Applies to: dashboards, panels, tables, charts, any screen a person looks at —
including one-off HTML, a Streamlit app, a React tool. Also applies when the ask
is to *redesign* or restyle.

Does not apply to: backend code, data pipelines, model logic, written analysis.

- Never ship `system-ui`, Inter, Roboto or Arial as the chosen typeface.
- `font-variant-numeric: tabular-nums` on every column of numbers.
- Green-up / red-down alone fails colour-blind readers — carry the sign in a
  glyph or the numeral too.

## Only when generating text, documents, or reports

**Never create ASCII tables, ASCII charts, or ASCII figures/diagrams.** Use
GitHub-flavored Markdown tables, a real plotting library rendered to an image,
or a fenced `mermaid` block.
