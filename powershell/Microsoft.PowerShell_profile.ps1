# Set console encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Ensure companion tools are available in PATH
$pathsToAdd = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links",
    "$env:LOCALAPPDATA\Microsoft\WindowsApps",
    "$env:USERPROFILE\.cargo\bin",
    "$env:USERPROFILE\.local\bin",
    "$env:LOCALAPPDATA\agy\bin"
)
foreach ($p in $pathsToAdd) {
    if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
        $env:Path = "$p;$env:Path"
    }
}

# 1. Oh My Posh Cyberpunk Neon Prompt
if (Get-Command oh-my-posh -ErrorAction SilentlyContinue) {
    $themePath = "$env:USERPROFILE\.config\oh-my-posh\cyberpunk.omp.json"
    if (Test-Path "$env:USERPROFILE\.config\oh-my-posh\active.omp.json") {
        $themePath = "$env:USERPROFILE\.config\oh-my-posh\active.omp.json"
    }
    oh-my-posh init pwsh --config $themePath | Invoke-Expression
}

# 2. PSReadLine Configuration & Cyberpunk Neon Syntax Colors
if (Get-Module -ListAvailable PSReadLine) {
    Import-Module PSReadLine
    try {
        if ($host.Name -eq 'ConsoleHost' -and -not [Console]::IsOutputRedirected) {
            Set-PSReadLineOption -PredictionSource HistoryAndPlugin -ErrorAction SilentlyContinue
            Set-PSReadLineOption -PredictionViewStyle InlineView -ErrorAction SilentlyContinue
        }
        Set-PSReadLineOption -EditMode Windows -ErrorAction SilentlyContinue

        # F2: Toggle between Inline ghost text and dropdown List View
        Set-PSReadLineKeyHandler -Key F2 -Function SwitchPredictionView -ErrorAction SilentlyContinue

        # Cyberpunk Neon Syntax Colors
        Set-PSReadLineOption -Colors @{
            Command            = '#00F0FF' # Electric Cyan
            Number             = '#00FF66' # Hyper Neon Green
            Member             = '#05FFA1' # Mint Neon
            Operator           = '#FF007F' # Hot Neon Magenta
            Type               = '#00F0FF' # Electric Cyan
            Variable           = '#F0F4F8' # Ice White
            Parameter          = '#FF007F' # Hot Neon Magenta
            ContinuationPrompt = '#495470' # Deep Slate
            Default            = '#F0F4F8' # Ice White
            Emphasis           = '#FFE600' # Laser Yellow
            Error              = '#FF1744' # Laser Red
            Selection          = '#3D144C' # Neon Violet Selection
            Comment            = '#495470' # Deep Slate
            Keyword            = '#FF007F' # Hot Neon Magenta
            String             = '#FFE600' # Laser Yellow
            InlinePrediction   = '#495470' # Muted Slate
        } -ErrorAction SilentlyContinue
    } catch {}
}

# 3. Terminal-Icons
if (Get-Module -ListAvailable Terminal-Icons) {
    Import-Module Terminal-Icons
}

# 4. Zoxide (Smart directory jumper 'z')
if (Get-Command zoxide -ErrorAction SilentlyContinue) {
    Invoke-Expression (& zoxide init powershell | Out-String)
}

# 5. FZF Cyberpunk Neon Styling
$env:FZF_DEFAULT_OPTS = '--color=fg:#f0f4f8,bg:#08090f,hl:#00f0ff --color=fg+:#ffffff,bg+:#1c2038,hl+:#ff007f --color=info:#ffe600,prompt:#ff007f,pointer:#ff007f --color=marker:#00ff66,spinner:#ffe600,header:#495470 --height 40% --layout=reverse --border'

# 6. Modern Aliases (eza, bat)
if (Get-Command eza -ErrorAction SilentlyContinue) {
    function ls { eza --icons --group-directories-first $args }
    function ll { eza -la --icons --git --group-directories-first $args }
    function lt { eza --tree --level=2 --icons $args }
    function ltree { eza --tree --icons $args }
}

if (Get-Command bat -ErrorAction SilentlyContinue) {
    function cat { bat --paging=never $args }
}

