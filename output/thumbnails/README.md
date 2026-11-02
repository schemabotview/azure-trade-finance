# Thumbnails

`film.png` is the cover for the single full-course video (`scripts/out/film.mp4`): the **answer**
card on the **dark** theme. Rebuild it, or a variant, with:

```sh
npm run thumb:film                                                   # film.png
npm run thumb:film -- --source map --mark azure --out output/thumbnails/film-map.png
npm run thumb:film -- --mark azure --out output/thumbnails/film-azuremark.png
```

`--source` is `answer` | `map`; `--mark` is `tile` | `azure`; `--theme` is `dark` | `navy` |
`light`.

Kept beside it: `film-map.png`, the finished map from §1.3 taken live from the app, with the Azure
mark. At the ~168px the feed renders its labels are gone and it reads as coloured confetti, while
the answer card keeps "Woodgrove · 97.0%" readable. At that size the Azure A is the most recognisable thing
on either cover; the tile reads only as a blue square with a letter.

## The mark: the repo's tile, or Microsoft's Azure icon

`--mark tile` (default) is `public/favicon.svg`, the GraphL concept tile. It names Azure only in
**text**, which is nominative use and needs no one's permission.

`--mark azure` places Microsoft's "Azure A" icon from its Azure Architecture Icons set, vendored at
`public/vendor/azure-logo.svg`. The script never draws it. It embeds the file as supplied, and
fails if the file is missing. `public/vendor/NOTICE-azure-logo.txt` records where the file came
from and the terms it falls under. Microsoft permits the icons in diagrams, training materials and
documentation, unaltered. A monetised video's cover is the edge of that permission. Fill in the
NOTICE before shipping a cover that wears the icon. This file is a design note, not legal advice.

Sibling repos answer this differently, and correctly so: Python carries the PSF logo with its ™,
aws-ecommerce an owner-supplied AWS mark with an open NOTICE, Spark no project mark at all. Each
project answers for itself.

## The card is real, and states its level

Everything in the answer card is parsed from `spine/gold/07-answer/session.txt` (§10.7), the same
output the scenes quote: the command, Woodgrove's utilisation, exposure and limit, all five rows of
the Gold table (Fabrikam's breach drawn red), and G4's verdict. The script fails if the answer is
not a row of the table, or if a line is missing.

The card's tag is **`LC-EXPOSURE · RUNS LOCALLY`**. That answer was computed by open-source Spark
and Delta on one machine, standing in for Databricks. COURSE-PLAN's invariant is that every frame
states its verification level, and a cover is not an exception.

## Why the film cover is not `graphl-thumb`

The shell's template is a per-course poster: a scene plus a text panel. Cropped into that panel, a
16:9 scene turns to mush at feed size. `thumb-film.mjs` (ported from aws-ecommerce) uses poster
grammar instead: few elements, enormous type, one focal object. Check every change by downscaling
to 168px. This concept publishes the film only, so there are no per-course covers.

## The colours and the guard

The accent is `--brand` from `src/theme.css`, Azure blue `#0078d4` (darkened to `#0063b1` on
`light`). The green and red are graphl-flow's tone palette, `store` `#37b877` and `consume`
`#f0656f`, so the card is painted the way the scenes are. `thumb-film.mjs` fails the build if any
text overflows its box or the card.
