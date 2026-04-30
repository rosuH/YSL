"""Unit tests for spider.py"""

import hashlib

import pytest

from spider import YellowstoneSoundCrawler, remove_duplicated_files


class TestCrawlerNaming:
    """Tests for directory naming and deduplication logic."""

    @pytest.fixture
    def crawler(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        return YellowstoneSoundCrawler()

    def test_core_name_strips_prefixes(self, crawler):
        assert crawler._core_name("Bird - American Robin") == "American Robin"
        assert crawler._core_name("Birds - Dawn Chorus") == "Dawn Chorus"
        assert crawler._core_name("Geyser - Old Faithful") == "Old Faithful"
        assert crawler._core_name("American Coots") == "American Coots"

    def test_resolve_exact_existing(self, crawler, tmp_path):
        (tmp_path / "American Coots").mkdir()
        (tmp_path / "American Coots" / "file.mp3").write_text("x")
        assert crawler._resolve_target_dir("American Coots") == "American Coots"

    def test_resolve_core_existing(self, crawler, tmp_path):
        (tmp_path / "American Coots").mkdir()
        (tmp_path / "American Coots" / "file.mp3").write_text("x")
        assert crawler._resolve_target_dir("Bird - American Coots") == "American Coots"

    def test_resolve_suffix_variant(self, crawler, tmp_path):
        (tmp_path / "Old Faithful Geyser").mkdir()
        (tmp_path / "Old Faithful Geyser" / "file.mp3").write_text("x")
        assert crawler._resolve_target_dir("Geyser - Old Faithful") == "Old Faithful Geyser"

    def test_resolve_fuzzy_scan(self, crawler, tmp_path):
        (tmp_path / "Common Raven").mkdir()
        (tmp_path / "Common Raven" / "file.mp3").write_text("x")
        assert crawler._resolve_target_dir("Bird - Common Raven") == "Common Raven"

    def test_resolve_prefixed_existing(self, crawler, tmp_path):
        (tmp_path / "Bird - Canada Goose").mkdir()
        (tmp_path / "Bird - Canada Goose" / "file.mp3").write_text("x")
        assert crawler._resolve_target_dir("Canada Goose") == "Bird - Canada Goose"

    def test_resolve_new_prefers_short(self, crawler):
        assert crawler._resolve_target_dir("Bird - New Species") == "New Species"


class TestMd5:
    """Tests for MD5 hash utility."""

    def test_md5_consistency(self, tmp_path):
        f = tmp_path / "test.txt"
        f.write_bytes(b"hello world")
        from spider import _md5

        expected = hashlib.md5(b"hello world").hexdigest()
        assert _md5(str(f)) == expected

    def test_md5_empty_file(self, tmp_path):
        f = tmp_path / "empty.txt"
        f.write_bytes(b"")
        from spider import _md5

        expected = hashlib.md5(b"").hexdigest()
        assert _md5(str(f)) == expected


class TestRemoveDuplicates:
    """Tests for the duplicate-file removal logic."""

    def test_removes_identical_mp3(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "a").mkdir()
        (tmp_path / "b").mkdir()

        data = b"same audio content"
        (tmp_path / "a" / "song.mp3").write_bytes(data)
        (tmp_path / "b" / "song.mp3").write_bytes(data)

        remove_duplicated_files()

        assert not (tmp_path / "b" / "song.mp3").exists()
        assert (tmp_path / "a" / "song.mp3").exists()

    def test_prefers_folder_with_image(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "a").mkdir()
        (tmp_path / "b").mkdir()

        data = b"same audio content"
        (tmp_path / "a" / "song.mp3").write_bytes(data)
        (tmp_path / "b" / "song.mp3").write_bytes(data)
        (tmp_path / "b" / "cover.jpg").write_bytes(b"img")

        remove_duplicated_files()

        # b has more media files (2 vs 1), so a should be deleted
        assert not (tmp_path / "a" / "song.mp3").exists()
        assert (tmp_path / "b" / "song.mp3").exists()
        assert (tmp_path / "b" / "cover.jpg").exists()

    def test_removes_empty_folder(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "a").mkdir()
        (tmp_path / "b").mkdir()

        data = b"same audio content"
        (tmp_path / "a" / "song.mp3").write_bytes(data)
        (tmp_path / "b" / "song.mp3").write_bytes(data)

        remove_duplicated_files()

        assert not (tmp_path / "b").exists()

    def test_keeps_different_files(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        (tmp_path / "a").mkdir()
        (tmp_path / "b").mkdir()

        (tmp_path / "a" / "song.mp3").write_bytes(b"audio a")
        (tmp_path / "b" / "song.mp3").write_bytes(b"audio b")

        remove_duplicated_files()

        assert (tmp_path / "a" / "song.mp3").exists()
        assert (tmp_path / "b" / "song.mp3").exists()
