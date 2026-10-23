# Seedream anatomy switch

Date: 2026-10-23. User selected Seedream after viewing the two anatomy samples; primary purpose is drawing body anatomy, without requiring exercises. This supersedes the FLUX default in the earlier implementation plan; historical research and receipts stay unchanged.

## Applied

- Server pins `bytedance-seed/seedream-5-0-flash`, provider `seed`, one image per explicit action, no fallback or automatic retry. Existing bounds, local library, export and attachment behavior are retained.
- Price parser accepts resolution-specific prices or the provider's flat output-image price. Read public Seedream endpoint metadata on 2026-10-23: $0.018/output image for both supported 1K/2K settings. Dated fallback estimates are separately labeled. Actual usage.cost remains separate and may be null.
- New composer defaults to 2K; opening an existing image for editing preserves its receipt's resolution. The UI provides seven authored anatomy region briefs: upper limb, whole body, shoulder, trunk, hip/pelvis, thigh/knee, and lower leg/foot. Free text specifies the desired structure, view and layer; optional reference upload remains available.
- Replaced exercise-photography prompt instructions with a simulated anatomical teaching model and requested muscle/bone/tendon relationships. It requests coherent laterality and layers, avoids generated in-image labels and fabricated measurements, and supports a structural reference. A prompt is not a guarantee of structural fidelity.
- Source context comes from selected OpenStax anatomy sections; the receipt stores actual source-check dates and reading scope. New receipts mark purpose=anatomy and reviewedBy=null. This is image-context metadata, not new claim-level anatomical knowledge or medical validation. Published source images were not downloaded or sent upstream. The core Atlas evidence registry remains unchanged.
- Historical labels derive from receipt.model/provider. Old FLUX IDs, exercise preset IDs, sources, hashes, captions and attachments were not migrated or overwritten. New edits produce a new Seedream receipt and preserve the parent ID.

## Checks actually completed

- `npx tsc --noEmit`: exit 0, after final changes.
- Focused ESLint for illustrations, API route, ChatPanel, Movement page and the existing workflow fixture: exit 0.
- `git diff --check`: exit 0.
- React Doctor changed-file scan: scanned only 2 tracked files (untracked new source is not covered), so it cannot establish whole-feature coverage.
- Full React Doctor: 139 files, 52 warnings, score 54/100. Initial run had 53 warnings; lazy initialization removed the new useImageComposer warning. ImageControls retains the prior many-responsibilities warning; pre-existing ChatPanel and other repository findings were not broadly refactored or suppressed. This is not a clean full-app diagnostic result.
- Browser inspection at localhost:3000/movement: opened anatomy workspace, observed all seven options, Seedream brand, 2K default and $0.018 live estimate; old attached FLUX image still renders its original metadata. Saved screenshot under `assets/2026-10-23-seedream-anatomy/workspace.png`. No create button was pressed.
- Updated existing mock workflow fixtures for the new provider/model, flat price shape, anatomy brief and receipt source count. Did not run the workflow test, add new tests, make a new paid generation call, or run a production build in this turn. The earlier Seedream generation sample demonstrates the provider endpoint, not this changed UI end-to-end.

## Limits

Switching model does not repair the structural ambiguities seen in the generated anatomy samples. The app keeps the simulation label and source links visible. No image is automatically labeled as verified anatomy, measured fiber data or photographed human tissue. Reference uploads are manual; automatic Z-Anatomy render export and Atlas attachment were not added in this switch.

No commit or deployment requested or performed. Existing local changes remain in the working tree.

Sources checked: [Seedream model](https://openrouter.ai/bytedance-seed/seedream-5-0-flash), [endpoint metadata](https://openrouter.ai/api/v1/images/models/bytedance-seed/seedream-5-0-flash/endpoints), and OpenStax §§11.4–11.6 linked in anatomy-presets.ts. Installed Next 16.4 Route Handlers guide was read before edits.

## Follow-up: requested commit and local master integration

The user subsequently requested a commit and merge into master. Pre-commit verification on 2026-10-23: production `npm run build` completed successfully (including TypeScript and static page generation), focused ESLint exited 0, and origin/master was fetched and matched local master. All 49 changed/new files were checked for the configured OpenRouter key and key-shaped literals; none were found, and .env.local remains ignored. No paid image request or test suite was run for the commit request.
