# Atlas anatomy source audit — 2026-10-22

## Inventory and scope

Reviewed the complete eight-record `ANATOMY_REGIONS` inventory: 24 structure summaries, 16 activity-adjustment pairs, all summaries, biomechanics notes, symptom examples, observation/referral text, red flags and AI prompt examples. Also reviewed all 42 notes on the 13 plates in `JointDiagramSvg`, 25 body-map lookup zones and their client-record overlay language, the bilateral gluteus medius detail record, and the provenance/nomenclature scope for all 1,031 catalog IDs.

This is a source comparison of a finite educational inventory. It does not establish diagnostic accuracy, individual exercise suitability, mesh accuracy, or clinical validation. Independent expert signoff is optional under the user's latest instruction; no reviewer was invented (`reviewedBy` and `review.clinician` remain null). Sources were actually reopened or retrieved on 2026-10-22 with the access limits below. The comparison is not an exhaustive systematic review of everything published through that date.

## Findings and corrections by region

| Record | Source comparison and disposition | Remaining limits |
| --- | --- | --- |
| cervical | Re-read the four LUMEN muscle entries, OpenStax vertebral/neck material, official 2017 Neck Pain CPG PDF and AAOS radiculopathy/sprain pages. Retained separate longus colli/capitis attachments, levator/trapezius actions, symptom-dependent exercise and referral language. Replaced the plate's implication that all listed deep posterior muscles connect the occiput to C1/C2 with a group-level description. All three cervical plate notes now link to their sources. | The CPG is explicitly the 2017 edition. No exhaustive later neck guideline comparison, individual posture-load calculation or detailed suboccipital attachment mapping. |
| shoulder | Re-read four LUMEN entries, Braman's author manuscript, AAOS conditioning/tear pages, NHS shoulder/chest guidance and OpenStax shoulder/girdle/synovial material. Removed the plate's undefined “one third of the head size” ratio and its unsupported pectoralis-minor-length association. Rib attachments are described with variation instead of treating 3–5 as universal. Kept cuff actions and variable scapulohumeral rhythm without diagnosing from an arc or posture. Seven plate notes have claim-level links. Chest-emergency wording now treats persistent sudden pain, radiation and associated symptoms as alternative warning patterns. | Braman studied asymptomatic motion; the findings do not establish a pain mechanism or an optimal exercise. No source-to-plate coordinate or subacromial-space measurement verification. |
| thoracic_core | Re-read LUMEN abdominal/diaphragm entries, AHA breathing/activity guidance, EHS rectus-diastasis summary and OpenStax abdominal-wall prose. Corrected the plate title from “four layers” to muscle groups: the lateral wall has three muscular layers; rectus abdominis is a separate paired group. Retained general breathing and assessment advice. Four plate notes have sources. Chest-emergency alternatives clarified as above. | EHS evidence does not select one exercise regimen or justify default crunch/sit-up bans. No measured intra-abdominal pressure, universal protective bracing cue or complete postpartum/pelvic-floor treatment review. |
| lumbar | Re-read LUMEN multifidus/QL and added its iliopsoas/TVA entries to the plate mapping; rechecked OpenStax spine/abdomen and NICE NG59 recommendations. NBT CES was available as indexed NHS text only; added the fully accessible NHS sciatica page as direct corroboration for sensory/strength and emergency symptoms. Added severe/worsening bilateral leg numbness or weakness to the emergency warning. Simplified the herniation label so it describes an illustration rather than one universal direction/type. Seven notes link to source records. | NG59 concerns people over 16; it is not a postoperative load protocol. LUMEN is insufficient for detailed multifidus fascicle attachments. The disc image cannot identify a viewer's lesion or symptom source. |
| hip_pelvis | Re-read five LUMEN entries, Warwick diagnosis/treatment sections as publisher-indexed text, NHS hip-fracture warnings, and OpenStax lower-limb/joint/pelvic material. Retained FAI's symptom/sign/imaging triad and individualized activity adjustment. Removed the plate's uncited sciatic-nerve variant/deep-gluteal entrapment discussion; retained broad deep-rotator anatomy and a need to assess radiating pain. Five plate notes now link to sources. | Warwick is a 2016 consensus and does not establish a universal squat stance or comparative treatment superiority. No GTPS treatment protocol, nerve-variant prevalence or individual pelvic alignment diagnosis was added. |
| thigh_hamstring | Re-read OpenStax thigh-compartment prose, LUMEN rectus/biceps/gracilis entries, official Hamstring Strain Injury CPG 2022 PDF, AAOS thigh-strain/avulsion advice and NHS DVT guidance. Retained the short-head biceps exception, gracilis tibial insertion and tolerance-based eccentric/running progression. Removed the plate's unreferenced detailed VMO partition; kept broad quadriceps function. All three notes have sources. | Athlete strain evidence does not automatically cover chronic proximal tendinopathy or avulsion. No single bridge count, strength ratio or time guarantees sport clearance. |
| knee | Re-read AAOS gross anatomy, LUMEN rectus, PFP 2024 publisher-indexed guide, Aspetar ACL 2023 publisher-indexed recommendation, NHS warnings and OpenStax selected-joint material. Clarified ACL/PCL using tibia-relative-to-femur directions. Clarified the deep MCL's capsular/medial-meniscus connection instead of implying MCL and LCL have the same capsular relation. Seven notes have sources. | OpenStax itself uses the broad “extrinsic” classification; the rewritten note preserves its more specific deep-MCL relation. No individual graft timing, universal safe knee angle or clinical-test accuracy claim. |
| ankle_foot | Re-read four LUMEN entries, official Achilles 2024 PDF, AAOS rupture/stress-fracture advice and OpenStax ankle-joint prose. Added the CPG's “without presumed tendon-structure frailty” scope to the regional loading recommendation. Kept 2–6 cm as one component of midportion assessment, not a self-diagnostic distance. Six notes have sources. Narrowed the deltoid note to the function supported by the selected source. | Midportion evidence does not establish an insertional/rupture protocol. No universal knee-to-wall or heel-raise threshold; no ankle-to-valgus-to-back causal chain. Ankle sprain treatment was not newly prescribed. |

