"""Run with Blender --background --factory-startup --disable-autoexec SOURCE.blend --python scripts/export_z_anatomy.py.

Only reads source geometry. No source add-on or embedded scripts are executed.
Outputs CC BY-SA assets into public/anatomy/3d; Blender-specific source shaders,
modifiers, labels, visceral structures and insertion overlays are excluded.
"""
import bpy
import hashlib
import json
import re
import sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT / "scripts"))
from z_anatomy_surfaces import classify_surface, bake_thickness, THICKNESS_NAMES
if bpy.context.scene.unit_settings.scale_length != 1.0:
    raise RuntimeError("Thickness fields require source units of one metre")
SOURCE = ROOT / ".data/z-anatomy"
OUTPUT = ROOT / "public/anatomy/3d"
OUTPUT.mkdir(parents=True, exist_ok=True)
PIN = json.loads((SOURCE / "source.json").read_text())
LATIN = {}
for line in (SOURCE / "TA2.csv").read_text(encoding="utf-8-sig").splitlines():
    row = line.strip().strip('"').split(";")
    if len(row) >= 3:
        LATIN[row[1].lower()] = row[2]

TRANSLATIONS = [
    ("gluteus maximus", "Cơ mông lớn"), ("gluteus medius", "Cơ mông nhỡ"), ("gluteus minimus", "Cơ mông bé"),
    ("clavicular head of pectoralis", "Cơ ngực lớn · bó đòn"), ("sternocostal head of pectoralis", "Cơ ngực lớn · bó ức sườn"),
    ("pectoralis major", "Cơ ngực lớn"), ("pectoralis minor", "Cơ ngực bé"),
    ("clavicular part of deltoid", "Cơ delta · bó trước"), ("acromial part of deltoid", "Cơ delta · bó giữa"), ("spinal part of deltoid", "Cơ delta · bó sau"),
    ("deltoid", "Cơ delta"), ("latissimus dorsi", "Cơ lưng rộng"), ("trapezius", "Cơ thang"), ("rhomboid", "Cơ trám"),
    ("biceps brachii", "Cơ nhị đầu cánh tay"), ("triceps brachii", "Cơ tam đầu cánh tay"),
    ("biceps femoris", "Cơ nhị đầu đùi"), ("semitendinosus", "Cơ bán gân"), ("semimembranosus", "Cơ bán màng"),
    ("rectus femoris", "Cơ thẳng đùi"), ("vastus lateralis", "Cơ rộng ngoài"), ("vastus medialis", "Cơ rộng trong"), ("vastus intermedius", "Cơ rộng giữa"),
    ("gastrocnemius", "Cơ bụng chân"), ("soleus", "Cơ dép"), ("tibialis anterior", "Cơ chày trước"), ("tibialis posterior", "Cơ chày sau"),
    ("rectus abdominis", "Cơ thẳng bụng"), ("external oblique", "Cơ chéo bụng ngoài"), ("internal oblique", "Cơ chéo bụng trong"), ("transversus abdominis", "Cơ ngang bụng"),
    ("serratus anterior", "Cơ răng trước"), ("supraspinatus", "Cơ trên gai"), ("infraspinatus", "Cơ dưới gai"), ("subscapularis", "Cơ dưới vai"),
    ("teres minor", "Cơ tròn bé"), ("teres major", "Cơ tròn lớn"), ("piriformis", "Cơ hình lê"), ("iliacus", "Cơ chậu"), ("psoas", "Cơ thắt lưng"),
    ("adductor longus", "Cơ khép dài"), ("adductor brevis", "Cơ khép ngắn"), ("adductor magnus", "Cơ khép lớn"), ("sartorius", "Cơ may"), ("gracilis", "Cơ thon"),
    ("sternocleidomastoid", "Cơ ức đòn chũm"), ("levator scapulae", "Cơ nâng vai"), ("quadratus lumborum", "Cơ vuông thắt lưng"),
    ("anterior cruciate ligament", "Dây chằng chéo trước"), ("posterior cruciate ligament", "Dây chằng chéo sau"),
    ("lateral meniscus", "Sụn chêm ngoài"), ("medial meniscus", "Sụn chêm trong"), ("patellar ligament", "Dây chằng bánh chè"),
    ("scapula", "Xương bả vai"), ("clavicle", "Xương đòn"), ("humerus", "Xương cánh tay"), ("radius", "Xương quay"), ("ulna", "Xương trụ"),
    ("femur", "Xương đùi"), ("tibia", "Xương chày"), ("fibula", "Xương mác"), ("patella", "Xương bánh chè"), ("hip bone", "Xương chậu"),
    ("sacrum", "Xương cùng"), ("coccyx", "Xương cụt"), ("calcaneus", "Xương gót"), ("talus", "Xương sên"), ("vertebra", "Đốt sống"),
]

