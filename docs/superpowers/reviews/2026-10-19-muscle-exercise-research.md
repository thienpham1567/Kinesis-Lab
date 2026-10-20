# Muscle and exercise evidence audit — 2026-10-19

Scope: the complete `muscle-hypertrophy-atlas.ts` dataset: 11 groups, 27 subdivision cards, 13 exercise entries and 32 target-role entries. IDs are retained. This audit does **not** establish clinical validity, image identity, accurate 3D attachment locations or individual fascicle trajectories. A qualified anatomist/clinician has not independently reviewed this content or its spatial mapping. Reviewer identity/date remain null.

Runtime claim mappings, source URLs, check dates and actual access scope are in `src/lib/clinical/evidence-muscle.ts`. Each group explicitly names its subdivision IDs; every exercise has its own evidence record. A citation applies only to the claims named in `supportedClaims`, not automatically to all coaching text.

## What was checked

University anatomical teaching tables were read for gross attachments and actions: [Texas Tech muscle tables](https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html), [pectoral region](https://anatomy.ttuhscep.edu/musculoskeletal_system/pectoral_tables.html), [hip/posterior thigh/leg](https://anatomy.ttuhscep.edu/musculoskeletal_system/gluteal_tables.html), and [anterior/medial thigh](https://anatomy.ttuhscep.edu/musculoskeletal_system/thigh_tables.html). Public OpenStax sections were compared for [upper limbs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs), [lower limbs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs), and [abdominal wall](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax).

Search-indexed StatPearls Structure and Function text was available for [deltoid](https://www.ncbi.nlm.nih.gov/books/NBK537056/); only an indexed excerpt was available for [latissimus](https://www.ncbi.nlm.nih.gov/books/NBK448120/). Direct Bookshelf requests returned CAPTCHA. The latissimus excerpt is not treated as a full anatomical chapter review.

Research abstracts were read from PubMed when accessible, indexed PubMed records, or the [Europe PMC MED API](https://europepmc.org/RestfulWebService). Full-text requests often returned CAPTCHA or failed. A few indexed PMC methods/discussion excerpts were read; this is recorded as such and never described as complete full-text review. PubMed indexing/NCBI hosting does not confer approval or validate the app.

OpenStax figure alt text contains some inconsistent lower-limb action descriptions; those descriptions were not adopted over the university anatomy tables. Gross actions should still be independently checked by a qualified reviewer. No textbook/atlas images or full texts were copied into this change.

## Citation repairs

The original dataset contained 20 unique PMID values. The following ten pointed to a different paper from the named citation; several were wholly unrelated to exercise:

| Original PMID | Actual indexed title/topic | Action |
| --- | --- | --- |
| [19209075](https://pubmed.ncbi.nlm.nih.gov/19209075/) | Acute effects of heavy-load exercises, stretching exercises, and heavy-load plus stretching exercises on squat jump and countermovement jump performance | Removed as a row recruitment citation. |
| [32825096](https://pubmed.ncbi.nlm.nih.gov/32825096/) | Interaction of Macrophages and Cholesterol-Dependent Cytolysins: The Impact on Immune Response and Cellular Survival | Removed as a deltoid citation. |
| [24998610](https://pubmed.ncbi.nlm.nih.gov/24998610/) | Recommendations for natural bodybuilding contest preparation: resistance and cardiovascular training | Removed as a deltoid EMG citation. |
| [24149799](https://pubmed.ncbi.nlm.nih.gov/24149799/) | Nutrition for tennis: practical recommendations | Removed as a curl citation. |
| [36826929](https://pubmed.ncbi.nlm.nih.gov/36826929/) | The Prevalence of Educational Neuromyths among Hungarian Pre-Service Teachers | Removed as an elbow-flexion hypertrophy citation. |
| [20179652](https://pubmed.ncbi.nlm.nih.gov/20179652/) | Relationship between core stability, functional movement, and performance | Removed as the claimed McGill paper. |
| [16648330](https://pubmed.ncbi.nlm.nih.gov/16648330/) | Symptoms of posttraumatic stress disorder in a community sample of low-income pregnant women | Removed as an abdominal EMG citation. |
| [37456934](https://pubmed.ncbi.nlm.nih.gov/37456934/) | 2023 Expert Consensus of the Taiwan Society of Cardiology on the Diagnosis and Treatment of Cardiac Amyloidosis | Replaced by final journal Plotkin article [37877099](https://pubmed.ncbi.nlm.nih.gov/37877099/). |
| [31230172](https://pubmed.ncbi.nlm.nih.gov/31230172/) | Early Environmental Unpredictability: Implications for Youth's Perceptions and Social Functioning | Replaced by Kubo [31230110](https://pubmed.ncbi.nlm.nih.gov/31230110/). |
| [38179124](https://pubmed.ncbi.nlm.nih.gov/38179124/) | Copper Tolerance of Novel Rhodotorula sp. Yeast Isolated from Gold Mining Ore in Gia Lai, Vietnam | Replaced by Kinoshita [38156065](https://pubmed.ncbi.nlm.nih.gov/38156065/). |

Additionally, [27660368](https://pubmed.ncbi.nlm.nih.gov/27660368/) is a Nordic/hip-extension morphology intervention, not the named strengthening-framework review. It was removed from this narrowly scoped evidence mapping. The final Plotkin journal article is used instead of the earlier preprint [37461495](https://pubmed.ncbi.nlm.nih.gov/37461495/). Retained research titles now identify the actual paper without adding an “optimal,” “maximizes” or fixed growth-multiplier claim to its title.

## Interpretation changes

- **Chest:** Chaves studied horizontal/incline training over eight weeks in previously untrained young men; thickness differed at one measured site. It does not establish a universally optimal 30-degree dumbbell setup. Pectoralis minor is a separate scapular muscle, not a lower head of pectoralis major. An “inner chest groove” is no longer presented as an independent muscle target. [Chaves abstract](https://pubmed.ncbi.nlm.nih.gov/32922646/)
- **Lats and upper back:** Lehman measured EMG during portions held isometrically; Cools measured scapular EMG ratios in healthy subjects. These observations do not establish long-term head-specific hypertrophy, optimal row angles, correction of all rounded posture, or diagnosis from where fatigue is felt. [Lehman](https://pubmed.ncbi.nlm.nih.gov/15228624/), [Cools](https://pubmed.ncbi.nlm.nih.gov/17606671/)
- **Deltoid:** The 2025 direct cable/dumbbell trial used matched ROM and found similar growth at its measured sites. It does not establish superiority for behind-body cables or a wrist-height pulley. Scapular rotation is allowed during arm elevation. [Larsen](https://pubmed.ncbi.nlm.nih.gov/40692697/)
- **Biceps/forearm:** Anatomical actions and attachments are retained. Long-head “peak,” guaranteed head isolation and maximal supination prescriptions are removed. No longitudinal trial was checked for the exact paired Bayesian/incline configuration; its status is limited.
- **Triceps:** Maeo's within-person 12-week cable study supports greater MRI volume increases with the overhead posture under that protocol, including the combined lateral/medial heads. Its result is not a guaranteed 1.5-fold benefit for every individual or evidence that neutral-arm work exclusively trains the other heads. [Maeo](https://pubmed.ncbi.nlm.nih.gov/35819335/)
- **Abdominal wall:** Gross layers/actions remain. Spinal flexion is not called mandatory for abdominal work, and leg raising is not described as exclusively psoas activity or inherently causing L4–L5 pain. Exact exercise hypertrophy and regional selectivity remain unverified.
- **Glutes:** The final Plotkin trial found similar measured gluteal hypertrophy from squat and hip thrust, despite higher initial hip-thrust sEMG. Medius/minimus changed little. The dataset no longer promises complete TFL exclusion or maximum growth by combining two exercise categories. [Plotkin](https://pubmed.ncbi.nlm.nih.gov/37877099/)
- **Quadriceps/adductors:** Kubo's squat trial and Pedrosa's knee-extension ROM trial have different protocols and outcomes. Neither establishes mandatory reverse Nordics, universal reclined-seat angles, VMO isolation or heel-elevated hack squat superiority. Gracilis inserts on tibia, unlike the femoral insertions of other adductors. [Kubo](https://pubmed.ncbi.nlm.nih.gov/31230110/), [Pedrosa](https://pubmed.ncbi.nlm.nih.gov/33977835/)
- **Hamstrings:** Seated/prone curl results are described by protocol and muscle, without a universal growth multiplier. The short head has no direct hip-extension moment arm; this does not mean it is electrically silent during RDL. The study did not compare RDL or measure injury incidence. [Maeo](https://pubmed.ncbi.nlm.nih.gov/33009197/)
- **Calves:** Standing/seated calf-raise findings distinguish gastrocnemius from soleus. Seated work does not completely isolate soleus. Kassiano used calf raises on a horizontal leg-press machine, not a mandatory two-second pause; the lateral-head difference from full ROM was not significant. Neither study establishes that a pause removes all tendon elasticity or prevents Achilles disease. [Kinoshita](https://pubmed.ncbi.nlm.nih.gov/38156065/), [Kassiano](https://pubmed.ncbi.nlm.nih.gov/37015016/)

The methodological reason to avoid converting surface EMG into maximal hypertrophy or cross-muscle activation rankings is described in [Vigotsky et al.](https://pubmed.ncbi.nlm.nih.gov/29354060/). This review does not supply measured percentages for the app's exercises.

## Data and interface contract

All 32 original `activationPct` numbers were invented rather than traceable measurements. They are replaced by the legacy unavailable sentinel `0`, with a deprecation comment. This must **never** be shown as `0%` or used for ranking, drawing muscle intensity or calculating a total. Use `role` for qualitative presentation. Main integration is responsible for removing all numeric display and weighting.

Every exercise now has `Variable (Phụ thuộc thiết lập)` for `resistanceProfile`. Muscle length and external joint moment are distinct; a cable, machine cam, body position and load path can change the torque profile. The old `lengthenedExercise`/`shortenedExercise` field names are retained for compatibility, but the evidence record explicitly limits them to examples rather than measured profile categories.

All symptom explanations now describe possibilities rather than diagnoses. Fixed reduction percentages, compulsory tempos, precise spinal-level diagnoses, and guaranteed injury-prevention claims were removed. Compound exercise entries such as leg curl/RDL remain because IDs were preserved; their text distinguishes which role applies to which exercise.

## Pending review and provenance

The evidence maps separate literature comparison from expert review. Seven groups have literature-reviewed scope and four have limited scope; three exercise entries have directly relevant longitudinal literature and ten have limited scope. “Literature-reviewed” never means clinically validated, comprehensive evidence or appropriate prescription for an individual.

All 27 subdivision cards are explicitly referenced in group claim mappings. Attachment summaries are gross descriptions, not validated attachment footprints. No mesh-derived angles, tissue measurements, head boundaries or source-to-mesh fascicle paths are certified. Static illustrations, label identity, per-asset license provenance and their relation to the runtime mesh require separate review. Stale edition-dependent figure numbers were generalized; existing credits/licenses were retained pending actual asset provenance review, since a current website license does not establish the license of an older downloaded image.

Required next review: qualified anatomist checks gross claims, naming, image identity and 3D spatial mapping; qualified clinician/exercise specialist checks coaching applicability and symptom wording. Record reviewer identity, qualifications, date and approved scope before changing the pending-review state.

## Automated check

`node scripts/check-muscle-evidence.mjs` checks IDs/coverage, explicit subdivision claim mappings, source indices/access metadata, role values, unavailable activation sentinels and pending-review fields. It checks software/data consistency only. Medical truth, source completeness, image licenses and 3D mapping cannot be established by this script.