## Body map and gluteus medius details

All 25 colored click zones are now broad lookup regions. The earlier labels named deep muscles, intra-articular ligaments and menisci on a surface plate, potentially implying that the overlay located those structures. The source image can show its own layers, but the authored click outline does not establish a deep structure's boundary. The legend and client header now describe a keyword match in the record, including an explicit statement that the match does not locate an injury. The matching algorithm remains navigation only and does not assign urgency.

The gluteus medius detail retains four source-linked facts. Origin is explicitly a gross bony attachment description rather than a complete origin map. UW supports the superior-gluteal-nerve root values; the redundant StatPearls link was removed rather than claiming its current text was read through a browser challenge. The architecture note distinguishes Flack's four architecture/innervation compartments from Tsutsumi's two tendon portions; these are different definitions, not equivalent segmented regions. Each retained source now has its actual checked date and access scope exposed in the card.

## Catalog and 3D provenance audit

Local manifest and evidence rows were counted independently: 1,031 unique manifest IDs, 1,031 evidence rows, zero missing or extra IDs. Every English name is populated; eight Latin fields are empty. The existing derivative-CSV comparison marks 884 English/Latin pairs as matching; 147 lack that matched pair. Only 140 display labels differ from the English source label. These counts are bookkeeping, not proof of a correct Vietnamese translation, authoritative FIPAT terminology or accurate geometry.

Manifest/evidence metadata agree on Z-Anatomy revision `0dd2329622c42b4fdcaabbf5ff6ad234df49b659`, asset version 2 and CC-BY-SA-4.0. Existing local attribution preserves BodyParts3D lineage. The original upstream derivative CSV comparison was not repeated; the GitHub revision URL could not be retrieved by the web reader this session. No claim of newly reading original FIPAT or anatomically verifying 1,031 meshes is made. Source material names can describe rendering assignments rather than anatomy (for example a pectoralis entry retains an upstream material named `Adductor`). They do not verify fiber directions or identify an attachment footprint.