# Quick Navigation Shortcuts
function .. { Set-Location .. }
function ... { Set-Location ..\.. }
function fetch { fastfetch }

# ---------------------------------------------------------------------------
# 7. KAIJU PROTOCOL — shared neon palette + agent CLI launch banners
# ---------------------------------------------------------------------------
$script:K = @{
    Esc    = [char]27
    Art    = "$env:USERPROFILE\.config\fastfetch\banner-mini.ans"
}
$script:K.Mag   = "$($script:K.Esc)[38;2;255;0;135m"   # hot magenta
$script:K.MagHi = "$($script:K.Esc)[38;2;255;145;205m" # magenta highlight
$script:K.Cyan  = "$($script:K.Esc)[38;2;0;240;255m"   # electric cyan
$script:K.Viol  = "$($script:K.Esc)[38;2;176;38;255m"  # neon violet
$script:K.Yel   = "$($script:K.Esc)[38;2;255;230;0m"   # laser yellow
$script:K.Slate = "$($script:K.Esc)[38;2;73;84;112m"   # deep slate
$script:K.Ice   = "$($script:K.Esc)[38;2;240;244;248m" # ice white
$script:K.R     = "$($script:K.Esc)[0m"

# True when the caller is scripting the CLI (print mode / piped output), so the
# banner must stay out of the way.
function Test-KaijuQuiet {
    param([string[]]$Arguments)
    if ([Console]::IsOutputRedirected) { return $true }
    if ($host.Name -ne 'ConsoleHost')  { return $true }
    foreach ($a in $Arguments) {
        if ($a -in @('-p', '--print', '--prompt', '--output-format', '--input-format', '--json-schema')) { return $true }
    }
    return $false
}

function Write-KaijuBanner {
    param(
        [Parameter(Mandatory)][string]$Title,
        [string]$Subtitle = '',
        [string[]]$Facts = @()
    )
    $k = $script:K
    $art = @()
    if (Test-Path $k.Art) {
        $art = [System.IO.File]::ReadAllLines($k.Art, [System.Text.Encoding]::UTF8)
    }

    $right = @(
        "$($k.Mag)ゴジラ$($k.R)",
        "$($k.Slate)────────────────────────────────$($k.R)",
        '',
        "$($k.MagHi)$Title$($k.R)"
    )
    if ($Subtitle) { $right += "$($k.Slate)$Subtitle$($k.R)" }
    if ($Facts.Count) {
        $right += ''
        foreach ($f in $Facts) { $right += "$($k.Viol)▪ $($k.Ice)$f$($k.R)" }
    }
    $right += ''
    $right += "$($k.Yel)⚡$($k.R) $($k.Mag)KAIJU PROTOCOL$($k.R) $($k.Slate)//$($k.R) $($k.Cyan)01$($k.R)"

    Write-Host ''
    if ($art.Count -eq 0) {
        foreach ($line in $right) { Write-Host "  $line" }
        Write-Host ''
        return
    }

    # Vertically centre the text column against the art column.
    $pad = [Math]::Max(0, [Math]::Floor(($art.Count - $right.Count) / 2))
    $rows = [Math]::Max($art.Count, $pad + $right.Count)
    for ($i = 0; $i -lt $rows; $i++) {
        $l = if ($i -lt $art.Count) { $art[$i] } else { ' ' * 40 }
        $j = $i - $pad
        $r = if ($j -ge 0 -and $j -lt $right.Count) { $right[$j] } else { '' }
        Write-Host ("  " + $l + "   " + $r)
    }
    Write-Host ''
}

function claude {
    if (-not (Test-KaijuQuiet $args)) {
        Write-KaijuBanner -Title 'C L A U D E   C O D E' `
                          -Subtitle 'anthropic // agentic terminal' `
                          -Facts @('theme    custom:neo-tokyo', 'status   ctx / 5h / weekly bars')
    }
    $exe = (Get-Command -CommandType Application claude.exe -ErrorAction SilentlyContinue).Source
    if ($exe) { & $exe $args } else { Write-Error "claude.exe not found in PATH" }
}

