#!/usr/bin/env python3
"""Portable local runtime for the Open Event Management documentation."""

from __future__ import annotations

import argparse
import io
import filecmp
import json
import os
from pathlib import Path
import re
import signal
import shutil
import subprocess
import sys
import tempfile
import tarfile
import time
from typing import Sequence
from urllib.error import URLError
from urllib.parse import quote
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
VENV = ROOT / ".venv"
REQUIREMENTS = ROOT / "requirements.txt"
CONFIG = ROOT / "mkdocs.yml"
SITE = ROOT / "site"
STATE = ROOT / ".docs-runtime.json"
LOG = ROOT / ".docs-runtime.log"
PLATFORM = ROOT / "docs" / "platform"
SYNC_TOOL_VERSION = 1
AUTHORITY_FILE = ROOT / ".product-docs-authority.json"
SYNC_EXCLUDED_NAMES = {
    ".git",
    ".venv",
    "site",
    "cache",
    "__pycache__",
    ".DS_Store",
    "Thumbs.db",
}

ARCHITECTURE_SOURCES = (
    "docs/architecture/d0-logical-current.md",
    "docs/architecture/d1-local-current.md",
    "docs/architecture/d2-kvm-kubernetes-target.md",
    "docs/architecture/d3-rhel-current.md",
    "docs/architecture/d4-qa-gke-minimum-target.md",
    "docs/architecture/gcp-foundation-current.md",
    "docs/architecture/gcp-cicd-current.md",
    "docs/architecture/d5a-prod-gke-runtime-target.md",
    "docs/architecture/d5b-prod-gke-cicd-target.md",
    "docs/architecture/d6-environment-evolution.md",
    "docs/architecture/multi-surface-interaction.md",
    "docs/architecture/ai-01-aiops-ai-architecture.md",
    "docs/architecture/data-authority-replay.md",
    "docs/architecture/evolution/index.md",
)

def source_route(source: str) -> str:
    relative = Path(source.removeprefix("docs/"))
    if relative.name == "index.md":
        return relative.with_suffix(".html").as_posix()
    return relative.with_suffix("").as_posix() + "/index.html"


ARCHITECTURE_ROUTES = tuple(source_route(source) for source in ARCHITECTURE_SOURCES)


def venv_python() -> Path:
    if os.name == "nt":
        return VENV / "Scripts" / "python.exe"
    return VENV / "bin" / "python"


