# Changelog

## 2025-06-11

### Maintenance & Cleanup
- **Removed** 3 empty directories (`Bird - Western Meadow Lark`, `Veteran Geyser`, `Mountain Lion`).
- **Merged** 12 pairs of duplicate folders caused by NPS site listing the same sound under two titles (e.g. `American Coots` and `Bird - American Coots`).
- **Deleted** invalid / truncated media files discovered during merge (0-byte or corrupt downloads).
- **Replaced** the bloated `change_log.txt` (1,160 lines of automated `git status` noise) with this changelog.

### Security
- **Updated** all Python dependencies to latest stable versions:
  - `requests` 2.26.0 → 2.33.1
  - `urllib3` 1.26.6 → 2.6.3
  - `beautifulsoup4` 4.9.3 → 4.14.3
  - `tqdm` 4.66.1 → 4.67.3
  - `idna` 3.2 → 3.13
  - plus transitive dependencies (`certifi`, `chardet`, `charset-normalizer`, `six`, `soupsieve`)
- Fixes **13 known CVEs** including proxy credential leakage, DoS via urllib3 redirects, and insecure temp-file reuse.

### GitHub Actions
- **Disabled** the weekly scheduled cron job — the NPS sound library is essentially static, so automatic runs only produced empty commits.
- **Retained** `workflow_dispatch` so the spider can still be triggered manually when needed.
- Upgraded Action runtime to Python 3.12.
- Added `concurrency` control, `timeout-minutes: 15`, and `fetch-depth: 1` for faster, safer runs.

### Spider Rewrite
- **Unified HTTP client**: replaced mixed `urllib.request.urlopen` + `requests` usage with a single `requests.Session()`.
- **URL-level deduplication**: the crawler now tracks processed URLs, preventing duplicate folders when the NPS site lists the same page under multiple titles.
- **Directory name normalization**: new downloads prefer short names and reuse existing folders with suffix variants (e.g. `Old Faithful Geyser`).
- Improved error handling, type hints, and logging consistency.

### Developer Experience
- Added **13 unit tests** covering directory resolution, MD5 hashing, and duplicate removal logic.
- Added linting & formatting toolchain: `black`, `flake8`, `mypy`, `pytest`, `pre-commit`.
- Added `Makefile`, `pyproject.toml`, `.pre-commit-config.yaml`, and `.github/dependabot.yml`.
- Added `requirements-dev.txt` for reproducible development dependencies.

### Documentation
- **Rewrote README** with clearer copyright notices, compliance statement, and CI badges.
- Added explicit **robots.txt compliance** and **public domain attribution** guidance.
- Fixed LICENSE copyright holder name.
