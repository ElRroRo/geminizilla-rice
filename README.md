# Geminizilla Rice

A **Neo-Tokyo Godzilla** terminal rice for **Google Antigravity** (`agy`) on
Windows. Same cyberpunk-neon shell base as its siblings, plus the
Antigravity-specific layer: a kaiju launch banner for `agy`, a Neo-Tokyo
color theme patcher for `agy.exe`, an intelligent dual-line Godzilla statusline,
a sanitized `~/.gemini/config` sample, a `GEMINI.md` template, and a Windows Terminal
**Tokyo Night** scheme to match `agy`'s cyberpunk aesthetic.

> ゴジラ ⚡ KAIJU PROTOCOL // 01

Sibling: **[Claudezilla Rice](https://github.com/ElRroRo/claudezilla-rice)**.

## What's in here

### Antigravity layer (`agy/`, `windows-terminal/tokyo-night.json`)

| Path                                | What it is                                                            |
| ----------------------------------- | ------------------------------------------------------------------- |
| `agy/patch-neo-tokyo.py`            | Automated patcher that upgrades `agy.exe`'s built-in `tokyo night` scheme to **Neo-Tokyo** (hot neon magenta lines, abyss black bg, ice white text, neon green diffs) |
| `agy/statusline.js`                 | Intelligent model-aware dual-line telemetry statusline (context % + Gemini / 3P quota bars) |
| `agy/settings.sample.json`          | Sample `~/.gemini/antigravity-cli/settings.json` configuring the statusline and `tokyo night` scheme |
| `agy/config.sample.json`            | Keys to merge into `~/.gemini/config/config.json` (dark theme mode, auto-execution policy, sandbox off) |
| `agy/GEMINI.example.md`             | Template for `~/.gemini/GEMINI.md` — the "conditional sections" rules pattern with neutral placeholders |
| `windows-terminal/tokyo-night.json` | A **Tokyo Night** color scheme so Windows Terminal matches `agy`'s scheme |
| `powershell/…` (`agy` + `Patch-AgyRice`) | Wraps `agy` with auto-heal (re-patches after CLI auto-updates) and launch banner |

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

1. **Theme patcher** — run `python agy/patch-neo-tokyo.py`. This upgrades `agy.exe`'s built-in `tokyo night` palette to cyberpunk Neo-Tokyo (hot neon magenta lines/prompts `#ff0087`, ice white `#f0f4f8`, Tokyo Night navy `#1a1b26`, Chroma highlights `#3d144c`). The PowerShell profile below automatically re-patches whenever AGY auto-updates!
2. **Statusline** — copy `agy/statusline.js` → `~/.gemini/antigravity-cli/statusline.js`.
3. **Settings** — merge `agy/settings.sample.json` into `~/.gemini/antigravity-cli/settings.json` (sets `colorScheme: "tokyo night"` and hooks up the statusline).
4. **Config** — merge `agy/config.sample.json` into `~/.gemini/config/config.json`.
   Your live file also holds machine-specific `globalPermissionGrants` and a
   `remoteControlHostname`; leave those alone.
5. **Rules** — copy `agy/GEMINI.example.md` → `~/.gemini/GEMINI.md` and fill in
   your own sections.
6. **Windows Terminal** — add `windows-terminal/tokyo-night.json`'s scheme to your
   Windows Terminal `schemes` array so the terminal background and borders match.
7. **Launch banner & Auto-heal** — included in the PowerShell profile below; handles launch banner, telemetry badge, and auto-repatching after CLI updates.

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
