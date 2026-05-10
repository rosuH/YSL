"""Quiet local static server for previewing the atlas.

Browsers cancel media requests when a user switches tracks quickly. The stock
`python -m http.server` prints a full traceback for that normal cancellation.
This helper serves the same files but suppresses those cancelled-write traces.
"""

from __future__ import annotations

import argparse
import functools
import http.server
from pathlib import Path


class QuietAtlasHandler(http.server.SimpleHTTPRequestHandler):
    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            pass


class QuietAtlasServer(http.server.ThreadingHTTPServer):
    allow_reuse_address = True


def preview_entry_path(directory: Path) -> str:
    directory = directory.resolve()
    if (directory / "atlas" / "index.html").exists():
        return "/atlas/"
    if (directory / "index.html").exists():
        return "/"
    return "/"


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the Yellowstone atlas locally.")
    parser.add_argument("port", nargs="?", type=int, default=4173)
    parser.add_argument(
        "--directory",
        default=Path.cwd(),
        type=Path,
        help="Directory to serve; defaults to the current working directory.",
    )
    args = parser.parse_args()

    directory = args.directory.resolve()
    handler = functools.partial(QuietAtlasHandler, directory=str(directory))
    server = QuietAtlasServer(("", args.port), handler)

    print(f"Serving atlas preview from {directory} at http://localhost:{args.port}{preview_entry_path(directory)}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped atlas preview server.")


if __name__ == "__main__":
    main()