# Name-based clinicalRegion overrides (matched against the lower-cased English name).
# Keep in sync with SHOULDER_GIRDLE_NAME_PATTERN / LARYNX_PHARYNX_MUSCLE_NAME_PATTERN
# in src/lib/clinical/atlas-3d.ts.
SHOULDER_GIRDLE_NAME = r'spinatus|subscapular|teres (major|minor)|serratus anterior|pectoralis|latissimus dorsi|scapul|clavic'
LARYNX_PHARYNX_MUSCLE_NAME = r'(arytenoid|cricothyroid) muscle|pharyngeal constrictor|palatopharyngeus|stylopharyngeus|salpingopharyngeus'

GROUPS = [
    (r"gluteus|piriformis|obturator|gemellus|quadratus femoris", "glutes"),
    (r"pectoralis|serratus anterior", "chest"), (r"deltoid|supraspinatus|infraspinatus|subscapularis|teres minor", "deltoids"),
    (r"latissimus|teres major", "lats_teres"), (r"trapezius|rhomboid|erector|multifidus|iliocostalis|longissimus|spinalis", "upper_back_traps"),
    (r"triceps brachii|anconeus", "triceps"), (r"biceps brachii|brachialis|brachioradialis|pronator|supinator|carpi", "biceps_forearm"),
    (r"abdominis|oblique.*abdom|quadratus lumborum", "abs_obliques"),
    (r"biceps femoris|semitendinosus|semimembranosus", "hamstrings"),
    (r"rectus femoris|vastus|adductor|sartorius|gracilis", "quads_adductors"),
    (r"gastrocnemius|soleus|tibialis|fibularis|popliteus", "calves"),
]

AREAS = ["full", "neck", "upper", "trunk", "hip", "lower"]
COLORS = {"bone": (0.73, 0.64, 0.49, 1), "muscle": (0.49, 0.14, 0.16, 1), "joint": (0.2, 0.47, 0.41, 1),
          "cartilage": (.79,.86,.85,1), "tendon": (.8,.76,.64,1), "ligament": (.65,.71,.64,1), "fat": (.75,.57,.25,1)}
materials = {}
for layer, color in COLORS.items():
    material = bpy.data.materials.new("Kinesis_" + layer)
    material.diffuse_color = color
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs['Base Color'].default_value = color
    shader.inputs['Roughness'].default_value = 0.68
    materials[layer] = material

