#!/usr/bin/env python3
"""
patch-neo-tokyo.py
Patches the Google Antigravity CLI binary (`agy.exe`) with the Neo-Tokyo (Godzilla) theme palette:
- Replaces the 14 Lipgloss theme colors for 'tokyo night' with cyberpunk neon magenta/cyan/green
- Replaces Chroma Tokyo Night line highlight styles with deep neon violet (#3d144c)
- Handles Windows running-binary locks via safe atomic rename + replace
- Verifies binary integrity before swapping
"""

import os
import sys
import shutil
import time
import subprocess

STOCK_PALETTE = (
    b'#1a1b26'  # 1. bg
    b'#c0caf5'  # 2. fg
    b'#7aa2f7'  # 3. primary (light blue)
    b'#414868'  # 4. border/lines (slate)
    b'#9ece6a'  # 5. green
    b'#1c2d26'  # 6. green diff bg
    b'#f7768e'  # 7. red
    b'#3b2229'  # 8. red diff bg
    b'#787c99'  # 9. subtle/muted
    b'#e0af68'  # 10. yellow
    b'#bb9af7'  # 11. purple
    b'#ff9e64'  # 12. orange
    b'#a9b1d6'  # 13. cyan
    b'#9aa5ce'  # 14. inactive
)

NEO_TOKYO_PALETTE = (
    b'#1a1b26'  # 1. background (Tokyo Night navy)
    b'#f0f4f8'  # 2. foreground (ice white)
    b'#ff0087'  # 3. primary (hot neon magenta)
    b'#ff0087'  # 4. BORDER / LINES (hot neon magenta)
    b'#00ff66'  # 5. success (hyper neon green)
    b'#14502d'  # 6. diff added bg
    b'#ff1744'  # 7. error (laser red)
    b'#601434'  # 8. diff removed bg
    b'#495470'  # 9. subtle / muted (deep slate)
    b'#ffe600'  # 10. warning (laser yellow)
    b'#b026ff'  # 11. skill (neon violet)
    b'#ff7814'  # 12. orange
    b'#00f0ff'  # 13. cyan / user (electric cyan)
    b'#8c94aa'  # 14. inactive
)

CHROMA_STOCK_HL = b'style="bg:#414868"'
CHROMA_NEO_HL   = b'style="bg:#3d144c"'

def find_agy_path():
    local_app_data = os.environ.get('LOCALAPPDATA', '')
    candidates = [
        os.path.join(local_app_data, 'agy', 'bin', 'agy.exe'),
        shutil.which('agy.exe') or '',
    ]
    for c in candidates:
        if c and os.path.isfile(c):
            return os.path.abspath(c)
    raise FileNotFoundError("Could not find agy.exe")

def patch_agy(agy_path=None):
    if not agy_path:
        agy_path = find_agy_path()
    
    print(f"[*] Target binary: {agy_path}")
    agy_dir = os.path.dirname(agy_path)

    with open(agy_path, 'rb') as f:
        data = bytearray(f.read())

    # Check if already patched
    if data.find(NEO_TOKYO_PALETTE) != -1:
        print("[+] Binary is ALREADY patched with Neo-Tokyo palette!")
        stamp_file = os.path.join(agy_dir, '.neo_tokyo_patched')
        try:
            with open(stamp_file, 'w') as f:
                f.write(str(time.time()))
        except Exception:
            pass
        return True

    stock_pos = data.find(STOCK_PALETTE)
    if stock_pos == -1:
        print("[-] Error: Stock Tokyo Night palette signature not found in binary.")
        return False

    print(f"[+] Found stock Tokyo Night palette at offset: {hex(stock_pos)}")
    data[stock_pos : stock_pos + len(NEO_TOKYO_PALETTE)] = NEO_TOKYO_PALETTE

    # Patch Chroma line highlight styles
    chroma_count = 0
    cur = 0
    while True:
        p = data.find(CHROMA_STOCK_HL, cur)
        if p == -1:
            break
        data[p : p + len(CHROMA_STOCK_HL)] = CHROMA_NEO_HL
        chroma_count += 1
        print(f"[+] Patched Chroma highlight at {hex(p)}")
        cur = p + len(CHROMA_NEO_HL)

    print(f"[+] Patched {chroma_count} Chroma line highlight entries.")

    # Write patched candidate to temp file
    temp_patched = os.path.join(agy_dir, 'agy_patched.tmp.exe')
    with open(temp_patched, 'wb') as f:
        f.write(data)

    # Verify candidate binary runs
    print("[*] Verifying candidate binary execution...")
    try:
        proc = subprocess.run([temp_patched, '--help'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
        if proc.returncode != 0:
            print(f"[-] Verification failed with return code {proc.returncode}")
            if os.path.exists(temp_patched):
                os.remove(temp_patched)
            return False
    except Exception as e:
        print(f"[-] Verification error: {e}")
        if os.path.exists(temp_patched):
            os.remove(temp_patched)
        return False

    print("[+] Candidate binary verified successfully!")

    # Backup stock binary if not already backed up
    stock_backup = os.path.join(agy_dir, 'agy.exe.stock')
    try:
        shutil.copy2(agy_path, stock_backup)
        print(f"[+] Stock backup preserved at: {stock_backup}")
    except Exception as e:
        print(f"[!] Warning copying stock backup: {e}")

    # Handle running binary lock via Windows atomic rename
    running_old = os.path.join(agy_dir, f'agy.exe.old.{int(time.time())}')
    
    # Try direct copy first (if no process is running)
    replaced = False
    try:
        shutil.copy2(temp_patched, agy_path)
        os.remove(temp_patched)
        replaced = True
        print("[+] Successfully updated agy.exe in-place!")
    except PermissionError:
        # File is locked by a running process - rename it!
        print("[*] Binary is in use by running process; performing safe swap via rename...")
        os.rename(agy_path, running_old)
        shutil.move(temp_patched, agy_path)
        replaced = True
        print(f"[+] Successfully swapped running binary -> {running_old}")
        print("[+] New agy.exe in place with Neo-Tokyo theme!")

    # Touch stamp file with agy.exe's mtime so watchers know it's patched
    stamp_file = os.path.join(agy_dir, '.neo_tokyo_patched')
    try:
        with open(stamp_file, 'w') as f:
            f.write(str(time.time()))
    except Exception:
        pass

    return replaced

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else None
    success = patch_agy(target)
    sys.exit(0 if success else 1)
