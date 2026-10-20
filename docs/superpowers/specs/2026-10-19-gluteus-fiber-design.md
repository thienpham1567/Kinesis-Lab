# Gluteus medius evidence, geometry audit and surface labels

## Approved scope and steering

The user approved the gluteus medius pilot, then required medically accurate knowledge from reputable sources. That requirement supersedes the proposed geometry-derived fan field. The experimental fan helper is excluded from app source/runtime; no measured fiber architecture is claimed or enabled.

## Design

Preserve the clinical editorial UI. Add a structured, versioned evidence record for bilateral gluteus medius with claim-level citations for origin, insertion, innervation and principal function. Display checked date, access scope in metadata, and explicit pending independent expert review. Sources are UW Radiology, McGraw Hill Gross Anatomy table35-1, StatPearls and two anatomical studies. References do not clinically validate the mesh.

Two accessible source-region label buttons (“Thân cơ”, “Vùng gân”) follow actual camera-facing source triangles, hide outside view/behind visible geometry, and focus their region with mouse or keyboard. They are not asserted origin/insertion landmarks. A native checkbox toggles labels without changing camera. React owns visibility state; the on-demand Three stage owns label positioning and cleanup.

Decode and audit the original GLB for finite positions/normals, degenerate faces and distance-welded topology. Preserve source geometry; no cosmetic subdivision is substituted for anatomical detail. Record limitations such as coarse triangle edges. Keep existing Original/Simulated, heatmap, opacity, retry and selection semantics.

## Acceptance

Each new fact resolves to a source; no false expert-validation or fiber-map status appears. Both sides share the correct fact record. Labels support keyboard focus, correct tissue targeting, toggle, hidden/ineligible state, resize and disposal. Source GLB hashes remain unchanged. Verify on desktop and390px, run existing/new checks, lint/build and independent software review. Expert anatomical/clinical approval remains pending.
