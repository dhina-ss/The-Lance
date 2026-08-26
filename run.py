#!/usr/bin/env python3
"""
Launcher script to run both Flask Backend and React Vite Frontend concurrently.
Usage: python run.py
"""

import os
import sys
import time
import subprocess
import threading
import webbrowser

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, 'frontend')
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')

processes = []
frontend_url = 'http://localhost:9000'
browser_opened = False

def stream_output(process, prefix):
    """Stream stdout/stderr from subprocess with colored/prefixed output."""
    global frontend_url, browser_opened
    try:
        for line in iter(process.stdout.readline, ''):
            if not line:
                break
            line_str = line.rstrip()
            print(f"[{prefix}] {line_str}", flush=True)

            # Detect dynamic Vite URL (e.g. http://localhost:3000/ or http://localhost:3001/)
            if prefix == "FRONTEND" and "Local:" in line_str and "http://" in line_str:
                import re
                match = re.search(r'http://localhost:\d+/?', line_str)
                if match:
                    frontend_url = match.group(0)
                    if not browser_opened:
                        browser_opened = True
                        print(f"[Launcher] Opening {frontend_url} in default browser...", flush=True)
                        try:
                            webbrowser.open(frontend_url)
                        except Exception:
                            pass
    except Exception:
        pass

def run_backend():
    """Start Flask backend server."""
    backend_script = os.path.join(BACKEND_DIR, 'app.py')
    print("[Launcher] Starting Flask Backend server on http://localhost:5000...")
    cmd = [sys.executable, backend_script]
    p = subprocess.Popen(
        cmd,
        cwd=ROOT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(p)
    stream_output(p, "BACKEND")

def run_frontend():
    """Start React Vite frontend dev server."""
    print("[Launcher] Starting React Vite Frontend...")
    npm_cmd = 'npm.cmd' if os.name == 'nt' else 'npm'
    cmd = [npm_cmd, 'run', 'dev']
    p = subprocess.Popen(
        cmd,
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(p)
    stream_output(p, "FRONTEND")

def main():
    print("=" * 60)
    print("Starting The Lance -- Frontend (Vite) & Backend (Flask)")
    print("=" * 60)

    # Start Backend thread
    t_backend = threading.Thread(target=run_backend, daemon=True)
    t_backend.start()

    # Start Frontend thread
    t_frontend = threading.Thread(target=run_frontend, daemon=True)
    t_frontend.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[Launcher] Stopping servers...")
        for p in processes:
            try:
                p.terminate()
            except Exception:
                pass
        sys.exit(0)

if __name__ == '__main__':
    main()
