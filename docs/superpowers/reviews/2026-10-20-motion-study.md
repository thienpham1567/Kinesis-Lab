# Rejected prototype — not shipped

User rejected the procedural mannequin on 2026-10-20 as visually inadequate for the intended anatomical Atlas. Root removed its imports and moved prototype sources/checks to ignored `.data/prototypes/rejected-motion-mannequin/` with disabled extensions. The PT workspace now displays actual static Z-Anatomy meshes. No anatomical exercise animation is claimed delivered.

## Prototype history

# Schematic exercise motion study — 2026-10-20

## Scope and design

Implements the approved PT Atlas motion study as a bounded procedural mannequin, independent from the static Z-Anatomy meshes. All thirteen existing exercise IDs have a named representative variant. Compound records deliberately show one variant: bilateral neutral-grip pulldown, standing cable curl, kneeling cable crunch, high-bar squat without heel elevation, Romanian deadlift, barbell hip thrust and standing calf raise. The display does not combine incompatible movements from a compound record.

The design follows the existing clinical workspace: brand body/lab fonts, white/canvas surfaces, cobalt mannequin and actions, slate secondary text and rule borders. The visual anchor is an articulated cobalt model over a quiet reference grid. Controls expose play/pause, a manual A → B → A phase slider and three camera presets. Playback starts paused, uses one six-second illustrative cycle, pauses when the document is hidden, and is disabled when reduced motion is preferred. Explicit user action is required to start playback again after a reduced-motion preference change. Controls wrap at narrow widths; no fixed minimum card width is introduced.

The mannequin uses its own primitives, joint pivots and generated support blocks. It imports no model, image, texture or commercial asset. Joint spheres describe graphic hinges, not anatomical joint centers. The renderer draws on state/resize changes while paused and schedules animation frames only during playback. Exercise switches remount a paused study; cleanup cancels frames, disconnects resize observation, removes context-loss events, disposes all owned geometry/material/renderer resources, releases the context and removes its canvas. Setup failure disposes resources created before failure. Missing WebGL or failed module loading shows a text fallback with the motion description and sources retained.

## Evidence and review status

Action descriptions map by source key to existing `EXERCISE_EVIDENCE` and `MUSCLE_EVIDENCE_SOURCES`. Inline numbered links immediately follow each action description. The expanded source section explains scope and retains the existing exercise evidence limitations.

Public text rechecked on 2026-10-20:

- [OpenStax Anatomy and Physiology 2e, 11.5](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs): public section text, upper-limb and scapular muscle action context.
- [OpenStax Anatomy and Physiology 2e, 11.4](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax): public section text, abdominal wall and trunk-flexion action context.
- [TTUHSC El Paso alphabetical muscle tables](https://anatomy.ttuhscep.edu/anatomytables/muscles_alpha.html): public action rows for upper-limb flexors/extensors, deltoid, latissimus, scapular and back muscles. No image copying or measured attachment mapping.
- [TTUHSC El Paso pectoral tables](https://anatomy.ttuhscep.edu/musculoskeletal_system/pectoral_tables.html): public muscle action rows, including pectoral and triceps context.
- [TTUHSC El Paso hip/posterior thigh/leg tables](https://anatomy.ttuhscep.edu/musculoskeletal_system/gluteal_tables.html): public gluteal, hamstring and calf muscle action rows.
- [TTUHSC El Paso anterior/medial thigh tables](https://anatomy.ttuhscep.edu/musculoskeletal_system/thigh_tables.html): public thigh muscle action rows, including quadriceps.

The mapping is a concise interpretation of gross actions in exercise examples. The references do not supply the mannequin's coordinates, phase timing, display angles, body dimensions or support geometry. No study validates this animation. Existing exercise research is not represented as validation of these poses.

`reviewedBy` and `reviewedAt` remain null; spatial mapping remains `pending-qualified-expert-review`. The UI explicitly says this is a schematic, not measured ROM or validated anatomy, and excludes muscle deformation or quantified activation. It does not prescribe load, depth, tempo, pain tolerance, treatment or a universally safe technique.

## Observed software checks

- Test-first check initially failed because the new motion definition file did not exist.
- `node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-exercise-motion.mjs` passed after implementation and again after lifecycle hardening. Checks all thirteen legacy IDs, representative variant names, source membership in each existing exercise evidence record, pending review fields, finite/bounded pose values at 101 phases per record, exact loop closure, nonfinite/out-of-range phase fallback, movement variation, unknown ID fallback and static lifecycle/policy guards.
- `npx eslint src/components/training/motion src/lib/clinical/exercise-motion.ts scripts/check-exercise-motion.mjs` passed with exit 0, no diagnostics.
- `npx -y react-doctor@latest . --verbose --diff` returned exit 0, scanned 28 changed files, score 62/100, and reported “No issues found”. This was a repository changed-file scan, not a clinical assessment or proof that browser behavior is correct.
- Initial whole-repository `npx tsc --noEmit --incremental false` reported two errors outside the owned motion files: `TrainingAtlasExplorer.tsx` IconName and the existing `lab-extraction.check.ts` extension import. Root agent reported resolving both during integration. Final build and browser observations belong to root integration verification.

## Remaining limits

There is no separate scapulothoracic articulation, multi-segment spine, foot-floor contact solver, cable routing, force model, balance solver or measured anthropometry. Supports, joint coordinates and timing remain graphic approximations. The current motion path may show floating or sliding contact, particularly in compound lower-body movements. Model proportions and arbitrary angles must never be reused as patient ROM reference data.

This review records source comparison and software checks only. A qualified clinician/anatomist still needs to review both descriptions and spatial motion representation. Browser interaction, keyboard order, camera framing, 390px overflow, context-loss fallback and resource behavior require integration observations; static checks do not establish those properties.

## Integration correction

Root browser QA found the first CSS-module implementation rendered empty class names, collapsed the host, and left controls unstyled. Generated dev output showed an empty CSS-module export and the transformed filename `ExerciseMotionStudy.module.css.css`. The existing project Turbopack rule runs the Tailwind loader on every CSS file and rewrites it as ordinary CSS. This erased the module export while emitting global selectors.

After rereading the installed Next 16 CSS and Turbopack docs, the viewer was changed to a component-owned ordinary stylesheet with explicit `kinesis-motion-*` namespaced selectors. It imports no CSS-module object and requires no change to shared Next configuration. A regression guard was added and observed failing with the old import, then passing after the correction. Generated dev CSS and JavaScript now both contain matching `kinesis-motion-study` and `kinesis-motion-viewport` selectors/class strings.

The camera now fits mannequin bounds sampled across seventeen cycle positions, excludes decorative floor/support geometry, and refits when the viewport changes. Three.js projection checks cover three camera presets at three desktop/narrow aspect ratios, checking the test mannequin bounds remain inside 85% of the normalized frame and occupy more than 52.5% of screen height. These checks failed first for the missing helper, then passed after implementation. Actual exercise framing remains part of root browser review.

After these corrections, targeted motion checks and ESLint passed again; a fresh `npx tsc --noEmit --incremental false` passed with no diagnostics. Prior initial TypeScript errors were resolved by root integration work.