function agy {
    if (-not (Test-KaijuQuiet $args)) {
        Write-KaijuBanner -Title 'A N T I G R A V I T Y' `
                          -Subtitle 'google // agentic terminal' `
                          -Facts @('scheme   tokyo night', 'settings ~\.gemini\antigravity-cli')
    }
    $exe = (Get-Command -CommandType Application agy.exe -ErrorAction SilentlyContinue).Source
    if ($exe) { & $exe $args } else { Write-Error "agy.exe not found in PATH" }
}

# 7b. Godzilla logo variant switcher (fastfetch)
function Set-GodzillaLogo {
    [CmdletBinding()]
    param([ValidateSet('bust', 'full')][string]$Variant = 'bust')

    $dir = "$env:USERPROFILE\.config\fastfetch"
    $map = @{
        bust = @{ File = 'godzilla.ans';      Width = 66; Height = 25 }
        full = @{ File = 'godzilla-full.ans'; Width = 60; Height = 33 }
    }
    $sel = $map[$Variant]
    $src = Join-Path $dir $sel.File
    if (-not (Test-Path $src)) { Write-Error "Missing art file: $src"; return }

    $cfgPath = Join-Path $dir 'config.jsonc'
    $cfg = Get-Content $cfgPath -Raw -Encoding UTF8

    # Rewrite ONLY the "logo" block. display.key.width, display.bar.width and
    # colors.block.width also match '"width": N', so a global replace corrupts them.
    $srcJson = ($src -replace '\\', '/')
    $evaluator = {
        param($m)
        $inner = $m.Groups[2].Value
        $inner = $inner -replace '"source"\s*:\s*"[^"]*"', ('"source": "' + $srcJson + '"')
        $inner = $inner -replace '"width"\s*:\s*\d+',      ('"width": '  + $sel.Width)
        $inner = $inner -replace '"height"\s*:\s*\d+',     ('"height": ' + $sel.Height)
        $m.Groups[1].Value + $inner + $m.Groups[3].Value
    }
    $pattern = '(?s)("logo"\s*:\s*\{)(.*?)(\r?\n\s*\},)'
    if ($cfg -notmatch $pattern) { Write-Error "Could not locate the logo block in $cfgPath"; return }
    $cfg = [regex]::Replace($cfg, $pattern, $evaluator, 1)
    [System.IO.File]::WriteAllText($cfgPath, $cfg, (New-Object System.Text.UTF8Encoding $false))

    Write-Host "$($script:K.Mag)ゴジラ$($script:K.R) logo -> $($script:K.Cyan)$Variant$($script:K.R) ($($sel.Width)x$($sel.Height))"
    fastfetch
}

# 8. Theme Switching Utility
function Set-PoshTheme {
    param([Parameter(Mandatory=$false)][string]$ThemeName)
    if (-not $ThemeName) {
        Write-Host "Usage: Set-PoshTheme <themename>" -ForegroundColor Cyan
        Write-Host "To switch back to Cyberpunk: Set-PoshTheme cyberpunk" -ForegroundColor Magenta
        return
    }
    if ($ThemeName -eq "cyberpunk" -or $ThemeName -eq "default") {
        Remove-Item "$env:USERPROFILE\.config\oh-my-posh\active.omp.json" -ErrorAction SilentlyContinue
        Write-Host "Reset to Cyberpunk Neon theme! Run `. `$PROFILE` to apply." -ForegroundColor Green
        return
    }
    $targetFile = "$env:LOCALAPPDATA\Programs\oh-my-posh\themes\$ThemeName.omp.json"
    if (-not (Test-Path $targetFile)) {
        $targetFile = "$env:POSH_THEMES_PATH\$ThemeName.omp.json"
    }
    if (Test-Path $targetFile) {
        Copy-Item $targetFile "$env:USERPROFILE\.config\oh-my-posh\active.omp.json" -Force
        Write-Host "Switched theme to $ThemeName! Run `. `$PROFILE` to apply." -ForegroundColor Green
    } else {
        Write-Warning "Theme '$ThemeName' not found."
    }
}

# 9. Startup greeting / fastfetch (only in interactive console window)
try {
    if ($host.Name -eq 'ConsoleHost' -and [System.Environment]::UserInteractive -and -not [Console]::IsOutputRedirected) {
        fastfetch
    }
} catch {}
