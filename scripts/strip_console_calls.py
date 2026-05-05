#!/usr/bin/env python3
"""Remove console.log/debug/info/warn/error/table/dir from JS/JSX under src/."""
from __future__ import annotations

import re
import sys
from pathlib import Path

METHODS = "|".join(("log", "debug", "info", "warn", "error", "table", "dir"))
CONSOLE_START = re.compile(rf"\bconsole\.(?:{METHODS})\s*\(")


def find_matching_paren(source: str, open_index: int) -> int:
    """open_index points at '(' of the call; return index of matching ')' or -1."""
    depth = 1
    j = open_index + 1
    n = len(source)
    in_string: str | None = None
    template_expr_depth = 0
    escape = False

    while j < n:
        c = source[j]

        if in_string == "`":
            if escape:
                escape = False
                j += 1
                continue
            if c == "\\":
                escape = True
                j += 1
                continue
            if c == "`":
                in_string = None
                j += 1
                continue
            if c == "$" and j + 1 < n and source[j + 1] == "{":
                template_expr_depth += 1
                j += 2
                continue
            if template_expr_depth > 0 and c == "}":
                template_expr_depth -= 1
                j += 1
                continue
            j += 1
            continue

        if in_string in ("'", '"'):
            if escape:
                escape = False
                j += 1
                continue
            if c == "\\":
                escape = True
                j += 1
                continue
            if c == in_string:
                in_string = None
                j += 1
                continue
            j += 1
            continue

        if c in ("'", '"', "`"):
            in_string = c
            j += 1
            continue

        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
            if depth == 0:
                return j
        j += 1
    return -1


def arrow_console_span(text: str, console_start: int) -> tuple[int, int] | None:
    """If console is the body of (params) => console..., return [lo, hi) to replace with () => {}."""
    j = console_start - 1
    while j >= 0 and text[j] in " \t":
        j -= 1
    if j < 1 or text[j] != ">" or text[j - 1] != "=":
        return None
    j -= 2
    while j >= 0 and text[j] in " \t":
        j -= 1
    if j < 0 or text[j] != ")":
        return None
    close_param = j
    depth = 1
    k = close_param - 1
    while k >= 0 and depth > 0:
        if text[k] == ")":
            depth += 1
        elif text[k] == "(":
            depth -= 1
        k -= 1
    param_open = k + 1

    m = CONSOLE_START.match(text, console_start)
    if not m:
        return None
    open_paren = m.end() - 1
    close_paren = find_matching_paren(text, open_paren)
    if close_paren < 0:
        return None
    hi = close_paren + 1
    return (param_open, hi)


def strip_console_calls(text: str) -> str:
    text = re.sub(r"^\s*//\s*console\.[^\n]*\n", "", text, flags=re.MULTILINE)

    while True:
        m = CONSOLE_START.search(text)
        if not m:
            break
        start = m.start()
        span = arrow_console_span(text, start)
        if span:
            lo, hi = span
            text = text[:lo] + "() => {}" + text[hi:]
            continue

        open_paren = m.end() - 1
        close_paren = find_matching_paren(text, open_paren)
        if close_paren < 0:
            break
        end = close_paren + 1
        while end < len(text) and text[end] in " \t":
            end += 1
        if end < len(text) and text[end] == ";":
            end += 1

        line_end = text.find("\n", end)
        if line_end == -1:
            line_end = len(text)
        rest = text[end:line_end].strip()
        line_start = text.rfind("\n", 0, start) + 1
        if rest == "" or rest == ";":
            new_end = line_end
            if new_end < len(text) and text[new_end] == "\n":
                new_end += 1
            text = text[:line_start] + text[new_end:]
        else:
            text = text[:start] + text[end:]

    return text


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "src"
    if not root.is_dir():
        print("src/ not found", file=sys.stderr)
        sys.exit(1)
    changed = 0
    for path in sorted(root.rglob("*.jsx")) + sorted(root.rglob("*.js")):
        old = path.read_text(encoding="utf-8")
        new = strip_console_calls(old)
        if new != old:
            path.write_text(new, encoding="utf-8")
            changed += 1
            print(path.relative_to(root.parent))
    print(f"Updated {changed} files.")


if __name__ == "__main__":
    main()