No source-to-mesh fascicle map or measured tissue thickness was produced. The fiber map stays unavailable because those data are absent, not because an independent approval is required to read the educational facts. Historical asset credits remain attached to the supplied images; current OpenStax 2e web pages display a 2026 CC-BY-NC-SA notice, whereas the supplied assets are credited to older CC-BY-4.0 material. Current web text access does not retroactively establish an image's historical license or coordinates. No new protected illustrations were copied.

## Access accounting

- All 26 unique retained LUMEN short entries were directly retrieved and their origin/action/insertion sections read. They are historical university gross-anatomy teaching material, not treatment guidance or spatial validation.
- OpenStax full HTML was available for §§7.3, 8.3, 9.4, 9.6, 11.3, 11.4, 11.5 and 11.6. Prose and relevant selected tables were checked. Some generated image alternative text/tables contain awkward or conflicting descriptions; precise attachments were checked against LUMEN rather than treating every accessible sentence as authoritative. The historical treatment vignettes were not adopted.
- The official Neck Pain 2017, Hamstring 2022 and Achilles 2024 PDFs were retrieved directly and text extracted. The web reader returned 403 for the latter PDFs, so it is the direct PDF retrieval, not an indexed snippet, that supported their recommendation review.
- AAOS conditioning, cervical radiculopathy, neck sprain, rotator cuff tear, knee injury, thigh strain, Achilles rupture and stress-fracture pages were directly retrieved. Relevant anatomy, symptom/examination and scope sections were read; blanket drug advice, recovery times and every exercise dosage were not adopted.
- NHS chest, shoulder, broken hip, knee, DVT and sciatica pages were directly retrieved. Local service numbers were not copied. NBT CES direct retrieval failed with 503; indexed NHS symptom/emergency text was read and the registry now says so.
- AHA breath control/activity sections were read in the web reader despite direct HTTP retrieval returning 403.
- Braman and EHS PMC direct HTML retrieval succeeded and relevant text was extracted/read, despite the web reader showing a challenge. The EHS supplementary full guideline and every underlying trial were not audited.
- NICE NG59, Warwick 2016, PFP 2024 and Aspetar ACL 2023 were read as indexed official/publisher recommendation sections. Direct reader access failed with 403; the registry does not claim unrestricted full-text access. McGraw Hill was similarly limited to indexed Table 35-1.
- UW gluteus medius full public text was available; it displays “This is unpublished,” so it is described as a university teaching entry. Flack and Tsutsumi were rechecked from PubMed-indexed abstracts; direct PubMed retrieval returned a challenge, and full paper access is not claimed.

## Source-panel wording follow-up

Desktop QA found implementation field names and diagram IDs in the visible claim summaries. Replaced those prefixes with Vietnamese section labels (for example, “Cấu trúc giải phẫu” and “Chú giải hình…”), preserving source numbers, source records and each clinical explanation verbatim. This is a presentation-only change.

## Software checks

Existing regional evidence check passed: 8/8 regions, 24 structure summaries and 73 regional source links. Existing 3D atlas evidence/surface-label check passed. Targeted ESLint passed for all changed TS/TSX files, and `npx tsc --noEmit` passed in the shared workspace. A one-off transpiled-data inspection counted 13 plates / 42 annotations and confirmed that every numbered source reference resolves in its region. Those checks establish data/code consistency only. Integrated build/React Doctor and browser review belong to the parent task; no new global test files or commits were made here.

## Source ledger

The following ledger is generated from the final records, deduplicated by URL. Every entry was compared on 2026-10-22 with the scope stated above and in the record. Repeated regional use does not imply independent evidence.

