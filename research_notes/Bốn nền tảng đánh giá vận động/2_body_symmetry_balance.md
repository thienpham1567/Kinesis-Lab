# Body Balance / Symmetry ("cân đối cơ thể") in PT, Rehab and S&C

Scope note: covers inter-limb (L/R) and agonist:antagonist balance, static posture/alignment, and postural balance (stability) tests. FMS/SFMA, ROM norms and motor control are excluded on purpose. Research date: 2026-10-16. Most sources were read through search abstracts and PMC full-text extracts; where only a secondary source was available, this is flagged.

## 1. Inter-limb asymmetry: definitions, formulas, thresholds, and the evidence behind them

### Takeaway
There is no single standard asymmetry formula. At least 12 indices are in use, and only reference-limb-independent ones (%Diff relative to the stronger limb, Symmetry Index relative to the sum, Symmetry Angle, log-ratio) give the same magnitude whichever limb is stronger. The popular 10–15% "red flag" and the LSI ≥90% return-to-sport (RTS) rule are conventions with weak or mixed predictive evidence. LSI can also overestimate recovery, because the uninjured limb deconditions too.

### Cited Findings

**Formula families (for an asymmetry calculator)**
- A 2021 review (Parkinson, Apps, Morris, Barnett & Lewis, *J Sports Sci Med* 20:594–617) found 12 different asymmetry indices across 53 articles. The Limb Symmetry Index (LSI) was the most used (N=20). It expresses the weaker or involved limb as a % of the reference limb. The next most used (N=13) was absolute difference ÷ reference limb. — [Parkinson et al. 2021, JSSM](https://www.jssm.org/jssm-20-594.xml-Fulltext)
- Only 4 of the 12 indices give the same magnitude regardless of which limb is stronger, and these are the ones the authors recommend:
  - Index 9, "%Diff/LSI" per Menzel 2013: |difference| ÷ stronger limb. Recommended for unilateral tests.
  - Index 10, "Symmetry Index" per Suchomel 2016: |difference| ÷ (sum of both limbs). Suited to bilateral tests, not to unilateral ones because it pulls data from separate trials.
  - Index 11, "Symmetry Angle" per Maloney 2017 and Redden 2018: angle formed by plotting one limb against the other, where 45° = perfect symmetry.
  - Index 12, "Bilateral Limb Imbalance" per Opar/Bourne 2015: log-transformed ratio × 100. It has poor reliability and is non-linear.
  The authors say no unified index exists and that raw data should be reported. — [Parkinson et al. 2021](https://www.jssm.org/jssm-20-594.xml-Fulltext)
- Bishop, Turner, Gonzalo-Skok & Read (Aspetar Sports Med J vol. 9, 2020) propose direction-aware formulas (Excel syntax):
  - Unilateral: `((D−ND)/D×100) × IF(D<ND,1,−1)`
  - Bilateral: `((D−ND)/Total×100) × IF(D<ND,1,−1)`
  The IF term only signs the result, showing which limb is larger, and leaves the magnitude unchanged. — [Bishop et al. 2020, Aspetar](https://journal.aspetar.com/en/journals/volume-9-targeted-topic-return-to-performance-after-acl-reconstruction/inter-limb-asymmetry-during-rehabilitation)
- Worked example of the reference-limb problem: uninjured = 800 N, involved = 700 N gives 12.5% asymmetry. Swapping the values (uninjured = 700 N) gives −14.3% under a non-robust formula, even though the absolute difference is still 100 N. — [Bishop et al. 2020](https://journal.aspetar.com/en/journals/volume-9-targeted-topic-return-to-performance-after-acl-reconstruction/inter-limb-asymmetry-during-rehabilitation)
- In 2026, Maestroni, Bishop et al. (*J Strength Cond Res*) studied ACL-reconstructed athletes. They recommend Standard Percentage Difference (with direction) for unilateral tasks and Bilateral Asymmetry Index 1 for bilateral tasks, and found that the choice of equation changes results significantly (small to large pairwise differences). This comes from a search snippet; the full text was not read. — [search result summarizing Bishop group work; eprints](https://eprints.chi.ac.uk/id/eprint/3265/)
- An asymmetry should count as "real" only if it exceeds the test's coefficient of variation (CV). Acceptable CV is <10% (or <5% in some sources), and CVs should be determined for each group. — [Bishop et al. 2020](https://journal.aspetar.com/en/journals/volume-9-targeted-topic-return-to-performance-after-acl-reconstruction/inter-limb-asymmetry-during-rehabilitation)
- The direction of asymmetry, meaning which limb is stronger, is inconsistent across tests in healthy athletes. Agreement on the dominant limb across unilateral squat, CMJ and drop jump was only fair to moderate. The authors therefore recommend individual-level rather than group-mean interpretation. — [Bishop et al. 2020](https://journal.aspetar.com/en/journals/volume-9-targeted-topic-return-to-performance-after-acl-reconstruction/inter-limb-asymmetry-during-rehabilitation)

**Thresholds and their evidence**
- The 10–15% threshold was the most common benchmark (27/53 articles). Only 6 of the 18 articles that applied a threshold to original data (33%) gave Tier 1–2 evidence for it.
  - The 15% figure traces to Barber et al. 1990, who treated 85% symmetry as normal in healthy controls.
  - Bourne 2015 found increased hamstring injury risk at ≥15% eccentric asymmetry. Opar 2015 found no increase at 10%, 15% or 20%.
  - The authors conclude that "pre-determined, arbitrary thresholds … should be avoided."
  — [Parkinson et al. 2021](https://www.jssm.org/jssm-20-594.xml-Fulltext)
- A systematic review of 28 prospective cohorts (Guan et al. 2022, *J Clin Med* 11:360) called the asymmetry–injury findings "highly inconsistent." Results by test type:
  - Unilateral hops and jumps showed the most consistent link (5/6 studies). Examples: 10% hop asymmetry → foot/ankle injury, OR 4.4, in female collegiate athletes; triple-hop asymmetry >12 cm → OR 7.31. A volleyball study found no association at 10%.
  - Strength results were mixed. Eccentric hamstring asymmetry ≥15% → hamstring strain, OR 3.88. Hip adductor asymmetry showed no link to groin injury.
  - Flexibility: hip extensor flexibility asymmetry ≥15% was associated with injury in female athletes.
  - Thresholds used across the included studies: 15% for strength, 10% for hops, 4 cm for reach, 6° for flexibility.
  — [Guan et al. 2022, PMC8779786](https://pmc.ncbi.nlm.nih.gov/articles/PMC8779786/)
- Helme, Tee, Emmonds & Low 2021, "Does lower-limb asymmetry increase injury risk in sport? A systematic review," *Phys Ther Sport* 49:204–213, also exists. I did not retrieve its conclusions. — [SHURA repository](https://shura.shu.ac.uk/28290/)
- Asymmetry and performance:
  - Associated with worse performance: vertical and horizontal jump asymmetries with slower sprint and jump in youth female soccer; drop-jump asymmetry with slower sprint and change of direction (COD) in adult female soccer.
  - Not detrimental: single and triple hop asymmetries had no effect on COD speed.
  — [Bishop et al. 2020](https://journal.aspetar.com/en/journals/volume-9-targeted-topic-return-to-performance-after-acl-reconstruction/inter-limb-asymmetry-during-rehabilitation)
  - Some studies found no performance detriment at asymmetries of 13–15%. — [Parkinson et al. 2021](https://www.jssm.org/jssm-20-594.xml-Fulltext)

**ACL return to sport: LSI ≥90%**
- Delaware-Oslo ACL cohort (Grindem et al. 2016, *BJSM* 50(13):804–808), "Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction."
  - RTS criteria: >90% on patient-reported knee function, a global rating, isokinetic quadriceps strength LSI and the hop tests.
  - Per a conference slide (secondary), reinjury was 38.2% in those who failed the criteria vs 5.6% in those who passed, and quadriceps strength symmetry was a significant predictor.
  — [BJSM abstract](https://bjsm.bmj.com/content/50/13/804); [PMC4912389](https://pmc.ncbi.nlm.nih.gov/articles/PMC4912389); [Ardern slide, secondary](https://www.viasana.nl/cdn/0ce17632-5af7-472d-8100-c743212a2902/presentatie-1-clare-ardern.pdf)
- LSI can overestimate function (Wellsandt, Failla & Snyder-Mackler 2017, *JOSPT*). In 70 athletes, only 28.6% met 90% of EPIC, where EPIC = involved limb after surgery vs the uninvolved limb's pre-injury values. EPIC predicted second ACL injury better than LSI (reported 0.818 vs 0.273). — [PubMed 28355978](https://pubmed.ncbi.nlm.nih.gov/28355978/); [PMC5483854](https://pmc.ncbi.nlm.nih.gov/articles/PMC5483854)
- Kotsifaki et al. 2021, *Am J Sports Med*: "Symmetry in triple hop distance hides asymmetries in knee function in ACL-reconstructed athletes at the time to return to sport." Hop distance symmetry can mask joint-level (biomechanical) asymmetry. I only read the title; full results not verified. — [NIH Brage PDF](https://nih.brage.unit.no/nih-xmlui/bitstream/handle/11250/2984556/Bahr+AmJSportMed+2021.pdf?sequence=1)
- 2016 Bern consensus on return to sport (Ardern et al., *BJSM* 50(14):853–64; 17 experts):
  - Return to sport is a continuum alongside rehab, not a single end-point decision.
  - It recommends biopsychosocial models and the StARRT framework (Strategic Assessment of Risk and Risk Tolerance).
  - It states that research evidence for RTS decisions is scarce.
  — [PubMed 27226389](https://pubmed.ncbi.nlm.nih.gov/27226389/)

### Inferences
- For an app calculator, default to the reference-independent %Diff, (stronger − weaker)/stronger × 100, signed for direction. Also offer the clinical LSI = involved/uninvolved × 100 because ACL RTS criteria are written in LSI terms. Show both.
- Flag an asymmetry only when it exceeds the test's typical error or CV. Present 10–15% as a convention, not a validated injury predictor.
- For ACL patients, the app should prompt for baseline or pre-injury values (EPIC) when available. It should also not treat LSI ≥90% alone as sufficient for RTS, consistent with Bern 2016 and Wellsandt 2017.

### Gaps
- I did not retrieve the exact algebra of all 12 indices from Parkinson Table 3. For example, Bilateral Asymmetry Index 1 is described only as "relative to the total."
- I did not verify the Maestroni/Bishop 2026 JSCR full text.
- I did not retrieve the Helme 2021 findings or Kotsifaki 2021 numeric results.
- Grindem's per-criterion results come from secondary sources.

## 2. Standard tests: hop battery, Y-Balance, isokinetic H:Q, shoulder ER:IR, grip strength

### Takeaway
- The Noyes hop battery (single, triple, crossover, 6 m timed) is specific but not sensitive for detecting deficits.
- Y-Balance cut-offs (anterior asymmetry ≥4 cm; composite <94% of limb length) come from one 2006 basketball cohort and have been inconsistently replicated.
- H:Q ≥0.6 (conventional) and ~1.0 (functional) have prospective support mainly in sprinters and male athletes; women team-sport athletes average about 0.56.
- The classic shoulder ER:IR "66%" ideal is outdated and sport-specific.
- The grip "10% rule" holds roughly only for right-handers.

### Cited Findings

**Hop battery (Noyes, Barber & Mangine 1991, *Am J Sports Med* 19(5):513–8)**
- Four tests: single hop, triple hop, crossover hop and 6 m timed hop.
- In 67 ACL-deficient knees, about half showed abnormal symmetry on any single test, rising to 62% when two tests were combined.
- Conclusion: low sensitivity, high specificity.
— [PubMed 1962720](https://pubmed.ncbi.nlm.nih.gov/1962720/)
- The <85% "abnormal" hop limb symmetry derives from Barber et al. 1990 normative data. — [Parkinson et al. 2021](https://www.jssm.org/jssm-20-594.xml-Fulltext)
- A later study reported a 6 m timed hop LSI cut-off of 87.7% (specificity 0.90) for 6-month outcomes. This is a different study and should not be conflated with Noyes 1991. — [PMC3462240 table](https://pmc.ncbi.nlm.nih.gov/articles/PMC3462240/table/T6)

**Y-Balance / Star Excursion (Plisky et al. 2006, *JOSPT*; 235 high-school basketball players)**
- Anterior R/L reach difference >4 cm → 2.5× higher lower-extremity injury risk.
- Girls with composite reach <94.0% of limb length → 6.5× higher risk.
- Reliability ICC 0.82–0.87.
— [PubMed 17193868](https://pubmed.ncbi.nlm.nih.gov/17193868/)
- Composite reach is normalized as (A + PM + PL) / (3 × limb length) × 100. This is the conventional formula; it is implied by the "% of limb length" wording in Plisky but the exact formula was not read in the source.
- Secondary sites claim a male risk figure for the 94% composite (e.g., "3×"). The abstract does not support this. — [Topendsports](https://new.topendsports.com/testing/tests/balance-star-excursion.htm) vs [PubMed 17193868](https://pubmed.ncbi.nlm.nih.gov/17193868/)
- Plisky et al. 2021 systematic review (*IJSPT*): only 3 of 13 studies found a relationship between anterior reach asymmetry and injury; overall evidence moderate to low. — [PMC8486397](https://pmc.ncbi.nlm.nih.gov/articles/PMC8486397); [PubMed 34631241](https://pubmed.ncbi.nlm.nih.gov/34631241/)
- In 346 elite male youth soccer players (Read et al.), an absolute anterior reach difference >4 cm showed no difference in injury occurrence. The authors advise caution in using the YBT as a screen. — [Glos eprints](https://eprints.glos.ac.uk/8435/)
- Guan 2022 found some cohorts reporting injury links at 4 cm (posteromedial ≥4 cm OR 5.05; anterior 4 cm OR 2.20), while many others found none. It recommends normalizing to leg length and standardizing the protocol. — [Guan 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8779786/)

**Isokinetic hamstring:quadriceps ratio**
- A conventional ratio (concentric H / concentric Q) of 0.60 has long been advocated to minimize injury, supported by prospective studies in collegiate track and field and Australian football.
- In sprinters (Yeung et al. 2009, n=44), H:Q <0.60 at 180°/s was associated with a 17-fold higher hamstring injury risk; a thesis version of the same work reports 14-fold.
— [PubMed 19174411](https://pubmed.ncbi.nlm.nih.gov/19174411/)
- One study compared conventional H:Q cut-offs of 0.47, 0.60 and 0.658 for predicting hamstring injury in professional male footballers. The cut-off chosen materially changes sensitivity and specificity. — [PMC5720729](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5720729/)
- A systematic review of women team-sport athletes found mean conventional ratios of 0.56 ± 0.08 (team), 0.57 ± 0.08 (field) and 0.56 ± 0.08 (court). Neither the 0.6 conventional nor the 1.0 functional cut-off (eccentric H / concentric Q) was met on average. — [LIDA record](https://lida.sport-iat.de/ta/Record/4090445?lng=en)
- Inter-limb eccentric hamstring asymmetry ≥15% predicted hamstring strain (OR 3.88; Bourne 2015 per review). — [Guan 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8779786/)

**Shoulder ER:IR**
- A systematic review (Bagordo et al., *Sports* 2020; 13 studies of overhead athletes) found:
  - Prospective studies: strong evidence that reduced IR endurance and reduced ER:IR strength ratios predict shoulder injury.
  - Cross-sectional studies: conflicting or limited evidence.
  — [PMC7552688](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7552688/)
- A concentric ER/IR ratio of about 66% was considered "ideal" in 1980s–90s literature; these targets have since been revised. — [SciELO, Fisioter Mov](https://scielo.br/j/fm/a/PhK8r7sxYzkLLxZg8LXCBRJ/?lang=en)
- Conventional ER:IR ratios vary by sport (237 athletes, 2021): female softball 90.4 ± 13.6%, volleyball 74.9 ± 15.9%, swimming 70.3 ± 8.7%, judo 67.3 ± 6.9%. — [IJSPT 2021, DOAJ](https://doaj.org/article/d35fbbb23c244c269a79174944a7ab89)

**Grip strength**
- Petersen et al. 1989 (*AJOT*, n=310, Jamar dynamometer) found an overall dominant–non-dominant difference of 10.74%, supporting the "10% rule." Split by handedness, the difference was 12.72% in right-handers and −0.08% in left-handers. For left-handers, the hands should be treated as equal.
- The rule traces to Bechtol 1954, who observed a 5–10% difference.
— [Elizabethtown JayScholar](https://jayscholar.etown.edu/facpubharvest/1567)
- A factory-worker study (*Work* 1997) concluded that grip norms should not rely on a percent-difference rule. — [SAGE](https://journals.sagepub.com/doi/abs/10.3233/WOR-1997-8110)
- In aging Americans (Health and Retirement Study, age 50+), grip asymmetry was defined as >10% difference either way. Asymmetry and weakness were each associated with higher odds of future ADL disability. — [McGrath et al. PDF](https://education.und.edu/research/_files/docs/mcgrath-handgrip-strength-asymmetry-and-weakness.togetherare.associated.with.functional.disability.inaging.americans.pdf)

### Inferences
- In the app, a hop battery module should compute LSI per test. It should flag <90% for ACL RTS (Grindem) and <85% as "abnormal" (Barber/Noyes), and label both as conventions.
- A YBT module should normalize reach to limb length. It should flag anterior asymmetry ≥4 cm and composite <94%, citing the original population (adolescent basketball) and noting inconsistent replication.
- Shoulder ER:IR thresholds should be sport-specific reference values rather than a fixed 66%.
- A grip module should apply the 10% expectation only to right-handers.

### Gaps
- Exact Noyes timing protocol details (e.g., 6 m timed hop as a "time" LSI, inverted so faster = better) were not retrieved from the primary source.
- I found no pooled meta-analytic validation of H:Q 0.6 or functional ratio 1.0.
- Plisky 2021 pooled effect sizes and a validated isokinetic ER:IR injury cut-off were not found.

## 3. Postural alignment and static posture: Kendall, Janda crossed syndromes, scoliosis screening, leg-length discrepancy, and the posture–pain link

### Takeaway
Static posture shows at best weak and inconsistent association with pain:
- An umbrella review of 41 systematic reviews found no consensus that spinal posture causes low back pain.
- Forward head posture differs only modestly between people with and without neck pain, and age confounds the comparison.
- Janda's upper and lower crossed syndromes are clinically popular, but their causal model is supported mainly by low-quality or descriptive evidence.

Scoliosis screening uses Adams forward bend plus a scoliometer, referring at ATR 5–7°. Anatomic leg-length discrepancy is rarely clinically significant below about 20 mm.

### Cited Findings

**Posture and pain**
- Swain et al. 2020 (*J Biomech* 102:109312), an umbrella review screening 4,285 records and including 41 systematic reviews appraised with AMSTAR and Bradford Hill:
  - Associations between spinal posture or physical exposures and LBP were mixed.
  - Prospective evidence for temporality and dose-response was inconsistent.
  - Conclusion: "no consensus on causality."
  — [PubMed 31451200](https://pubmed.ncbi.nlm.nih.gov/31451200/); [ACU](https://acuresearchbank.acu.edu.au/item/8wq8w/no-consensus-on-causality-of-spine-postures-or-physical-exposure-and-low-back-pain-a-systematic-review-of-systematic-reviews)
- Mahmoud et al. 2019 (*Curr Rev Musculoskelet Med* 12:562–577; 7 studies):
  - With all ages pooled, there was no significant forward head posture (FHP) difference between neck-pain and asymptomatic groups.
  - Excluding adolescents and the elderly, adults with neck pain had a 4.84° smaller craniovertebral angle (95% CI 0.14–9.54).
  - FHP correlated with neck pain intensity and NDI disability.
  — reported via secondary citing papers: [Zaguan/Unizar PDF](https://zaguan.unizar.es/record/145251/files/texto_completo.pdf); [MDPI Appl Sci 2024](https://www.mdpi.com/2076-3417/14/19/8639)
- Andias & Silva 2019 meta-analysis: no FHP difference in adolescents with vs without neck pain. It included low-quality, heterogeneous studies. — [MDPI Appl Sci 2024](https://www.mdpi.com/2076-3417/14/19/8639)
- Lederman 2011 (*J Bodyw Mov Ther*), a debate paper:
  - The "postural-structural-biomechanical" model has been eroded by research.
  - There is no reliably proven relationship between LBP and posture, structure or asymmetry.
  - Visual and manual assessment of these factors may be unreliable.
  - These factors are unlikely to change long-term with manual therapy.
  Rebuttals were invited (Fryer, Lee, McGill and others). This is an opinion/debate piece. — [PainScience summary](https://www.painscience.com/biblio/fall-of-the-postural-structural-biomechanical-model.html); [Westminster debate record](https://westminsterresearch.westminster.ac.uk/item/8zvw3/is-a-postural-structural-biomechanical-model-within-manual-therapies-viable-a-jbmt-debate); [McGill response PDF](https://www.backfitpro.com/medical-scientific-articles/2011/[69]McGill,S.M.(2011)Is-a-postural-structural-biomechanical-model-within-manual-therapies-viable(Invited-Response)[J.Bodywork-and-Movement-Ther.].pdf)

**Janda upper crossed syndrome (UCS)**
- Pattern: tight or overactive upper trapezius, pectoralis major and levator scapulae, with weak rhomboids, serratus anterior, middle/lower trapezius and deep cervical flexors. Presented as producing FHP, rounded shoulders and neck/upper-back pain. — [Serbian systematic review PDF](https://scindeks-clanci.ceon.rs/data/pdf/2335-0598/2020/2335-05982002152R.pdf)
- A 2024 systematic review and meta-analysis (*BMC Musculoskelet Disord*) concluded that prescribing exercise to improve posture in UCS "requires more robust scientific evidence." — [PMC10832142](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10832142/)
- A 2026 meta-analysis of corrective exercise RCTs in UCS (*BMC Sports Sci Med Rehabil*) states that effectiveness across outcomes "remains unclear." Pooled numbers not retrieved. — [Springer s13102-026-01707-8](https://link.springer.com/10.1186/s13102-026-01707-8)
- A narrative systematic review links sustained FHP to cervical muscle imbalance, suboccipital trigger points, TMD and tension-type headache. These are associations, not causation. — [PMC10572307](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10572307/)

**Scoliosis screening**
- The SRS International Task Force information statement (Scoliosis 2013;8:17) calls the scoliometer "the best tool available" and reports moderate evidence for referral at ATR between 5° and 7°. Screening aims to identify suspected cases for diagnostic confirmation; radiographic Cobb angle is the diagnosis. — [PMC3835138](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3835138/)
- Older AAOS/SRS-era guidance (*Am Fam Physician* 2001):
  - 7° ATR is the usual referral cut-off and corresponds roughly to a 20° Cobb angle.
  - Screen girls at about 10 and 12 years and boys at 13–14.
  — [AAFP 2001](https://www.aafp.org/afp/2001/0701/p32)
- Scoliometer vs radiograph correlation r = 0.7. — [Redalyc PDF](https://www.redalyc.org/pdf/2350/235026389001.pdf)

**Leg-length discrepancy (LLD)**
- Knutson 2005 review (*Chiropr Osteopat* 13:11):
  - Anatomic LLD is present in about 90% of people when measured accurately by x-ray, with mean 5.2 mm (SD 4.1).
  - It does not appear clinically significant for most people until about 20 mm (~3/4").
  — [PMC1232860](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1232860/)
- Examiners could not reliably detect LLD of ≤1 cm clinically. — [search summary of LLD reliability study via e3rehab](https://e3rehab.com/?p=3904)

### Inferences
- A posture checklist in the app should be framed as descriptive. It can record items such as FHP/CVA, shoulder protraction, kyphosis, pelvic tilt and LLD, but it should not imply that a finding is the cause of pain. A disclaimer citing Swain 2020 and Mahmoud 2019 is appropriate.
- Janda UCS/LCS can be offered as a clinical-pattern label, flagged "low evidence / hypothesis-generating."
- Scoliosis screen logic: if the Adams forward bend is positive and ATR ≥5–7°, refer for radiograph. Note that the 5° threshold increases sensitivity at the cost of more over-referral; this trade-off is my inference.
- LLD: flag ≥20 mm as potentially clinically relevant. Note that clinical tape measures are unreliable at ≤10 mm.

### Gaps
- I could not retrieve Kendall's "ideal alignment" plumb-line landmarks from a primary or accessible source (*Muscles: Testing and Function*, 5th ed., 2005). Textbook content is commonly described as a lateral line through the ear lobe, acromion, greater trochanter, slightly anterior to the knee axis, and slightly anterior to the lateral malleolus, but this is unverified here.
- I found no source for Janda's lower crossed syndrome specifically: tight hip flexors and erector spinae, weak abdominals and gluteals.
- Gurney 2002 (LLD) primary text not retrieved.
- Current (2024–2026) SRS screening wording not found. The USPSTF stance on scoliosis screening was not searched.

## 4. Postural balance and stability tests: single-leg stance, BESS, Berg, TUG — normative values and cut-offs

### Takeaway
- Single-leg stance time declines with age; Springer 2007 provides age-banded norms.
- BESS errors increase after age 50 (Iverson & Koehle 2013 norms by age and sex).
- Berg Balance Scale <45 and TUG >13.5 s are the most cited fall-risk cut-offs in community-dwelling older adults. Population-specific cut-offs differ (e.g., stroke BBS 45.5, TUG 15.22 s).

### Cited Findings

**Single-leg stance (unipedal stance test)**
- Springer et al. 2007 (*J Geriatr Phys Ther* 30(1):8–15): 549 healthy adults aged 18+ in 6 age groups. Stance time decreases significantly with age both eyes open and closed. — [Missouri geriatric toolkit PDF](https://geriatrictoolkit.missouri.edu/balance/Normative_Values_for_the_Unipedal_Stance_Test_Springer-JGPT.pdf); [SRAlab](https://www.sralab.org/rehabilitation-measures/timed-unipedal-stance-test-single-leg-support-one-leg-stance-test)
- Eyes-open age-band values attributed to Springer by a secondary source (not verified against the paper's table): 18–39 ≈ 44 s; 40–49 ≈ 41 s; 50–59 ≈ 41 s; 60–69 ≈ 32 s; 70–79 ≈ 21 s; 80–99 ≈ 9 s. — [The Prehab Guys](https://library.theprehabguys.com/?p=18547)
- The 10 s fall-risk cut-off (attributed to Jacobs) was not confirmed by later studies (Mak 2009, 2010) and may not be valid in people over 80. — [SRAlab single leg stance](https://sralab.org/rehabilitation-measures/single-leg-stance-or-one-legged-stance-test)

**Balance Error Scoring System (BESS)**
- Iverson & Koehle 2013 published adult norms: 1,236 community adults aged 20–69, stratified by age and sex.
  - Scores were stable from 20 to 49 and worsened significantly from 50 to 69 (r = 0.34 with age).
  - Men scored slightly better than women.
  - BESS involves 6 × 20 s trials (3 stances × firm/foam), with errors counted.
  — [PMC3614029](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3614029/)
- A third-party template lists ~8–14 errors as typical for ages 20–29. This is unverified against the original tables. — [Carepatron](https://www.carepatron.com/templates/balance-error-scoring-system/)

**Berg Balance Scale (BBS, 0–56) and Timed Up and Go (TUG)**
- AAPM&R balance table:
  - BBS <45 (range 45–49 cited) indicates high fall risk in older adults; sensitivity 53%, specificity 96%.
  - TUG >13.5 s indicates fall risk in community-dwelling older adults.
  — [AAPM&R PDF](https://now.aapmr.org/wp-content/uploads/2017/03/Assessment-and-Treatment-of-Balance-Impairments-Table-1.pdf)
- In stroke (83 patients, 2021), optimal cut-offs were BBS 45.5 and TUG 15.22 s; the BBS was more sensitive. — [KKU repository](https://acikerisim.kku.edu.tr/items/e4a6eb8b-3088-490d-9f8d-483b646c7a9c)

### Inferences
- The app should store population-specific cut-offs (community elderly vs stroke vs others) rather than a single value. It should show sensitivity and specificity alongside, since BBS <45 has low sensitivity (53%) and a "pass" does not rule out fall risk.

### Gaps
- I did not obtain primary SRAlab pages for BBS or TUG. The original sources (Berg 1992; Shumway-Cook 2000 for TUG 13.5 s, sens/spec 87%) were not retrieved directly.
- BESS age/sex percentile tables were not extracted.
- MDC/MCID values for BBS and TUG were not retrieved.

## 5. The muscle imbalance concept: evidence base, criticisms, modern view

### Takeaway
Classic "muscle imbalance" models (Janda's tight/weak or phasic/tonic crossed syndromes; Kendall's length–strength balance; ideal ratios such as H:Q 0.6 and ER:IR 66%) remain widely taught and useful as descriptive heuristics. However:
- Their causal claims are weakly supported.
- Imbalance thresholds are population- and sport-specific.
- Modern views emphasize individual baselines, test reliability (CV, typical error), multifactorial or biopsychosocial risk, and serial monitoring rather than a single "imbalance → injury" cut-off.

### Cited Findings
- Thresholds such as 10–15% are mostly unsupported (only 33% of threshold-applying studies gave Tier 1–2 evidence). The authors advocate individual and sample-specific interpretation. — [Parkinson et al. 2021](https://www.jssm.org/jssm-20-594.xml-Fulltext)
- Asymmetry–injury associations are "highly inconsistent" across 28 prospective cohorts. — [Guan 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8779786/)
- Population matters for agonist:antagonist "ideal" ratios:
  - H:Q norms differ by sex and sport (women ~0.56). — [LIDA](https://lida.sport-iat.de/ta/Record/4090445?lng=en)
  - The ER:IR 66% "ideal" has been revised. — [SciELO](https://scielo.br/j/fm/a/PhK8r7sxYzkLLxZg8LXCBRJ/?lang=en)
- Some asymmetry may be normal or adaptive in sport. One narrative review is titled "Why sports should embrace bilateral asymmetry." — [Middlesex repository](https://repository.mdx.ac.uk/item/8q313)
- The postural-structural-biomechanical model has been critiqued as unsupported for LBP (Lederman 2011), with rebuttals from McGill and others in the same debate. — [Westminster](https://westminsterresearch.westminster.ac.uk/item/8zvw3/is-a-postural-structural-biomechanical-model-within-manual-therapies-viable-a-jbmt-debate)
- Exercise for UCS posture lacks robust evidence (2024 meta-analysis). — [PMC10832142](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10832142/)
- RTS decisions should be a continuum, multifactorial and grounded in risk management (Bern 2016), not a single symmetry number. — [PubMed 27226389](https://pubmed.ncbi.nlm.nih.gov/27226389/)
- In contrast, some prospective evidence does support specific imbalances:
  - H:Q <0.6 in sprinters (17×). — [PubMed 19174411](https://pubmed.ncbi.nlm.nih.gov/19174411/)
  - Reduced ER:IR ratio and IR endurance in overhead athletes (prospective studies). — [PMC7552688](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7552688/)
  - Eccentric hamstring asymmetry ≥15%. — [Guan 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8779786/)

### Inferences
- The defensible product design is to compute and display imbalance metrics with their source population and evidence grade, and to compare them with the patient's own baseline and the test's CV, rather than issuing binary "imbalanced" diagnoses.
- Evidence tiers for UI labels:
  - Moderate: ACL RTS battery (LSI ≥90%); BBS and TUG fall-risk cut-offs.
  - Low–moderate: YBT 4 cm/94%; H:Q 0.6; 10–15% asymmetry.
  - Low or hypothesis: Janda crossed syndromes; static posture → pain.

### Gaps
- I found no primary source for Janda/Page/Lardner (*Assessment and Treatment of Muscle Imbalance: The Janda Approach*, 2010) describing phasic vs tonic muscle classification or its validation.
- No 2024–2026 consensus statement specifically on "muscle imbalance" was found.
- APTA clinical practice guidelines on posture or asymmetry were not searched within budget.
