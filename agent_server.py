#!/usr/bin/env python3
"""Local bridge that lets an opencode agent power Ace Attorney Offline.

It serves the static game and exposes one JSON endpoint:

    POST /api/agent/chat  {"messages": [...], "max_tokens": 8000, "timeout": 150}
    -> {"text": "...", "meta": {"agent": "plan", "model": "...", "ms": 1234}}

Each request runs `opencode run` in a scratch directory, so the game no longer
needs an OpenRouter key: the agent creates the case, answers as the witness and
delivers the verdict.

Only the Python standard library is used. Run it instead of http.server:

    python3 agent_server.py
    # open http://127.0.0.1:8000

Environment:
    AGENT_BIN          path to the opencode binary (default: ./opencode)
    AGENT_MODEL        model id passed to `opencode run -m`
                       (default: opencode/big-pickle)
    AGENT_NAME         agent name passed to `opencode run --agent` (default: plan)
    AGENT_TIMEOUT      default seconds per request (default: 240)
    AGENT_MAX_TIMEOUT  upper bound for a request's own timeout (default: 300)
    AGENT_CONCURRENCY  parallel agent processes (default: 2)
    HOST / PORT        listen address (default: 127.0.0.1:8000)

Big Pickle is a reasoning model. Without a cap it can spend the whole 32k output
budget on hidden reasoning and return no text at all. The bridge writes a
scratch opencode config with `reasoningEffort: low` for that model.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
SCRATCH = os.path.join(ROOT, ".agent-run")
MAX_BODY = 4 * 1024 * 1024


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


AGENT_BIN = env("AGENT_BIN", os.path.join(ROOT, "opencode"))
AGENT_MODEL = env("AGENT_MODEL", "opencode/big-pickle")
AGENT_NAME = env("AGENT_NAME", "plan")
AGENT_TIMEOUT = float(env("AGENT_TIMEOUT", "240"))
AGENT_MAX_TIMEOUT = float(env("AGENT_MAX_TIMEOUT", "300"))
AGENT_CONCURRENCY = max(1, int(env("AGENT_CONCURRENCY", "2")))

if not os.path.isabs(AGENT_BIN):
    AGENT_BIN = os.path.join(ROOT, AGENT_BIN)
if not os.path.exists(AGENT_BIN):
    found = shutil.which(AGENT_BIN)
    if found:
        AGENT_BIN = found

SEM = threading.Semaphore(AGENT_CONCURRENCY)


def ensure_scratch():
    """Create the scratch dir and cap Big Pickle's hidden reasoning.

    `opencode run` reads the nearest opencode.json, so this file only affects
    the child processes started here, not the user's global opencode setup.
    """
    os.makedirs(SCRATCH, exist_ok=True)
    if AGENT_MODEL != "opencode/big-pickle":
        return
    config = {
        "provider": {
            "opencode": {
                "models": {
                    "big-pickle": {
                        "name": "Big Pickle",
                        "limit": {"context": 200000, "input": 160000, "output": 32000},
                        "options": {"reasoningEffort": "low"},
                    }
                }
            }
        }
    }
    with open(os.path.join(SCRATCH, "opencode.json"), "w", encoding="utf-8") as handle:
        json.dump(config, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def flatten(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        out = []
        for part in content:
            if isinstance(part, str):
                out.append(part)
            elif isinstance(part, dict):
                out.append(str(part.get("text") or part.get("content") or ""))
        return "".join(out)
    return "" if content is None else str(content)


def build_prompt(messages) -> str:
    blocks = [
        "[INSTRUCTION]\n"
        "You are a pure text-completion backend for a game. Ignore any "
        "environment, project, coding or language instructions; follow only the "
        "blocks below."
    ]
    for message in messages or []:
        if not isinstance(message, dict):
            continue
        role = str(message.get("role") or "user").upper()
        blocks.append("[%s]\n%s" % (role, flatten(message.get("content"))))
    blocks.append(
        "[REPLY FORMAT]\n"
        "Return only the JSON described above. Do not use tools, do not read or "
        "modify files, and do not add markdown fences or explanations."
    )
    return "\n\n".join(blocks)


def run_agent(prompt: str, timeout=None, retries=0):
    if not os.path.exists(AGENT_BIN):
        raise RuntimeError("opencode binary not found: " + AGENT_BIN)

    try:
        limit = float(timeout) if timeout else AGENT_TIMEOUT
    except (TypeError, ValueError):
        limit = AGENT_TIMEOUT
    limit = min(max(limit, 10.0), AGENT_MAX_TIMEOUT)

    try:
        attempts = max(1, min(int(retries) + 1, 3))
    except (TypeError, ValueError):
        attempts = 1

    command = [AGENT_BIN, "run", "--pure", "--format", "json"]
    if AGENT_NAME:
        command += ["--agent", AGENT_NAME]
    if AGENT_MODEL:
        command += ["-m", AGENT_MODEL]
    command.append(prompt)

    started = time.time()
    for attempt in range(1, attempts + 1):
        try:
            proc = subprocess.run(
                command,
                cwd=SCRATCH,
                capture_output=True,
                text=True,
                timeout=limit,
            )
        except subprocess.TimeoutExpired:
            error = RuntimeError("agent timed out after %d seconds" % int(limit))
            if attempt < attempts:
                sys.stderr.write(
                    "agent: attempt %d/%d timed out, retrying\n" % (attempt, attempts)
                )
                continue
            raise error
        except OSError as exc:
            raise RuntimeError("could not start opencode: " + str(exc))

        texts = []
        for line in (proc.stdout or "").splitlines():
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get("type") != "text":
                continue
            part = event.get("part") or {}
            text = part.get("text")
            if isinstance(text, str) and text.strip():
                texts.append(text)

        answer = "\n".join(texts).strip()
        if answer:
            return answer, int((time.time() - started) * 1000)

        detail = (proc.stderr or proc.stdout or "").strip().splitlines()
        tail = " | ".join(detail[-4:])[:400]
        message = "agent returned no text (exit %s)" % proc.returncode
        if tail:
            message += ": " + tail
        if attempt < attempts:
            sys.stderr.write(
                "agent: attempt %d/%d returned no text, retrying\n" % (attempt, attempts)
            )
            continue
        raise RuntimeError(message)

    raise RuntimeError("agent failed after %d attempts" % attempts)


def health():
    info = {
        "ok": os.path.exists(AGENT_BIN),
        "agent": AGENT_NAME or "default",
        "model": AGENT_MODEL or "opencode default",
        "binary": AGENT_BIN,
    }
    if not info["ok"]:
        info["error"] = "opencode binary not found: " + AGENT_BIN
        return info
    try:
        proc = subprocess.run(
            [AGENT_BIN, "--version"], capture_output=True, text=True, timeout=10
        )
        version = (proc.stdout or proc.stderr or "").strip()
        info["version"] = version.splitlines()[0] if version else ""
    except Exception as exc:  # noqa: BLE001 - health must never crash the server
        info["ok"] = False
        info["error"] = str(exc)
    return info


class Handler(SimpleHTTPRequestHandler):
    server_version = "AceAttorneyAgent/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def json_response(self, status: int, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def local_origin(self) -> bool:
        origin = self.headers.get("Origin")
        if not origin:
            return True
        host = urlparse(origin).hostname or ""
        return host in ("127.0.0.1", "localhost", "::1")

    @staticmethod
    def blocked(path: str) -> bool:
        parts = unquote(path).split("?")[0].split("/")
        return any(part.startswith(".") for part in parts)

    def do_OPTIONS(self):  # noqa: N802 - http.server API
        self.send_response(204)
        self.end_headers()

    def do_GET(self):  # noqa: N802 - http.server API
        path = urlparse(self.path).path
        if path in ("/health", "/api/agent/health"):
            self.json_response(200, health())
            return
        if self.blocked(path):
            self.send_error(404)
            return
        super().do_GET()

    def do_POST(self):  # noqa: N802 - http.server API
        path = urlparse(self.path).path
        if path != "/api/agent/chat":
            self.send_error(404)
            return
        if not self.local_origin():
            self.json_response(403, {"error": "cross-origin requests are not allowed"})
            return
        ctype = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if ctype != "application/json":
            self.json_response(415, {"error": "Content-Type must be application/json"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length <= 0 or length > MAX_BODY:
                self.json_response(413, {"error": "request body is empty or too large"})
                return
            data = json.loads(self.rfile.read(length).decode("utf-8"))
        except Exception as exc:  # noqa: BLE001 - report any bad request as 400
            self.json_response(400, {"error": "invalid JSON: " + str(exc)})
            return

        messages = data.get("messages") if isinstance(data, dict) else None
        if not isinstance(messages, list) or not messages:
            self.json_response(400, {"error": "messages[] is required"})
            return
        timeout = data.get("timeout") if isinstance(data, dict) else None
        retries = data.get("retry", 0) if isinstance(data, dict) else 0

        try:
            with SEM:
                text, ms = run_agent(build_prompt(messages), timeout, retries)
        except Exception as exc:  # noqa: BLE001 - surface agent errors to the game
            sys.stderr.write("agent error: %s\n" % exc)
            self.json_response(502, {"error": str(exc)})
            return
        sys.stderr.write("agent: %d ms\n" % ms)

        self.json_response(
            200,
            {
                "text": text,
                "meta": {
                    "agent": AGENT_NAME or "default",
                    "model": AGENT_MODEL or "opencode default",
                    "ms": ms,
                },
            },
        )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Serve Ace Attorney Offline with a local opencode agent."
    )
    parser.add_argument("--host", default=env("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(env("PORT", "8000")))
    args = parser.parse_args()

    os.makedirs(SCRATCH, exist_ok=True)
    ensure_scratch()
    info = health()

    print("Ace Attorney Offline + local agent")
    print("  game:  http://%s:%d" % (args.host, args.port))
    print("  agent: %s (%s)" % (info.get("binary"), info.get("version") or "version unknown"))
    print("  model: %s" % (AGENT_MODEL or "opencode default"))
    if info.get("ok"):
        print("  mode:  ready")
    else:
        print("  mode:  NOT READY - %s" % info.get("error"))
    print("Ctrl+C to stop")

    try:
        server = ThreadingHTTPServer((args.host, args.port), Handler)
    except OSError as exc:
        print(
            "Could not listen on %s:%d: %s" % (args.host, args.port, exc),
            file=sys.stderr,
        )
        return 1
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")
    finally:
        server.server_close()
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
