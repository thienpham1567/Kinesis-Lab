# Medical image pretext implementation

User instruction: implement a reusable, source-grounded medical pretext combined with the user's visual request, then generate and assess two medical cases. Existing choices remain Sunburst, automatic sizing/quality, and all lettering painted by the image model.

Approach: use a versioned server-owned medical policy at both brief and raster stages, plus a bounded evidence context with canonical claim/source IDs. A policy-only string would leave the current source-metadata gap unresolved; this adds actual supported facts. Do not add an image-as-clinically-validated badge or an expert-approval gate.

- [ ] Add policy, canonical evidence claims and automatic local evidence selection. Two focused claim packs use sources actually checked for elbow flexors and ACL/PCL; existing curated records cover other locally matched topics, with their specific limits.
- [ ] Extend brief parsing with bounded explanation copy and source-linked claim IDs; canonicalize source metadata. Pass the original user request as delimited task data alongside the fixed policy. Record policy version/hash in new receipts.
- [ ] Add regression cases for policy inclusion in both stages, instruction isolation, source/claim canonicalization, explanation bounds and API integration. Keep historical receipts readable.
- [ ] Run image/chat tests, build and lint. Generate exactly two initial medical cases through the app route, save receipts/images, inspect exact lettering and medical relationships against sources, and report failures or uncertainties as well as successes.
- [ ] Push the implementation and deploy within the existing production rollout authorization; verify the deployed prompt version. Record the finite source coverage and avoid claiming clinical validation from software tests or visual appearance.

Evaluation cases: right elbow flexors (superficial/deep arrangement, radial vs ulnar insertion) and ACL/PCL (femur/tibia connections and opposing restraints of tibial translation). Review dates remain factual; `reviewedBy` remains null.
