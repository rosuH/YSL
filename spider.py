#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Yellowstone Sound Library Crawler

This script crawls the Yellowstone National Park sound library and downloads
audio files and associated images. It deduplicates entries by URL to avoid
creating multiple folders for the same sound page (e.g. "American Coots" and
"Bird - American Coots" point to the same page).
"""

import argparse
import glob
import hashlib
import logging
import os
import re
import shutil
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup, Tag
from tqdm import tqdm

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("YSL-Spider")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL = "https://www.nps.gov"
SOUND_LIBRARY_URL = "https://www.nps.gov/yell/learn/photosmultimedia/soundlibrary.htm"
DEFAULT_SLEEP_TIME = 2
MAX_RETRIES = 3


class YellowstoneSoundCrawler:
    """Crawler for the Yellowstone National Park sound library."""

    def __init__(
        self,
        base_url: str = BASE_URL,
        sleep_time: float = DEFAULT_SLEEP_TIME,
        max_retries: int = MAX_RETRIES,
    ) -> None:
        self.base_url = base_url
        self.sleep_time = sleep_time
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": ("Mozilla/5.0 YSL-Spider (https://github.com/rosuH/YSL)")})
        # Track processed URLs to avoid duplicate folders for the same page.
        self._processed_urls: set[str] = set()

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    # ------------------------------------------------------------------
    # Directory naming
    # ------------------------------------------------------------------
    _DIR_PREFIXES = ("Bird - ", "Birds - ", "Geyser - ")

    def _core_name(self, name: str) -> str:
        """Return *name* with known prefixes stripped."""
        for prefix in self._DIR_PREFIXES:
            if name.startswith(prefix):
                return name[len(prefix) :]
        return name

    def _resolve_target_dir(self, animal_name: str) -> str:
        """Pick a local directory name for *animal_name*.

        If a directory already exists — either the exact name, the
        short/core variant, or a known suffix variant — we reuse it.
        Otherwise we prefer the short (prefix-free) name for new downloads.
        """
        exact = animal_name.strip()
        core = self._core_name(exact)

        candidates = [exact, core]

        # Known suffix variations (e.g. "Old Faithful" vs "Old Faithful Geyser")
        for suffix in (" Geyser",):
            candidates.append(core + suffix)

        # Also scan existing directories for any whose core name matches.
        for d in os.listdir("."):
            if os.path.isdir(d) and os.listdir(d) and not d.startswith("."):
                if self._core_name(d).lower() == core.lower():
                    candidates.append(d)

        for cand in candidates:
            if os.path.isdir(cand) and os.listdir(cand):
                return cand

        # Nothing exists yet → prefer short name for new folders.
        return core

    def _full_url(self, href: str | None) -> str | None:
        if href is None:
            return None
        return str(urljoin(self.base_url, href))

    def _get(self, url: str, retries: int = 0) -> BeautifulSoup | None:
        """Fetch *url* with retries and exponential back-off."""
        if not url:
            return None

        time.sleep(self.sleep_time)
        try:
            logger.debug("Fetching %s", url)
            resp = self.session.get(url, timeout=30)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
        except requests.RequestException as exc:
            if retries >= self.max_retries:
                logger.error("Max retries reached, skipping: %s", url)
                return None
            wait = self.sleep_time * (2**retries)
            logger.warning("Request failed (%s), retrying in %ss: %s", exc, wait, url)
            time.sleep(wait)
            return self._get(url, retries + 1)
        except Exception as exc:
            logger.error("Failed to fetch %s: %s", url, exc)
            return None

    def _download(self, url: str, filename: str) -> bool:
        """Download *url* to *filename* with a progress bar."""
        try:
            with self.session.get(url, stream=True, timeout=60) as resp:
                resp.raise_for_status()
                total = int(resp.headers.get("content-length", 0))
                with (
                    open(filename, "wb") as fh,
                    tqdm(
                        desc=os.path.basename(filename),
                        total=total,
                        unit="B",
                        unit_scale=True,
                        unit_divisor=1024,
                    ) as bar,
                ):
                    for chunk in resp.iter_content(chunk_size=8192):
                        if chunk:
                            fh.write(chunk)
                            bar.update(len(chunk))
            return True
        except Exception as exc:
            logger.error("Download failed %s: %s", url, exc)
            if os.path.exists(filename):
                os.remove(filename)
            return False

    # ------------------------------------------------------------------
    # Page processing
    # ------------------------------------------------------------------
    def process_sound_page(self, page_url: str, animal_name: str) -> bool:
        """Parse a sound detail page and download its audio and image."""
        bs_obj = self._get(page_url)
        if not bs_obj:
            return False

        try:
            page_title_el = bs_obj.find(class_="page-title")
            if not page_title_el:
                logger.warning("No page-title found on %s", page_url)
                return False
            page_title = page_title_el.get_text(strip=True)

            # Find the primary image
            img_obj = bs_obj.find(
                "img",
                attrs={
                    "src": re.compile(r"images.*\.jpg"),
                    "alt": True,
                    "title": True,
                },
            )

            # Find the audio source
            audio = bs_obj.find(
                "source",
                attrs={"src": re.compile(r"\.mp3"), "type": "audio/mp3"},
            )

            if not audio:
                logger.warning("No audio found on %s", page_url)
                return False

            # Build target directory from the link text (animal_name) rather
            # than the <h1> on the detail page — this keeps the folder name
            # consistent with the listing page.
            target_dir = self._resolve_target_dir(animal_name)
            os.makedirs(target_dir, exist_ok=True)
            original_dir = os.getcwd()
            os.chdir(target_dir)
            try:
                # Image
                if img_obj and isinstance(img_obj, Tag):
                    img_url = self._full_url(img_obj.attrs.get("src"))
                    author = bs_obj.find("p", class_="figcredit")
                    date_dd = bs_obj.find("dd", string=re.compile(r"\d{4}-\d{2}-\d{2}"))

                    meta_parts = []
                    if author:
                        meta_parts.append(author.get_text().replace("/", "_"))
                    if date_dd:
                        meta_parts.append(date_dd.get_text())

                    img_name = f"{page_title}_{'_'.join(meta_parts)}.jpg" if meta_parts else f"{page_title}.jpg"
                    if img_url:
                        self._download(img_url, img_name)

                # Audio
                if audio and isinstance(audio, Tag):
                    audio_url = self._full_url(audio.attrs.get("src"))
                audio_name = f"{page_title}.mp3"
                if audio_url:
                    self._download(audio_url, audio_name)

                return True
            finally:
                os.chdir(original_dir)

        except AttributeError as exc:
            logger.error("Parse error on %s: %s", page_url, exc)
        except Exception as exc:
            logger.error("Error processing %s: %s", page_url, exc)

        return False

    # ------------------------------------------------------------------
    # Main crawl
    # ------------------------------------------------------------------
    def crawl_sound_library(self) -> bool:
        """Crawl the sound-library index and process every unique link."""
        logger.info("Starting crawl of %s", SOUND_LIBRARY_URL)

        bs_obj = self._get(SOUND_LIBRARY_URL)
        if not bs_obj:
            return False

        links = bs_obj.find_all(id=re.compile(r"sounds-"))
        logger.info("Found %d link(s) on index page", len(links))

        success_count = 0
        skip_count = 0
        fail_count = 0

        for link in links:
            animal_name = link.get_text().rstrip()
            href = link.attrs.get("href")
            full_url = self._full_url(href)

            if not full_url:
                logger.warning("[%s] Missing href, skipping", animal_name)
                continue

            # Deduplicate by URL — the NPS site lists the same page twice
            # under different titles (e.g. "American Coots" and
            # "Bird - American Coots").
            if full_url in self._processed_urls:
                logger.info("[%s] URL already processed (%s), skipping", animal_name, full_url)
                skip_count += 1
                continue
            self._processed_urls.add(full_url)

            # Also skip if a local folder already has content for this name.
            if os.path.isdir(animal_name) and os.listdir(animal_name):
                logger.info("[%s] Folder already exists and is not empty, skipping", animal_name)
                skip_count += 1
                continue

            logger.info("Processing [%s]", animal_name)
            if self.process_sound_page(full_url, animal_name):
                success_count += 1
            else:
                fail_count += 1

        logger.info(
            "Crawl complete — success: %d, skipped: %d, failed: %d",
            success_count,
            skip_count,
            fail_count,
        )
        return True


# ---------------------------------------------------------------------------
# Post-processing: remove duplicate files
# ---------------------------------------------------------------------------
def _md5(file_name: str) -> str:
    h = hashlib.md5()
    with open(file_name, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def remove_duplicated_files() -> None:
    """Delete duplicate MP3 and image files based on MD5 hashes.

    When duplicates are found, the folder that also contains the most
    associated files is preferred.  Empty folders are removed afterwards.
    """
    logger.info("Checking for duplicate media files...")

    processed = 0

    for pattern in ("*/*.mp3", "*/*.jpg"):
        files_map: dict[str, str] = {}
        duplicates: list[tuple[str, str, str]] = []

        for file_name in glob.iglob(pattern, recursive=False):
            file_md5 = _md5(file_name)
            if file_md5 not in files_map:
                files_map[file_md5] = file_name
            else:
                logger.info("Duplicate found: %s (same as %s)", file_name, files_map[file_md5])
                duplicates.append((file_name, files_map[file_md5], file_md5))

        for dup, orig, file_md5 in duplicates:
            dup_dir = os.path.dirname(dup)
            orig_dir = os.path.dirname(orig)

            media_exts = (".mp3", ".jpg", ".jpeg", ".png")
            dup_support = sum(1 for f in os.listdir(dup_dir) if f.lower().endswith(media_exts))
            orig_support = sum(1 for f in os.listdir(orig_dir) if f.lower().endswith(media_exts))

            if dup_support > orig_support:
                to_delete = orig
                files_map[file_md5] = dup
                logger.info(
                    "Keeping %s (%d files) over %s (%d files)",
                    dup,
                    dup_support,
                    orig,
                    orig_support,
                )
            else:
                to_delete = dup
                logger.info(
                    "Keeping %s (%d files) over %s (%d files)",
                    orig,
                    orig_support,
                    dup,
                    dup_support,
                )

            try:
                if os.path.exists(to_delete):
                    os.remove(to_delete)
                    logger.info("Deleted: %s", to_delete)

                    dir_path = os.path.dirname(to_delete)
                    if os.path.isdir(dir_path) and not os.listdir(dir_path):
                        shutil.rmtree(dir_path)
                        logger.info("Removed empty folder: %s", dir_path)
            except Exception as exc:
                logger.error("Failed to delete %s: %s", to_delete, exc)

        processed += len(duplicates)

    logger.info("Duplicate check complete — processed %d pair(s)", processed)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Yellowstone Sound Library Crawler")
    parser.add_argument(
        "--sleep",
        type=float,
        default=DEFAULT_SLEEP_TIME,
        help=f"Request delay in seconds (default: {DEFAULT_SLEEP_TIME})",
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=MAX_RETRIES,
        help=f"Max retries per request (default: {MAX_RETRIES})",
    )
    parser.add_argument(
        "--skip-duplicates",
        action="store_true",
        help="Skip the post-crawl duplicate-file check",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable debug logging",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_arguments()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    crawler = YellowstoneSoundCrawler(
        sleep_time=args.sleep,
        max_retries=args.retries,
    )

    crawler.crawl_sound_library()

    if not args.skip_duplicates:
        remove_duplicated_files()

    logger.info("All done!")


if __name__ == "__main__":
    main()