1. [OpenStax, Anatomy and Physiology 2e §7.3: The Vertebral Column](https://openstax.org/books/anatomy-and-physiology-2e/pages/7-3-the-vertebral-column) — Full HTML available; regional anatomy, intervertebral disc structure and vertebral support/movement sections checked. Clinical treatment statements in this chapter were not used as guidance. Used in: cervical, thoracic_core, lumbar.

2. [Loyola University Chicago, LUMEN: Longus colli](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/lncl.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: cervical.

3. [Loyola University Chicago, LUMEN: Longus capitis (entry heading: LONGUS CAPITUS)](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/lonc.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: cervical.

4. [Loyola University Chicago, LUMEN: Levator scapulae](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/ls.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: cervical.

5. [Loyola University Chicago, LUMEN: Trapezius](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/trap.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: cervical.

6. [Blanpied et al. Neck Pain: Revision 2017. JOSPT 47(7):A1–A83; doi:10.2519/jospt.2017.0302](https://www.orthopt.org/uploads/content_files/files/Neck%20Pain%20CPG%20-%20Revision%202017.pdf) — Full official PDF downloaded and text extracted; summary A2–A3, differential diagnosis and physical impairment examination checked. Web reader returned 403; direct PDF retrieval succeeded. Source age is explicit. Used in: cervical.

7. [AAOS OrthoInfo: Cervical Radiculopathy (Pinched Nerve)](https://www.orthoinfo.org/diseases--conditions/cervical-radiculopathy-pinched-nerve/) — Full HTML; Symptoms, Physical Examination and Physical therapy paragraphs checked. Used in: cervical.

8. [AAOS OrthoInfo: Neck Sprains and Strains](https://www.orthoinfo.org/diseases--conditions/neck-sprain/) — Full HTML; Anatomy and Warning Signs checked. Medication, collar and passive treatment advice not adopted. Used in: cervical.

9. [OpenStax, Anatomy and Physiology 2e §11.3: Axial Muscles of the Head, Neck, and Back](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back) — Full HTML; head/neck and posterior neck/back prose and table 11.5 checked. General group functions only; not a detailed atlas of suboccipital attachments or proof of postural pain mechanisms. Used in: cervical.

10. [Loyola University Chicago, LUMEN: Supraspinatus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/sups.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: shoulder.

11. [Loyola University Chicago, LUMEN: Infraspinatus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/infs.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: shoulder.

12. [Loyola University Chicago, LUMEN: Teres minor](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/tmn.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: shoulder.

13. [Loyola University Chicago, LUMEN: Serratus anterior](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/sera.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: shoulder.

14. [Braman et al. In Vivo Assessment of Scapulohumeral Rhythm During Unconstrained Overhead Reaching in Asymptomatic Subjects. J Shoulder Elbow Surg 2009;18:960–967](https://pmc.ncbi.nlm.nih.gov/articles/PMC2841046/) — Full author manuscript; Abstract, Introduction, bone-pin measurement Methods, Table I and interpretation of rhythm variability checked. Used in: shoulder.

15. [AAOS OrthoInfo / ASES: Rotator Cuff and Shoulder Conditioning Program](https://www.orthoinfo.org/recovery/rotator-cuff-and-shoulder-conditioning-program) — Full HTML; introduction, Getting Started, Standing Row and external-rotation exercise sections checked. General conditioning examples, not an individual treatment prescription. Used in: shoulder.

16. [AAOS OrthoInfo: Rotator Cuff Tears](https://www.orthoinfo.org/diseases--conditions/rotator-cuff-tears) — Full publisher HTML retrieved; Symptoms and nonsurgical exercise paragraphs rechecked; used only for pain with lifting and need for clinical assessment, not tear diagnosis. Used in: shoulder.

17. [NHS: Chest pain](https://www.nhs.uk/symptoms/chest-pain/) — Full HTML; emergency symptoms and instruction to obtain immediate help checked. UK service numbers were not copied into the Vietnamese text. Used in: shoulder, thoracic_core.

18. [NHS: Shoulder pain](https://www.nhs.uk/symptoms/shoulder-pain/) — Full HTML; Urgent advice section checked for severe sudden pain, inability to move, swelling/deformity and post-injury symptoms. Source review date 2023; symptom referral guidance only. Used in: shoulder.

19. [OpenStax, Anatomy and Physiology 2e §9.6: Anatomy of Selected Synovial Joints](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-6-anatomy-of-selected-synovial-joints) — Full HTML; Shoulder, Hip, Knee and Ankle Joint prose checked for gross articulations, labrum, cruciate/collateral ligaments and ankle inversion/eversion restraints. No injury rates, postoperative advice or source-to-image coordinate verification adopted. Used in: shoulder, hip_pelvis, knee, ankle_foot.

20. [OpenStax, Anatomy and Physiology 2e §11.5: Muscles of the Pectoral Girdle and Upper Limbs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs) — Full HTML; pectoral-girdle positioning prose/table and broad humeral muscle descriptions checked. Pectoralis minor rib attachment varies (2–4 or 3–5); no muscle-length/pain causation inferred from this chapter. Used in: shoulder, thoracic_core.

21. [OpenStax, Anatomy and Physiology 2e §9.4: Synovial Joints](https://openstax.org/books/anatomy-and-physiology-2e/pages/9-4-synovial-joints) — Full HTML; articular capsule, synovial membrane and lubrication paragraphs checked; no personal measurement or treatment guidance. Used in: shoulder.

22. [Loyola University Chicago, LUMEN: Transversus abdominis](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/trab.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thoracic_core, lumbar.

23. [Loyola University Chicago, LUMEN: Diaphragm](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/dph.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thoracic_core.

24. [Loyola University Chicago, LUMEN: Internal abdominal oblique](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/inab.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thoracic_core.

25. [Loyola University Chicago, LUMEN: External abdominal oblique](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/exab.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thoracic_core.

26. [American Heart Association: Getting Active to Control High Blood Pressure](https://www.heart.org/en/health-topics/high-blood-pressure/changes-you-can-make-to-manage-high-blood-pressure/getting-active-to-control-high-blood-pressure) — Full publisher page text; Take charge of your activity level, start gradually, pre-existing conditions and Practice breath control sections checked. Used in: thoracic_core.

27. [Hernández-Granados et al. European Hernia Society guidelines on management of rectus diastasis. BJS 2021;108:1189–1191; doi:10.1093/bjs/znab128](https://pmc.ncbi.nlm.nih.gov/articles/PMC10364860/) — Full executive-summary HTML; KQ2 assessment, KQ4–KQ5 symptom/width uncertainty and KQ6 nonoperative treatment read. Supplementary full guideline and every trial not audited. Used in: thoracic_core.

28. [OpenStax, Anatomy and Physiology 2e §11.4: Axial Muscles of the Abdominal Wall, and Thorax](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax) — Full HTML; Muscles of the Abdomen prose checked: four paired groups, three lateral wall layers, rectus/linea alba and posterior wall. Detailed attachment tables and the historical physical therapy vignette are not used as treatment evidence. Used in: thoracic_core, lumbar.

29. [Loyola University Chicago, LUMEN: Transversospinalis–multifidus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/mult.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: lumbar.

30. [Loyola University Chicago, LUMEN: Quadratus lumborum](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/ql.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: lumbar.

31. [NICE NG59: Low back pain and sciatica in over 16s — Recommendations](https://www.nice.org.uk/guidance/ng59/chapter/Recommendations) — Official indexed full-text recommendations 1.1.1, 1.1.4–1.1.6, 1.2.1–1.2.2 checked through web search; direct reader open failed. No individualized load or surgical rehabilitation guidance inferred. Used in: lumbar.

32. [North Bristol NHS Trust: Same Day Emergency Clinic — Cauda Equina Syndrome](https://www.nbt.nhs.uk/our-services/a-z-services/neurosurgery/neurosurgery-patient-information/same-day-emergency-clinic-sdec-cauda-equina-syndrome-sec) — NHS indexed symptom/emergency text rechecked; direct retrieval failed (503). New saddle-sensation and bowel/bladder changes prompt emergency assessment. No claim of complete current-page access. Used in: lumbar.

33. [Loyola University Chicago, LUMEN: Psoas major](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/psmj.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: lumbar, hip_pelvis.

34. [Loyola University Chicago, LUMEN: Iliacus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/ilia.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: lumbar, hip_pelvis.

35. [NHS: Sciatica](https://www.nhs.uk/conditions/sciatica/) — Full HTML; Symptoms, Immediate action and Causes sections rechecked. Supports radiating pain, sensory/strength changes, disc-related causes and emergency bilateral/saddle/bladder/bowel symptoms; not exercise dosage or imaging-based diagnosis. Used in: lumbar.

36. [Loyola University Chicago, LUMEN: Gluteus maximus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/glmx.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: hip_pelvis.

37. [Loyola University Chicago, LUMEN: Gluteus medius](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/glmd.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: hip_pelvis.

38. [Loyola University Chicago, LUMEN: Gluteus minimus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/glmn.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: hip_pelvis.

39. [Griffin et al. The Warwick Agreement on femoroacetabular impingement syndrome. BJSM 2016;50:1169–1176; doi:10.1136/bjsports-2016-096743](https://bjsm.bmj.com/content/50/19/1169/) — Publisher indexed full-text sections What is FAI syndrome?, diagnosis, Symptoms and treatment checked through web search; direct reader open failed. International consensus, not a patient-specific exercise trial. Used in: hip_pelvis.

40. [NHS: Broken hip](https://www.nhs.uk/conditions/broken-hip/) — Full HTML; hip/groin pain, inability to bear weight after injury, emergency and urgent assessment criteria checked; source page reviewed 2026-07-29. Used in: hip_pelvis.

41. [OpenStax, Anatomy and Physiology 2e §11.6: Appendicular Muscles of the Pelvic Girdle and Lower Limbs](https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs) — Full HTML; thigh-compartment prose, pelvic muscle descriptions and selected table material rechecked for broad function. Detailed attachments cross-checked with LUMEN. Image alternative text is not treated as an error-free attachment/function reference; no images reproduced. Used in: hip_pelvis, thigh_hamstring, knee.

42. [OpenStax, Anatomy and Physiology 2e §8.3: The Pelvic Girdle and Pelvis](https://openstax.org/books/anatomy-and-physiology-2e/pages/8-3-the-pelvic-girdle-and-pelvis) — Full HTML; hip bone components, sacroiliac articulation and pubic symphysis checked. Describes gross pelvic ring structure, not individual alignment or pain causation. Used in: hip_pelvis.

43. [Loyola University Chicago, LUMEN: Rectus femoris](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/recf.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thigh_hamstring, knee.

44. [Loyola University Chicago, LUMEN: Biceps femoris](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/bfem.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thigh_hamstring.

45. [Loyola University Chicago, LUMEN: Gracilis](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/grac.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: thigh_hamstring.

46. [Martin et al. Hamstring Strain Injury in Athletes. JOSPT 2022;52(3):CPG1–CPG44; doi:10.2519/jospt.2022.0301](https://www.orthopt.org/uploads/content_files/files/Hamstring_Strain_Injury_in_Athletes.pdf) — Full official PDF downloaded/text extracted; Summary CPG2 covering diagnosis, strength/length examination, injury prevention, eccentric training, progressive running and return to play checked. Used in: thigh_hamstring.

47. [AAOS OrthoInfo: Muscle Strains in the Thigh](https://www.orthoinfo.org/diseases--conditions/muscle-strains-in-the-thigh) — Full HTML; Symptoms, Doctor Examination and Be Aware of Other Similar Injuries checked, including time-sensitive proximal tendon avulsion. Fixed recovery times and medication advice not adopted. Used in: thigh_hamstring.

48. [NHS: DVT (deep vein thrombosis)](https://www.nhs.uk/conditions/deep-vein-thrombosis-dvt/) — Full HTML; Symptoms, Urgent advice, Immediate action and recent immobility/surgery risk sections checked. UK service numbers not copied; no diagnosis from appearance alone. Used in: thigh_hamstring.

49. [AAOS OrthoInfo: Common Knee Injuries](https://www.orthoinfo.org/diseases--conditions/common-knee-injuries/) — Full HTML; Anatomy, cruciate ligaments and menisci descriptions checked. Used for gross joint structure and function, not percentages of load or diagnostic accuracy. Used in: knee.

50. [Neal et al. Best practice guide for patellofemoral pain. BJSM 2024;58:1486–1495; doi:10.1136/bjsports-2024-108110](https://bjsm.bmj.com/content/58/24/1486) — Publisher indexed full-text sections How to apply the BPG, Discussion and Conclusion read through web search; direct open returned 403. Exercise/education and individualized load recommendations checked, not every included trial. Used in: knee.

51. [Kotsifaki et al. Aspetar clinical practice guideline on rehabilitation after ACL reconstruction. BJSM 2023;57:500–514; doi:10.1136/bjsports-2022-106158](https://bjsm.bmj.com/content/57/9/500) — Publisher indexed full-text Exercise initiation, Open versus closed kinetic chain and Strength and motor control training recommendations read through web search. Direct open returned 403 and PMC mirror showed a browser challenge. No individual postoperative timing inferred. Used in: knee.

52. [NHS: Knee pain](https://www.nhs.uk/symptoms/knee-pain/) — Full HTML; Urgent advice checked for inability to bear weight/move, locking, large swelling/deformity, and fever with joint redness/heat. Used in: knee.

53. [Loyola University Chicago, LUMEN: Gastrocnemius](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/gast.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: ankle_foot.

54. [Loyola University Chicago, LUMEN: Soleus](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/sole.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: ankle_foot.

55. [Loyola University Chicago, LUMEN: Tibialis posterior](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/tibp.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: ankle_foot.

56. [Loyola University Chicago, LUMEN: Tibialis anterior](https://www.meddean.luc.edu/lumen/meded/grossanatomy/dissector/muscles/tiba.htm) — Full short HTML entry: Origin, Action and Insertion checked. Historical university teaching resource; gross anatomy only, not treatment evidence or mesh validation. Used in: ankle_foot.

57. [Chimenti et al. Achilles Pain, Stiffness, and Muscle Power Deficits: Midportion Achilles Tendinopathy Revision 2024. JOSPT 54(12):CPG1–CPG32; doi:10.2519/jospt.2024.0302](https://www.orthopt.org/uploads/content_files/files/Achilles_Pain_revision_2024.pdf) — Full official PDF downloaded/text extracted; Summary CPG2, scope/differential diagnosis and tendon-loading recommendations checked. Explicitly midportion disease; not an insertional or rupture guideline. Used in: ankle_foot.

58. [AAOS OrthoInfo: Achilles Tendon Rupture (Tear)](https://www.orthoinfo.org/diseases--conditions/achilles-tendon-rupture-tear) — Full HTML; Anatomy, Symptoms and Doctor Examination checked. Thompson test described as clinician examination, not taught as a PT/self-test. Used in: ankle_foot.

59. [AAOS OrthoInfo: Stress Fractures](https://orthoinfo.aaos.org/en/diseases--conditions/stress-fractures/) — Full HTML; activity-load Cause, localized/progressive Symptoms and First Aid/Doctor Examination checked. No imaging rule, hop-test instruction or fixed recovery time adopted. Used in: ankle_foot.

60. [McGraw Hill · Gross Anatomy, 2e · Bảng 35-1](https://accessmedicine.mhmedical.com/Content.aspx?bookid=2478&sectionid=202021783) — Publisher-indexed public Table 35-1 excerpt rechecked; direct page returned 403. Gross attachments/action only; no complete chapter access claimed. Used in: bilateral gluteus medius.

61. [University of Washington · Muscle Atlas](https://rad.uw.edu/muscle-atlas/gluteus-medius) — Full public entry: origin, insertion, action and innervation rechecked. Page displays ‘This is unpublished’; university teaching reference, not a peer-reviewed paper. No illustrations redistributed. Used in: bilateral gluteus medius.

62. [Flack và cs. · Clinical Anatomy (2014)](https://pubmed.ncbi.nlm.nih.gov/23625344/) — PubMed-indexed abstract rechecked; direct PubMed open was unavailable. Dissection of 12 cadavers, four architecture/innervation compartments; no full-text or source-to-mesh fiber-map claim. Used in: bilateral gluteus medius.

63. [Tsutsumi và cs. · JBJS (2019)](https://pubmed.ncbi.nlm.nih.gov/30653048/) — PubMed-indexed abstract rechecked; direct PubMed open was unavailable. Twenty-five hips from 15 Japanese cadavers; two tendon parts and lateral/superoposterior facets. No full-text access or patient-specific measurements claimed. Used in: bilateral gluteus medius.
