"""Static checks for the Dawn to Night atlas page."""

from pathlib import Path

from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "atlas" / "index.html"


def load_page():
    return BeautifulSoup(INDEX_PATH.read_text(encoding="utf-8"), "html.parser")


def test_atlas_index_exists():
    assert INDEX_PATH.exists()


def test_index_references_local_css_and_javascript():
    page = load_page()

    stylesheet_hrefs = [
        stylesheet["href"] for stylesheet in page.find_all("link", rel="stylesheet")
    ]
    script_sources = [script["src"] for script in page.find_all("script", src=True)]

    assert "styles.css" in stylesheet_hrefs
    assert "app.js" in script_sources


def test_index_contains_radical_geomorphic_regions():
    page = load_page()

    for element_id in [
        "rupture-nav",
        "rupture-hero",
        "fault-lines",
        "listening-slab",
        "audio-player",
        "strata-deck",
        "specimen-fragment",
        "source-status",
    ]:
        assert page.find(id=element_id), element_id


def test_index_contains_accessible_audio_navigation_buttons():
    page = load_page()

    previous_button = page.find("button", id="previous-stop")
    next_button = page.find("button", id="next-stop")

    assert previous_button
    assert previous_button.get("aria-label") == "Previous stop"
    assert next_button
    assert next_button.get("aria-label") == "Next stop"


def test_strata_deck_and_specimen_fragment_are_labelled():
    page = load_page()

    strata_deck = page.find(id="strata-deck")
    specimen_fragment = page.find(id="specimen-fragment")

    assert strata_deck
    assert strata_deck.get("aria-label") == "Dawn to Night strata deck"
    assert specimen_fragment
    assert specimen_fragment.get("aria-labelledby") == "specimen-heading"

    specimen_heading = page.find(id=specimen_fragment["aria-labelledby"])
    assert specimen_heading
    assert specimen_heading.get_text(strip=True)