def run(command: Sequence[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    print("+", " ".join(str(part) for part in command))
    return subprocess.run(
        [str(part) for part in command],
        cwd=ROOT,
        check=check,
        text=True,
    )


def git_output(repository: Path, *arguments: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repository), *arguments],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        detail = result.stderr.strip() or result.stdout.strip()
        raise RuntimeError(f"Invalid product repository {repository}: {detail}")
    return result.stdout.strip()


def source_repository(source: Path) -> tuple[Path, Path, str, str]:
    repository = Path(git_output(source, "rev-parse", "--show-toplevel")).resolve()
    if repository != source:
        raise RuntimeError(f"Product source must be the repository root: {repository}")
    authority = json.loads(AUTHORITY_FILE.read_text(encoding="utf-8")) if AUTHORITY_FILE.is_file() else {}
    commit = authority.get("certified_commit") or git_output(repository, "rev-parse", "HEAD")
    docs = repository / authority.get("source_path", "docs")
    if not docs.is_dir():
        raise RuntimeError(f"Product documentation directory not found: {docs}")
    remote = authority.get("product_repository") or git_output(repository, "config", "--get", "remote.origin.url")
    if "@" in remote and "://" in remote:
        remote = remote.split("://", 1)[0] + "://" + remote.rsplit("@", 1)[1]
    return repository, docs, commit, remote


def immutable_source(source: Path) -> tuple[tempfile.TemporaryDirectory[str] | None, Path]:
    """Return an immutable source tree when authority is pinned."""
    if not AUTHORITY_FILE.is_file():
        return None, source
    authority = json.loads(AUTHORITY_FILE.read_text(encoding="utf-8"))
    commit = authority["certified_commit"]
    temporary = tempfile.TemporaryDirectory(prefix="oem-certified-source-")
    archive = subprocess.check_output(["git", "-C", str(source), "archive", commit, authority["source_path"]])
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:") as bundle:
        bundle.extractall(temporary.name)
    return temporary, Path(temporary.name)


def excluded_sync_path(path: Path) -> bool:
    return any(part in SYNC_EXCLUDED_NAMES for part in path.parts) or path.suffix == ".pyc"


def rewrite_repository_links(
    content: str, source_file: Path, repository: Path, docs: Path, remote: str, commit: str
) -> str:
    browser_remote = remote.removesuffix(".git")

    def replace(match: re.Match[str]) -> str:
        target = match.group(2)
        if target.startswith(("#", "/", "http://", "https://", "mailto:")):
            return match.group(0)
        path_text, separator, fragment = target.partition("#")
        candidate = (source_file.parent / path_text).resolve()
        try:
            candidate.relative_to(docs)
            return match.group(0)
        except ValueError:
            pass
        try:
            repository_path = candidate.relative_to(repository)
        except ValueError:
            return match.group(0)
        rewritten = f"{browser_remote}/blob/{commit}/{quote(repository_path.as_posix())}"
        if separator:
            rewritten += f"#{fragment}"
        return f"{match.group(1)}{rewritten}{match.group(3)}"

    return re.sub(r"(!?\[[^\]]*\]\()([^\s)]+)(\))", replace, content)


def build_platform_snapshot(destination: Path, source: Path) -> None:
    temporary, immutable_root = immutable_source(source)
    try:
        source_root = immutable_root / "docs" if temporary else immutable_root / "docs"
        if temporary:
            authority = json.loads(AUTHORITY_FILE.read_text(encoding="utf-8"))
            repository, docs = immutable_root, source_root
            commit = authority["certified_commit"]
            remote = authority["product_repository"]
        else:
            repository, docs, commit, remote = source_repository(source_root.parent)
        destination.mkdir(parents=True)
        for entry in sorted(docs.rglob("*"), key=lambda path: path.relative_to(docs).as_posix()):
            relative = entry.relative_to(docs)
            if excluded_sync_path(relative):
                continue
            if entry.is_symlink():
                raise RuntimeError(f"Symbolic links are not allowed in synchronized docs: {relative}")
            target = destination / relative
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            elif entry.is_file():
                target.parent.mkdir(parents=True, exist_ok=True)
                if entry.suffix.lower() == ".md":
                    content = entry.read_text(encoding="utf-8")
                    target.write_text(
                        rewrite_repository_links(content, entry, repository, docs, remote, commit),
                        encoding="utf-8",
                    )
                else:
                    shutil.copyfile(entry, target)
    finally:
        if temporary:
            temporary.cleanup()

    marker = (
        "# Synchronized product documentation\n\n"
        "GENERATED / SYNCHRONIZED FROM PRODUCT REPOSITORY. DO NOT EDIT MANUALLY.\n\n"
        "Source ownership: `event-management-platform/docs`.\n"
    )
    (destination / ".generated.md").write_text(marker, encoding="utf-8")
    metadata = {
        "source_commit": commit,
        "source_path": "docs",
        "source_repository": remote,
        "sync_tool_version": SYNC_TOOL_VERSION,
    }
    (destination / ".source.json").write_text(
        json.dumps(metadata, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


def directories_equal(left: Path, right: Path) -> bool:
    comparison = filecmp.dircmp(left, right)
    if comparison.left_only or comparison.right_only or comparison.funny_files:
        return False
    if comparison.diff_files:
        return False
    return all(directories_equal(left / name, right / name) for name in comparison.common_dirs)


def cmd_sync_platform(args: argparse.Namespace) -> int:
    source = Path(args.source).expanduser().resolve()
    with tempfile.TemporaryDirectory(prefix="oem-platform-sync-") as temporary:
        snapshot = Path(temporary) / "platform"
        build_platform_snapshot(snapshot, source)
        in_sync = PLATFORM.is_dir() and directories_equal(PLATFORM, snapshot)
        if args.check:
            print("IN SYNC" if in_sync else "DRIFT DETECTED")
            return 0 if in_sync else 3
        if in_sync:
            print("Platform documentation already in sync.")
            return 0
        if PLATFORM.exists():
            shutil.rmtree(PLATFORM)
        shutil.copytree(snapshot, PLATFORM)
    print(f"Platform documentation synchronized from {source}.")
    return 0


def require_runtime() -> Path:
    python = venv_python()
    if not python.exists():
        raise RuntimeError("Documentation environment is missing. Run 'docs install' first.")
    result = subprocess.run(
        [str(python), "-c", "import mkdocs, material, pymdownx"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode:
        raise RuntimeError("Documentation dependencies are incomplete. Run 'docs install'.")
    return python


def cmd_install(_: argparse.Namespace) -> int:
    if not REQUIREMENTS.is_file():
        raise RuntimeError(f"Dependency declaration not found: {REQUIREMENTS}")
    python = venv_python()
    if not python.exists():
        run([sys.executable, "-m", "venv", str(VENV)])
    run([str(python), "-m", "pip", "install", "-r", str(REQUIREMENTS)])
    run(
        [
            str(python),
            "-c",
            (
                "import sys, mkdocs, material, pymdownx; "
                "print('Python', sys.version.split()[0]); "
                "print('MkDocs', mkdocs.__version__); "
                "print('Material', material.__version__); "
                "print('PyMdown', pymdownx.__version__)"
            ),
        ]
    )
    return 0


def mkdocs_build(output: Path, strict: bool = True) -> None:
    python = require_runtime()
    command = [
        str(python),
        "-m",
        "mkdocs",
        "build",
        "--config-file",
        str(CONFIG),
        "--site-dir",
        str(output),
    ]
    if strict:
        command.append("--strict")
    run(command)


def cmd_build(args: argparse.Namespace) -> int:
    output = Path(args.site_dir).expanduser().resolve() if args.site_dir else SITE
    mkdocs_build(output, strict=not args.no_strict)
    print(f"Documentation built at {output}")
    return 0


def validate_sources() -> None:
    missing = [path for path in ARCHITECTURE_SOURCES if not (ROOT / path).is_file()]
    if missing:
        raise RuntimeError("Missing architecture sources: " + ", ".join(missing))
    config_text = CONFIG.read_text(encoding="utf-8")
    absent_from_nav = [
        path.removeprefix("docs/") for path in ARCHITECTURE_SOURCES if path.removeprefix("docs/") not in config_text
    ]
    if absent_from_nav:
        raise RuntimeError("Architecture pages missing from navigation: " + ", ".join(absent_from_nav))


def cmd_validate(_: argparse.Namespace) -> int:
    validate_sources()
    with tempfile.TemporaryDirectory(prefix="oem-docs-validate-") as temporary:
        output = Path(temporary) / "site"
        mkdocs_build(output, strict=True)
        missing = [route for route in ARCHITECTURE_ROUTES if not (output / route).is_file()]
        if missing:
            raise RuntimeError("Missing generated architecture routes: " + ", ".join(missing))
    print("Documentation validation passed: strict build and architecture routes are valid.")
    return 0


def load_state() -> dict[str, object] | None:
    if not STATE.is_file():
        return None
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def process_running(pid: int) -> bool:
    try:
        os.kill(pid, 0)
    except (OSError, ProcessLookupError):
        return False
    return True


def health_url(host: str, port: int) -> str:
    client_host = "127.0.0.1" if host in {"0.0.0.0", "::"} else host
    return f"http://{client_host}:{port}/"


def http_healthy(host: str, port: int, timeout: float = 2.0) -> bool:
    try:
        with urlopen(health_url(host, port), timeout=timeout) as response:
            return 200 <= response.status < 400
    except (OSError, URLError):
        return False


def current_state() -> tuple[dict[str, object] | None, bool]:
    state = load_state()
    if not state:
        return None, False
    try:
        pid = int(state["pid"])
    except (KeyError, TypeError, ValueError):
        return state, False
    return state, process_running(pid)


def cmd_start(args: argparse.Namespace) -> int:
    state, running = current_state()
    if running:
        raise RuntimeError(f"Documentation server is already running with PID {state['pid']}.")
    if state and STATE.exists():
        STATE.unlink()

    python = require_runtime()
    command = [
        str(python),
        "-m",
        "mkdocs",
        "serve",
        "--config-file",
        str(CONFIG),
        "--dev-addr",
        f"{args.host}:{args.port}",
    ]
    creationflags = 0
    popen_options: dict[str, object] = {}
    if os.name == "nt":
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS
    else:
        popen_options["start_new_session"] = True

    with LOG.open("ab") as log:
        process = subprocess.Popen(
            command,
            cwd=ROOT,
            stdin=subprocess.DEVNULL,
            stdout=log,
            stderr=subprocess.STDOUT,
            creationflags=creationflags,
            **popen_options,
        )
    state_data = {
        "pid": process.pid,
        "host": args.host,
        "port": args.port,
        "started": time.time(),
    }
    STATE.write_text(json.dumps(state_data, indent=2) + "\n", encoding="utf-8")

    for _ in range(50):
        if process.poll() is not None:
            STATE.unlink(missing_ok=True)
            raise RuntimeError(f"Documentation server exited early. Inspect {LOG}.")
        if http_healthy(args.host, args.port, timeout=0.5):
            print(f"Documentation server started with PID {process.pid}.")
            print(f"Local URL: {health_url(args.host, args.port)}")
            if args.host in {"0.0.0.0", "::"}:
                print("LAN mode enabled; use this host's LAN address with the configured port.")
            return 0
        time.sleep(0.1)

    terminate_process(process.pid)
    STATE.unlink(missing_ok=True)
    raise RuntimeError(f"Documentation server did not become healthy. Inspect {LOG}.")


def terminate_process(pid: int) -> None:
    try:
        os.kill(pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    for _ in range(50):
        if not process_running(pid):
            return
        time.sleep(0.1)
    try:
        os.kill(pid, getattr(signal, "SIGKILL", signal.SIGTERM))
    except ProcessLookupError:
        pass


def cmd_stop(_: argparse.Namespace) -> int:
    state, running = current_state()
    if not state:
        print("Documentation server is not running.")
        return 0
    if running:
        terminate_process(int(state["pid"]))
    STATE.unlink(missing_ok=True)
    print("Documentation server stopped.")
    return 0


def cmd_status(_: argparse.Namespace) -> int:
    state, running = current_state()
    if not state or not running:
        print("Documentation server is stopped.")
        return 1
    host, port = str(state["host"]), int(state["port"])
    health = "healthy" if http_healthy(host, port) else "unhealthy"
    print(f"Documentation server PID {state['pid']} is running ({health}) at {health_url(host, port)}")
    return 0 if health == "healthy" else 1


def cmd_health(_: argparse.Namespace) -> int:
    state, running = current_state()
    if not state or not running:
        print("Documentation server health: DOWN")
        return 1
    healthy = http_healthy(str(state["host"]), int(state["port"]))
    print("Documentation server health:", "UP" if healthy else "DOWN")
    return 0 if healthy else 1


def cmd_restart(args: argparse.Namespace) -> int:
    cmd_stop(args)
    return cmd_start(args)


def cmd_publish(_: argparse.Namespace) -> int:
    print("Publishing is not enabled. Use the controlled documentation release workflow.")
    return 2


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(prog="docs", description=__doc__)
    commands = result.add_subparsers(dest="command", required=True)
    commands.add_parser("install", help="Create .venv and install documentation dependencies.").set_defaults(func=cmd_install)

    build = commands.add_parser("build", help="Build documentation with strict checks by default.")
    build.add_argument("--site-dir", help="Override the generated site directory.")
    build.add_argument("--no-strict", action="store_true", help="Disable strict mode for exploratory builds.")
    build.set_defaults(func=cmd_build)

    commands.add_parser("validate", help="Run strict build and architecture integrity checks.").set_defaults(func=cmd_validate)
    sync = commands.add_parser("sync-platform", help="Synchronize product-owned docs into docs/platform.")
    sync.add_argument("--source", required=True, help="Path to the event-management-platform repository root.")
    sync.add_argument("--check", action="store_true", help="Detect drift without modifying files.")
    sync.set_defaults(func=cmd_sync_platform)
    for name, function in (("start", cmd_start), ("restart", cmd_restart)):
        command = commands.add_parser(name, help=f"{name.title()} the local documentation server.")
        command.add_argument("--host", default="127.0.0.1")
        command.add_argument("--port", default=8000, type=int)
        command.set_defaults(func=function)
    commands.add_parser("stop", help="Stop the managed documentation server.").set_defaults(func=cmd_stop)
    commands.add_parser("status", help="Show managed server process and health state.").set_defaults(func=cmd_status)
    commands.add_parser("health", help="Check the managed server over HTTP.").set_defaults(func=cmd_health)
    commands.add_parser("publish", help="Reserved for a future controlled release workflow.").set_defaults(func=cmd_publish)
    return result


def main() -> int:
    args = parser().parse_args()
    try:
        return int(args.func(args))
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"docs: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
