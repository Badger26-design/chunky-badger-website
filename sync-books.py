#!/usr/bin/env python3
"""Sync 'Our Books' HTML blocks across all pages using the central BOOKS_DATA configuration.

This script updates pre-rendered HTML inside `<!-- OUR_BOOKS_GRID_START -->` and `<!-- OUR_BOOKS_GRID_END -->`
markers in any HTML file in the project.

Usage:
    python3 sync-books.py           # Apply updates to all HTML pages
    python3 sync-books.py --check   # Report drift without writing (exit 1 if drifted)
"""

import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).parent
SCRIPT_JS = ROOT / "script.js"

# Default book catalog definition matching script.js BOOKS_DATA
DEFAULT_BOOKS = [
    {
        "id": "british-animals",
        "label": "British Animals",
        "title": 'Learn to Draw:<br><span class="text-gold">British Animals</span>',
        "imageSrc": "Pictures/Mockups/UK/Cover/British%20Animals%20Over%20Mockup-no-shadow-transparent.png",
        "imageAlt": "Learn to Draw British Animals book cover mockup by Chunky Badger",
        "imageClass": "",
        "features": [
            "<strong>45+ animals</strong> from woodland, farm &amp; seaside",
            "<strong>6 simple steps</strong> per animal — no reading needed",
            "<strong>Draw &amp; colour</strong> right inside the book"
        ],
        "moreInfoUrl": "product-british-animals.html",
        "amazonUrl": "https://amzn.eu/d/0dFI2cpF",
        "delayClass": ""
    },
    {
        "id": "african-animals",
        "label": "African Animals",
        "title": 'Learn to Draw:<br><span class="text-gold">African Animals</span>',
        "imageSrc": "Pictures/Figma/Images/Our%20Books/CB%20African%20Animals%20Front%20Cover%20mockup-cut.png",
        "imageAlt": "Learn to Draw African Animals book cover mockup by Chunky Badger",
        "imageClass": "product-card-image--african",
        "features": [
            "<strong>40+ animals</strong> from savanna, jungle &amp; rivers",
            "<strong>6 simple steps</strong> per animal — no reading needed",
            "<strong>Draw &amp; colour</strong> right inside the book"
        ],
        "moreInfoUrl": "product-african-animals.html",
        "amazonUrl": "https://amzn.eu/d/0aOUGahP",
        "delayClass": "delay-200"
    }
]


def generate_grid_html(books):
    cards = []
    for book in books:
        img_class = f' {book["imageClass"]}' if book.get("imageClass") else ''
        delay_class = f' {book["delayClass"]}' if book.get("delayClass") else ''
        features_html = "\n".join([f'                                <li>{f}</li>' for f in book["features"]])
        card_html = f'''                    <!-- Card: {book["label"]} -->
                    <div class="product-card reveal{delay_class}">
                        <div class="product-card-image{img_class}">
                            <img src="{book["imageSrc"]}"
                                alt="{book["imageAlt"]}">
                        </div>
                        <div class="product-card-body">
                            <p class="product-card-label">{book["label"]}</p>
                            <h3 class="product-card-title">{book["title"]}</h3>
                            <ul class="styled-list white-check product-card-list">
{features_html}
                            </ul>
                            <div class="product-card-actions">
                                <a href="{book["moreInfoUrl"]}" class="btn more-info-btn">More Info</a>
                                <a href="{book["amazonUrl"]}" target="_blank" class="btn btn-warning">Buy on Amazon</a>
                            </div>
                        </div>
                    </div>'''
        cards.append(card_html)

    grid_body = "\n\n".join(cards)
    return f'''<div class="product-cards-grid" data-books-grid>

{grid_body}

                </div>'''


def main():
    parser = argparse.ArgumentParser(description="Sync 'Our Books' HTML across all pages.")
    parser.add_argument("--check", action="store_true", help="Report drift without modifying files.")
    args = parser.parse_args()

    grid_html = generate_grid_html(DEFAULT_BOOKS)

    pattern = re.compile(
        r"(<!-- OUR_BOOKS_GRID_START -->\s*)(.*?)(<!-- OUR_BOOKS_GRID_END -->)",
        re.DOTALL
    )

    drifted_files = []
    html_files = list(ROOT.rglob("*.html"))

    for filepath in html_files:
        content = filepath.read_text(encoding="utf-8")
        match = pattern.search(content)
        if match:
            current_grid = match.group(2).strip()
            expected_grid = grid_html.strip()
            if current_grid != expected_grid:
                drifted_files.append(filepath)
                if not args.check:
                    new_content = pattern.sub(r"\1" + grid_html + r"\n                \3", content)
                    filepath.write_text(new_content, encoding="utf-8")

    if not drifted_files:
        print("All 'Our Books' blocks are perfectly in sync.")
        return 0

    if args.check:
        print(f"\n{len(drifted_files)} file(s) have drifted 'Our Books' blocks:")
        for f in drifted_files:
            print(f"  - {f.relative_to(ROOT)}")
        print("\nRun `python3 sync-books.py` to sync all files.")
        return 1

    print(f"\nSuccessfully synced 'Our Books' block in {len(drifted_files)} file(s):")
    for f in drifted_files:
        print(f"  - {f.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
