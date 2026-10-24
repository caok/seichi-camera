"""Publish the single-file build to FeedMob Pages.

FeedMob Pages' multi-file storage isn't configured server-side, so we publish the self-contained
dist-single/index.html (JS, CSS and images inlined).

Usage:
    npm run build && .venv/bin/python scripts/inline_build.py
    FEEDMOB_PAGES_TOKEN=... python3 scripts/publish_feedmob.py [--page-id ID]

Without --page-id a new page is created; with it the existing page is updated in place
(same URL). Prints the page URL.
"""
import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

API = "https://pages.feedmob.com/api/pages"
HTML = Path(__file__).resolve().parent.parent / "dist-single" / "index.html"
META = {
    "owner": "clark",
    "slug": "seichi-camera",
    "title": "Seichi Camera · 圣地巡礼相机",
    "description": "Hackathon: line up famous Tokyo anime scenes with your phone camera and share an anime-vs-reality card.",
    "visibility": "unlisted",
    "tags": ["Hackathon"],
}
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page-id")
    args = ap.parse_args()
    token = os.environ.get("FEEDMOB_PAGES_TOKEN") or sys.exit("set FEEDMOB_PAGES_TOKEN")

    body = {**META, "html": HTML.read_text()}
    url, method = (f"{API}/{args.page_id}", "PUT") if args.page_id else (API, "POST")
    if args.page_id:
        body.pop("owner")
        body.pop("slug")
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(), method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            res = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:500]}")
    data = res.get("data") or {}
    print(json.dumps({k: data.get(k) for k in ("id", "url", "owner", "slug", "visibility")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
