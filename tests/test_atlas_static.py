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

    stylesheet = page.find("link", rel="stylesheet")
    script = page.find("script", src=True)

    assert stylesheet["href"] == "styles.css"
    assert script["src"] == "app.js"


def test_index_contains_required_application_regions():
    page = load_page()

    for element_id in [
        "route-map",
        "route-list",
        "current-stop",
        "audio-player",
        "status-message",
    ]:
        assert page.find(id=element_id), element_id


def test_index_contains_accessible_navigation_buttons():
    page = load_page()

    previous_button = page.find("button", id="previous-stop")
    next_button = page.find("button", id="next-stop")

    assert previous_button
    assert previous_button.get("aria-label") == "Previous stop"
    assert next_button
    assert next_button.get("aria-label") == "Next stop"
