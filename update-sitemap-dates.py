#!/usr/bin/env python3
"""Sync sitemap.xml <lastmod> values to each page's real last commit date.

Stale lastmod values suppress Google's re-crawl priority: if the sitemap
claims a post has not changed since June, Google deprioritises re-reading it.
Run this after any content change, before pushing.

    python3 update-sitemap-dates.py            # apply
    python3 update-sitemap-dates.py --check    # report only, exit 1 if drifted

Only <lastmod> is touched. <changefreq> and <priority> are left alone, and
URLs are neither added nor removed — add new pages to sitemap.xml by hand.

Note: this reports the date of the last commit touching each file. After a
sweeping mechanical edit (a site-wide nav change, say) that will bump every
page. lastmod is meant to signal *significant* change, so in that case fix
the affected entries by hand rather than letting a cosmetic commit reset
every date.
"""

import argparse
import pathlib
import re
import subprocess
import sys

SITEMAP = pathlib.Path(__file__).parent / "sitemap.xml"
BASE = "https://www.chunkybadger.com/"


def last_commit_date(path):
    result = subprocess.run(
        ["git", "log", "-1", "--format=%cs", "--", str(path)],
        capture_output=True, text=True, cwd=SITEMAP.parent,
    )
    return result.stdout.strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="report drift without writing")
    args = ap.parse_args()

    text = SITEMAP.read_text()
    drift = []

    def fix_block(match):
        block = match.group(0)
        loc = re.search(r"<loc>(.*?)</loc>", block).group(1)
        rel = loc.replace(BASE, "") or "index.html"
        path = SITEMAP.parent / rel
        if not path.exists():
            print(f"  ! {rel} is in the sitemap but not on disk", file=sys.stderr)
            return block
        date = last_commit_date(rel)
        if not date:
            return block

        def replace(lastmod):
            if lastmod.group(1) != date:
                drift.append((rel, lastmod.group(1), date))
            return f"<lastmod>{date}</lastmod>"

        return re.sub(r"<lastmod>(.*?)</lastmod>", replace, block)

    updated = re.sub(r"<url>.*?</url>", fix_block, text, flags=re.S)

    for rel, old, new in drift:
        print(f"  {rel:<52} {old} -> {new}")

    if not drift:
        print("sitemap dates are in sync")
        return 0

    if args.check:
        print(f"\n{len(drift)} entr(ies) drifted — run without --check to fix")
        return 1

    SITEMAP.write_text(updated)
    print(f"\n{len(drift)} entr(ies) updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
