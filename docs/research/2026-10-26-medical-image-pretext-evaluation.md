# Medical image pretext and two-case evaluation

Date: 2026-10-26. Image model: `openai/gpt-image-2.5-sunburst`; dimensions/aspect/quality remain automatic. Final policy version: `medical-image-v2-2026-10-26`.

## Implementation

The fixed server-owned policy is in `src/lib/chat/medical-illustration-policy.ts`. Both the brief planner and the image request receive it. The original user request is retained as delimited task data; selected text and source metadata cannot supply policy overrides.

The policy prioritizes source-supported medical relationships over rendering realism or decorative detail. It covers laterality, viewpoint, planes, superficial/deep layers, continuity of tissues, unambiguous label endpoints, reference frames for arrows, exact Vietnamese lettering, bounded explanatory copy and truthful limitations. Reference edits explicitly preserve unrelated structures and labels.

The server adds canonical claims and sources, including actual read scopes and dates. Focused packs cover elbow flexors and ACL/PCL; other topics use bounded matches from the existing finite curated registry. This is not unrestricted medical coverage or live internet research for every request. Unmatched topics retain an explicit source-gap limitation. Source-only mesh records do not become anatomical evidence.

The planner selects registered claim IDs. Unknown IDs or an empty selection when supported claims are supplied fail before image generation. Drawing-critical attachment facts are retained even if the planner omits their IDs. Model-returned source titles/dates are replaced by canonical source metadata. These checks verify reference identity, not the semantic truth of every sentence or pixel. The code rejects overlong medical copy instead of cutting a term or negation. Images can contain 2–8 short labels plus a separate short explanation; the UI's expected-lettering disclosure includes that explanation and a separate disclosure shows source limitations. New receipts retain the policy version and compiled-prompt SHA-256, with `reviewedBy: null`.

## Sources and expected facts