scene = bpy.data.scenes.new("Kinesis export")
originals = list(bpy.data.objects)
bpy.context.window.scene = scene
metadata, objects = [], []
for source in sorted(originals, key=lambda o: o.name):
    if source.type != 'MESH' or not source.data.vertices or not source.data.polygons or source.name.endswith(('.i', '.j', '.ol', '.or', '.el', '.er', '.g')):
        continue
    collections = {c.name for c in source.users_collection}
    if 'Head' in collections or 'ethmoid bone' in source.name.lower():
        continue
    if '1: Skeletal system' in collections:
        layer = 'bone'
    elif 'Muscles' in collections and '4: Muscular system' in collections:
        layer = 'muscle'
    elif '3: Joints' in collections:
        layer = 'joint'
    else:
        continue
    english = re.sub(r'\.(l|r)$', '', source.name).strip()
    if english.startswith('(') and english.endswith(')'): english = english[1:-1]
    lower = english.lower()
    side = 'left' if source.name.endswith('.l') else 'right' if source.name.endswith('.r') else None
    corners = [source.matrix_world @ Vector(v) for v in source.bound_box]
    low, high = min(v.z for v in corners), max(v.z for v in corners)
    center = (low + high) / 2
    areas = []
    if 'Neck' in collections or re.search(r'vertebra C|Atlas \(C1\)|Axis \(C2\)', english): areas.append('neck')
    if any('upper limb' in c.lower() for c in collections) or re.search(r'pectoralis|deltoid|scapula|clavicle|serratus anterior|teres |spinatus', lower): areas.append('upper')
    if 'Trunk' in collections or 'Back' in collections: areas.append('trunk')
    if re.search(r'glute|hip|iliac|psoas|iliacus|sacrum|coccyx|pubic|ischi|piriform|obturator|gemellus|quadratus femoris|acetabular|iliofemoral|pubofemoral|ischiofemoral', lower): areas.append('hip')
    if any('lower limb' in c.lower() for c in collections): areas.append('lower')
    if not areas: areas.append('neck' if center > 1.4 else 'trunk' if center > .95 else 'hip' if center > .75 else 'lower')
    # Include proximal femur context without inventing a cut surface.
    if lower == 'femur': areas.append('hip')
    areas = sorted(set(areas))
    group = next((group for pattern, group in GROUPS if re.search(pattern, lower)), None) if layer == 'muscle' else None
    region = 'shoulder' if 'upper' in areas else 'cervical' if 'neck' in areas else 'hip_pelvis' if 'hip' in areas else 'knee' if 'lower' in areas else 'lumbar'
    if 'upper' in areas and not re.search(r'shoulder|glenohumeral|acrom|scapul|clavic|deltoid|spinatus|subscapular|teres |humerus', lower): region = None
    if 'lower' in areas and 'hip' not in areas:
        region = 'ankle_foot' if center < .42 else 'knee' if center < .6 else 'thigh_hamstring'
    if 'trunk' in areas and 'neck' not in areas and 'hip' not in areas and center > 1.15: region = 'thoracic_core'
    # Name-based overrides take precedence over the geometric trunk-height rule above.
    # Keep in sync with resolveClinicalRegion() in src/lib/clinical/atlas-3d.ts.
    if re.search(SHOULDER_GIRDLE_NAME, lower): region = 'shoulder'
    elif re.search(LARYNX_PHARYNX_MUSCLE_NAME, lower): region = None
    label = next((vi for en, vi in TRANSLATIONS if en == lower or (layer == 'muscle' and vi.startswith('Cơ ') and en in lower)), english)
    identity = 'za-' + hashlib.sha256(source.name.encode()).hexdigest()[:12]
    obj = bpy.data.objects.new(identity, source.data.copy())
    obj.matrix_world = source.matrix_world.copy()
    # Collapse function-color variants into tissue families, preserving every face boundary.
    surface_counts = {}
    source_index_to_kind = {}
    for index, slot in enumerate(source.material_slots):
        name = slot.material.name if slot.material else ''
        source_index_to_kind[index] = classify_surface(name, layer)
    for poly in source.data.polygons:
        kind = source_index_to_kind.get(poly.material_index,layer)
        item = surface_counts.setdefault(kind,{'kind':kind,'faces':0,'sourceMaterials':set()})
        item['faces'] += 1
        if poly.material_index < len(source.material_slots) and source.material_slots[poly.material_index].material:
            item['sourceMaterials'].add(source.material_slots[poly.material_index].material.name)
    kinds = sorted(surface_counts)
    # Keep the source polygon indices separately; clearing slots resets them in Blender.
    face_kinds = [source_index_to_kind.get(poly.material_index,layer) for poly in source.data.polygons]
    obj.data.materials.clear()
    for kind in kinds: obj.data.materials.append(materials[kind])
    for poly, kind in zip(obj.data.polygons,face_kinds): poly.material_index = kinds.index(kind)
    thickness = None
    if source.name in THICKNESS_NAMES:
        baked = bake_thickness(source)
        if 'stats' in baked:
            thickness = baked['stats']
            for name, values in [('_THICKNESS',baked['values']),('_THICKNESS_VALID',baked['validity'])]:
                if name in obj.data.attributes: obj.data.attributes.remove(obj.data.attributes[name])
                attr = obj.data.attributes.new(name=name,type='FLOAT',domain='POINT')
                attr.data.foreach_set('value',values)
            print('THICKNESS',source.name,json.dumps(thickness),flush=True)
        else: print('THICKNESS_SKIPPED',source.name,baked,flush=True)
    surfaces = [{**item,'sourceMaterials':sorted(item['sourceMaterials'])} for item in surface_counts.values()]
    scene.collection.objects.link(obj)
    objects.append(obj)
    metadata.append(dict(id=identity, english=english, latin=LATIN.get(lower, ''), label=label, side=side, layer=layer, areas=areas, group=group, clinicalRegion=region, surfaces=surfaces, **({"thickness":thickness} if thickness else {})))

manifest = dict(source={**PIN, 'license': 'CC-BY-SA-4.0', 'assetVersion': 2}, structures=metadata, bundles={})
supported = {p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
for area in AREAS:
    selected = [o for o, m in zip(objects, metadata) if area == 'full' or area in m['areas']]
    for o in objects: o.select_set(False)
    for o in selected: o.select_set(True)
    output = OUTPUT / (area + '.glb')
    options = dict(filepath=str(output), export_format='GLB', use_selection=True, export_yup=True,
                   export_animations=False, export_cameras=False, export_lights=False, export_skins=False,
                   export_morph=False, export_extras=False, export_texcoords=False, export_attributes=True,
                   export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
                   export_draco_position_quantization=14, export_draco_normal_quantization=10, export_draco_generic_quantization=16)
    if 'export_draco_mesh_compression_enable' not in supported: raise RuntimeError('Draco export is required')
    bpy.ops.export_scene.gltf(**{key: value for key, value in options.items() if key in supported})
    manifest['bundles'][area] = dict(url='/anatomy/3d/' + output.name + '?v=' + hashlib.sha256(output.read_bytes()).hexdigest()[:12], bytes=output.stat().st_size, structures=len(selected))
    print('EXPORTED', area, len(selected), output.stat().st_size, flush=True)
(OUTPUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, separators=(',', ':')))
print('DONE', len(metadata), flush=True)
