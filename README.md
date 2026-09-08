# Geminizilla Rice

A **Neo-Tokyo Godzilla** terminal rice for **Google Antigravity** (`agy`) on
Windows. Same cyberpunk-neon shell base as its siblings, plus the
Antigravity-specific layer: a kaiju launch banner for `agy`, a sanitized
`~/.gemini/config` sample, a `GEMINI.md` template, and a Windows Terminal
**Tokyo Night** scheme to match `agy`'s own color scheme.

> ゴジラ ⚡ KAIJU PROTOCOL // 01

**Heads up — the `agy` layer is deliberately thin.** Unlike Claude Code, the
Antigravity CLI has **no custom-theme file and no configurable statusline**; its
color scheme (`tokyo night`) is an interactive pick in `agy /settings`. So the
Antigravity-specific rice is: the launch banner, the config sample, the
`GEMINI.md` rules template, and a matching terminal scheme. The rest of this
repo is the shared shell base (identical to
**[Terminalzilla](https://github.com/ElRroRo/terminalzilla)** — bundled here so
this repo stands alone).

Sibling: **[Claudezilla Rice](https://github.com/ElRroRo/claudezilla-rice)**.

## What's in here

### Antigravity layer (`agy/`, `windows-terminal/tokyo-night.json`)

| Path                              | What it is                                                            |
| --------------------------------- | ------------------------------------------------------------------- |
| `agy/config.sample.json`          | Keys to merge into `~/.gemini/config/config.json` (dark theme mode, auto-execution policy, sandbox off) |
| `agy/GEMINI.example.md`           | Template for `~/.gemini/GEMINI.md` — the "conditional sections" rules pattern with neutral placeholders |
| `windows-terminal/tokyo-night.json` | A **Tokyo Night** color scheme so Windows Terminal matches `agy`'s own scheme |
| `powershell/…` (`agy` function)   | Wraps `agy` to print an `A N T I G R A V I T Y` launch banner, auto-suppressed in print / piped / non-interactive mode |

### Shared shell base

| Path                                          | What it is                                              |
| --------------------------------------------- | ------------------------------------------------------ |
| `powershell/Microsoft.PowerShell_profile.ps1` | Prompt init, neon PSReadLine + FZF colors, `eza`/`bat` aliases, `claude`/`agy` banners, `Set-GodzillaLogo`, `Set-PoshTheme` |
| `fastfetch/config.jsonc` + `*.ans` + `godzilla-source.jpg` | fastfetch `SYSTEM TELEMETRY` frame with truecolor half-block Godzilla art |
| `fastfetch/ansiart.py`, `compose.py`          | Regenerate the `.ans` art from an image                 |
| `oh-my-posh/*.json`                           | Cyberpunk / Dracula powerline prompts                   |
| `windows-terminal/schemes.json`               | `Cyberpunk Neon` + `Dracula` schemes and the `defaults` block |

## Requirements

- [Google Antigravity](https://antigravity.google/) / the `agy` CLI.
- **Windows Terminal**, a **Nerd Font** (`JetBrainsMono NF`),
  [fastfetch](https://github.com/fastfetch-cli/fastfetch),
  [oh-my-posh](https://ohmyposh.dev/).
- Optional: `eza`, `bat`, `zoxide`, `fzf`, `Terminal-Icons`, `PSReadLine`.

## Install

Paths assume `%USERPROFILE%` = `C:\Users\YOU`.

### Antigravity layer

1. **Config** — merge `agy/config.sample.json` into `~/.gemini/config/config.json`.
   Your live file also holds machine-specific `globalPermissionGrants` and a
   `remoteControlHostname`; leave those alone.
2. **Rules** — copy `agy/GEMINI.example.md` → `~/.gemini/GEMINI.md` and fill in
   your own sections. `agy` also picks up `GEMINI.md` / `AGENTS.md` walking up
   from the workspace.
3. **Color scheme** — in `agy /settings` set the scheme to **tokyo night**.
   Then add `windows-terminal/tokyo-night.json`'s scheme to your Windows
   Terminal `schemes` array so the terminal chrome matches (use it on the
   profile you launch `agy` from, or make a dedicated "Antigravity" profile).
4. **Launch banner** — comes with the PowerShell profile below; nothing extra.

### Shared shell base

1. **Windows Terminal** — from `windows-terminal/schemes.json`, append the
   `schemes` entries and copy `defaults` into `profiles.defaults`
   (`JetBrainsMono NF`, `opacity: 43`, `useAcrylic: true`).
2. **fastfetch** — copy `fastfetch/*` → `~/.config/fastfetch/`, then set
   `logo.source` in `config.jsonc` to the **absolute** path of `godzilla.ans`
   (fastfetch doesn't expand `~` there). `logo.width`/`height` are set by hand
   because the logo type is `file-raw`.
3. **oh-my-posh** — copy `oh-my-posh/*.json` → `~/.config/oh-my-posh/`.
4. **PowerShell** — append `powershell/Microsoft.PowerShell_profile.ps1` to your
   `$PROFILE`. On **Windows PowerShell 5.1** save it as **UTF-8 with BOM** or the
   `ゴジラ` glyphs mangle.

## Regenerating the Godzilla art

`ansiart.py` renders an image to a truecolor half-block `.ans`; `compose.py`
adds the caption band. Edit the input filenames at the top of each script, then:

```
cd ~/.config/fastfetch
python ansiart.py
python compose.py
```

## Traps

1. **JetBrainsMono Nerd Font lacks `▰ ▱ ↺ ⎇ ✻ ⏵`** — this rice uses `█ ░` plus
   Nerd Font private-use icons. `ゴジラ` survives only on font fallback.
2. **Never global-replace `"width": N` in `config.jsonc`** — several unrelated
   keys match. Scope edits to the `logo` block (`Set-GodzillaLogo` does).
3. **`agy -p` takes the very next token as the prompt** — `agy -p --model X "..."`
   silently treats `--model` as the prompt. Put the prompt immediately after `-p`.

## Credits

Godzilla / ゴジラ is a trademark and character owned by Toho Co., Ltd. The
bundled artwork is non-commercial personal terminal customization; no
affiliation or endorsement. Tokyo Night palette after the widely-used
[tokyonight](https://github.com/folke/tokyonight.nvim) colors. Prompt built on
[oh-my-posh](https://ohmyposh.dev/).

## License

[MIT](LICENSE).