| Case | Source comparison and reading scope | Expected relationship |
| --- | --- | --- |
| Elbow flexors | [OpenStax A&P 2e §11.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs), forearm movement paragraphs; [TTUHSC El Paso muscle table](https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html), biceps/brachialis rows, checked 2026-10-26 | Brachialis is deep to biceps; both contribute to elbow flexion. Distal biceps goes to the radial tuberosity; brachialis to the proximal ulna/coronoid region. These sources do not validate a generated attachment footprint. |
| Knee cruciates | [AAOS ACL article](https://www.orthoinfo.org/diseases--conditions/anterior-cruciate-ligament-acl-injuries/), Anatomy of the Knee; [AAOS PCL article](https://www.orthoinfo.org/diseases--conditions/posterior-cruciate-ligament-injuries/), introduction/Anatomy, checked 2026-10-26 | ACL/PCL connect femur and tibia; ACL restrains excessive anterior tibial translation and PCL posterior translation relative to the femur. Patella is anterior. Exact footprint dimensions, strain and diagnostic accuracy are outside this comparison. |

For v2, also read [OpenStax §8.2, Ulna and Radius](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-2-bones-of-the-upper-limb) for lateral/medial bones and the radial tuberosity below the neck, and [StatPearls Knee, Structure and Function / Intraarticular ligaments](https://www.ncbi.nlm.nih.gov/sites/books/NBK500017/) for gross ACL/PCL attachment locations. Both checked 2026-10-26. ACL joins the anterior tibial intercondylar area to the posteromedial surface of the lateral femoral condyle; PCL joins the posterior tibial intercondylar area to the anterolateral aspect of the medial femoral condyle. No footprint measurements or patient-specific geometry were accepted from these sources. NCBI hosting does not certify an AI image.

## Method

Run `node scripts/eval-medical-chat-images.mjs` to print the protocol without paid calls. `--apply --url=<deployment>` makes two initial app-route requests without automatic retry, using empty client-selected source lists so server evidence selection is exercised. No patient or student data is used. Receipts, request IDs and image hashes are retained in ignored `.data/medical-image-policy/` artifacts.

Inspect each full-size image against the expected relationships and the actual requested text. Record separately: source-supported wording, visible spatial relationships/label endpoints, legibility, explanatory clarity, and any uncertainty or mismatch. A successful HTTP request, valid hash, attractive image or model self-check does not establish anatomical validity.

## Software verification

Final rerun: 36 image/chat policy checks and 23 text-chat runtime checks passed, along with evidence coverage, shared illustration workflow, build/TypeScript and lint. React Doctor reports 17 warnings, including existing UI/recovery warnings and two new bounded find-in-loop warnings; the claim loops contain at most 12 claims and 8 sources. No rules were suppressed. Software checks do not validate anatomy.

## Image results

Two cases were generated in two iterations: four images total, no automatic retry or alternate image model. The first iteration is preserved under `.data/medical-image-policy/attempt-1/`; the final images/receipts are under `.data/medical-image-policy/`. The private request files contain session cookies and are ignored, not committed. Figures were inspected at original size against the source-supported relationships. This is a limited source comparison, not independent professional review or clinical validation.

| Iteration | Case | App elapsed | Reported image cost | Visual assessment |
| --- | --- | --- | --- | --- |
| v1 | Elbow | 41.132 s | $0.031360 | Partial. Vietnamese explanation and layer distinction were readable, but the bent/profile-like drawing did not convincingly match its anterior-view label; distal attachments were insufficiently distinguished. |
| v1 | ACL/PCL | 46.357 s | $0.049285 | Failed spatial criterion. Text described restraint correctly, but the colored PCL followed a path too similar to the ACL. Correct wording did not repair the drawing. |
| v2 | Elbow | 40.697 s | $0.036000 | Improved, partial. Both panels now show a consistent extended anterior right limb, thumb/radius side and ulna side are coherent, and the superficial/deep distinction and explanatory copy are clear. The inset leader for the radial tuberosity appears to land on tendon/attachment tissue rather than clearly exposed bone; it should not be used to teach a precise attachment footprint. Proximal origins and detailed tissue geometry were not established by this review. |
| v2 | ACL/PCL | 39.989 s | $0.028825 | Meets the tested gross teaching relationships. Patella is anterior on the left in both panels; ACL runs from anterior tibia toward posterior femur, PCL from posterior tibia toward anterior femur. The two paths differ. Arrows and their captions explicitly show restrained tibial translation relative to the femur. Vietnamese explanation is legible. Fine condylar footprints, full three-dimensional geometry and mechanical behavior remain unverified. |

The change between iterations added endpoint-first construction, a prohibition on reusing one structure's geometry with another color, explicit attachment facts that the brief cannot drop, and a neutral extended elbow pose instead of mixing movement and anatomy projections. There is only one output per case per iteration, so these observations do not establish a general success rate.

The two v2 image costs total $0.064825; all four total $0.145470. These are the image provider costs recorded in receipts, excluding brief-model costs. Both v2 calls returned HTTP 200 with matching downloaded asset hashes; this demonstrates transport/storage integrity only.

Final image hashes:

- Elbow: `5562a77b650b92d9e35331e2b9e4f20a6fc8b3c41740dfd583f9f547cd0c44bc`, receipt `97c36711-9db4-41b6-8940-643257420e4a`.
- Knee: `9ca5aca40780df7e61c731edac079f0d5862c114111430df77a78367988b5a64`, receipt `55b484e8-3e6d-4a3e-84cc-eda41ae5d211`.

## Production rollout

Implementation commits `49a1c4a`, `09d3278`, and final `ff45bc8` were pushed to `feature/study-chat-illustrations`. Deployment `dpl_6KmvxpkKr2uraTHrGq6f8AX8tt6N` was built READY and promoted to [Kinesis Lab](https://kinesis-lab.vercel.app/knowledge) on 2026-10-26 following the user's explicit deployment request. The production API with same-origin headers returned HTTP 200 and `medical-image-v2-2026-10-26`, Sunburst, automatic resolution/aspect/quality. Both v2 receipts were subsequently read through the main production domain using their owner session, returning HTTP 200/succeeded with matching image hashes and policy version. Requests without the required origin were rejected with HTTP 403 as designed.

The policy improves the process but does not guarantee medical accuracy for every generated image. The remaining elbow ambiguity is reported, not converted into an approval badge or hidden behind successful software checks.
