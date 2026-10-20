# Anatomy asset provenance

## Gluteal plates added 2026-10-15

These two local PNGs are unmodified scans from Johannes Sobotta, *Atlas and Text-book of Human Anatomy* (1909). They are historical atlas illustrations, not scans from a current Sobotta edition. The original English labels include older Latin spellings such as “Glutaeus”. No AI generation, upscaling, relabeling or anatomical retouching was applied.

| Local file | Source record | Original image URL | Pixels | SHA-1 |
| --- | --- | --- | --- | --- |
| `glute-superficial-sobotta-1909.png` | [Sobo 1909 294](https://commons.wikimedia.org/wiki/File:Sobo_1909_294.png) | https://upload.wikimedia.org/wikipedia/commons/0/0d/Sobo_1909_294.png | 1476 × 2109 | `c8331940639e0c39563155b67ea3995b7c315a97` |
| `glute-medius-sobotta-1909.png` | [Sobo 1909 295](https://commons.wikimedia.org/wiki/File:Sobo_1909_295.png) | https://upload.wikimedia.org/wikipedia/commons/0/03/Sobo_1909_295.png | 1767 × 2079 | `76790d4079a4a231c2922134e3147f2d10a54114` |

Both source records identify Dr. Johannes Sobotta as author and the 1909 atlas as source. At retrieval they identify the original and mechanical scans as public domain, with [Public Domain Mark 1.0](https://creativecommons.org/publicdomain/mark/1.0/). Local SHA-1 values match the source records. Credit is retained in the UI even though the records identify these as public domain.

Plate 294 shows intact gluteus maximus, the superior medius region/gluteal fascia, fascia lata, iliotibial band and tensor fasciae latae. Plate 295 shows maximus cut/reflected, exposing medius and the short external rotators. Neither is presented as a view exposing minimus.

## Deep gluteal view

`glute-deep-openstax.jpg` is the unmodified full-resolution image from [OpenStax, 1122 Gluteal Muscles that Move the Femur](https://commons.wikimedia.org/wiki/File:1122_Gluteal_Muscles_that_Move_the_Femur.jpg). Original URL: https://upload.wikimedia.org/wikipedia/commons/8/8f/1122_Gluteal_Muscles_that_Move_the_Femur.jpg . Size: 1713 × 2175. Published SHA-1: `48a26b0c6351a2052a16c4fcd338bc092505e492`. The source record identifies OpenStax and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), with an original upload in 2013. Its source is an earlier *Anatomy & Physiology* edition; do not identify this file as an unmodified current 2e image. The posterior panel labels maximus and medius as cut, exposing minimus.

The older, resized `hip-gluteal.jpg` (1280 × 1625) remains unchanged for the other muscle groups. The Mông deep view now uses the full-resolution asset above.

This manifest covers these gluteal plates only; the remaining atlas assets still require their own provenance records.

## Whole-body muscle plates (checked 2026-10-20)

`muscles-anterior.png` and `muscles-posterior.png` (900 × 1620 each) are pixel-identical crops of the local `muscles-front-back.png` (1920 × 1673). They are offset (33, 26) and (1037, 26). Every visible pixel matches, with a maximum channel difference of 0. No other modification was found.

| Local file | SHA-1 |
| --- | --- |
| `muscles-front-back.png` | `af79e6e06232f4aa560468ecac30742dc2421d37` |
| `muscles-anterior.png` | `99934362a2b6818dca3e3df1d999a10efa8f149c` |
| `muscles-posterior.png` | `b23ba383fca6500e963582eb913fa0521ef43793` |

**Source (pixel-verified 2026-10-20):** [Muscles front and back.svg](https://commons.wikimedia.org/wiki/File:Muscles_front_and_back.svg). Its Commons record gives:
- Author: "OpenStax & Tomáš Kebert & umimeto.org".
- Upload: 2020-09-13.
- License: CC BY-SA 4.0.
- Basis: a manual redraw of OpenStax [1105 Anterior and Posterior Views of Muscles.jpg](https://commons.wikimedia.org/wiki/File:1105_Anterior_and_Posterior_Views_of_Muscles.jpg), with the back view in particular modified.

On 2026-10-20 the Commons 1920 px rendering was retrieved from https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Muscles_front_and_back.svg/1920px-Muscles_front_and_back.svg.png . It is 1920 × 1673 RGBA, with SHA-1 `a0fedf6792e6d11f0e61313f9be2317903da210e`.

That rendering is not byte-identical to the local file, but its content is the same:
- 889,212 of 889,245 visible pixels differ by less than 8/255 in every channel.
- The remaining 33 pixels are isolated anti-aliased edge pixels, consistent with a re-run of the SVG rasterizer.

The local file is therefore an unmodified rendering of that SVG. The crops are adaptations under CC BY-SA 4.0, and both screens that use them (Trigger Point and `BodyMapExplorer`) show the attribution through `src/components/MusclePlateCredit.tsx`.

These consequences follow:
- **Not an OpenStax original.** The plates are a simplified redraw, not the OpenStax original, and the posterior view was modified by the redrawer. They have not been compared with the OpenStax original or a current anatomy text, so their muscle borders and layers are unreviewed.
- **Superficial layers only.** The plates show superficial layers. Deep muscles such as pectoralis minor, iliopsoas, quadratus lumborum, piriformis, gluteus minimus, teres minor and soleus (under gastrocnemius) are not exposed. Overlays placed on these plates are orientation regions, not muscle footprints.
- **Overlays are not validated.** Trigger-point overlays, referred-pain zones and lookup regions drawn by the app are not part of the source. A valid source for the background does not validate them.
