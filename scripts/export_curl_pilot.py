"""Blender 4.5: --background --factory-startup --disable-autoexec Startup.blend --python scripts/export_curl_pilot.py.
Reads original source geometry; authors an explicitly experimental two-bone skin and motion.
Original .blend/static Atlas assets are never overwritten. No source embedded scripts executed.
"""
import bpy, json, hashlib, math, re, sys
from pathlib import Path
from mathutils import Vector, Quaternion, Matrix
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from z_anatomy_surfaces import classify_surface
OUT=ROOT/'public/anatomy/3d/motion';OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads((ROOT/'public/anatomy/3d/manifest.json').read_text())
meta={s['id']:s for s in manifest['structures']}
pin=json.loads((ROOT/'.data/z-anatomy/source.json').read_text())
rig_audit=json.loads((ROOT/'.data/z-anatomy/curl-objects.json').read_text())
refs={b['name']:b for b in rig_audit['bones']}
scene=bpy.data.scenes.new('Kinesis experimental cable curl');bpy.context.window.scene=scene
scene.render.fps=30;scene.frame_start=0;scene.frame_end=180
arm_data=bpy.data.armatures.new('Experimental upper-limb skin');arm=bpy.data.objects.new('KinesisCurlPilotRig',arm_data);scene.collection.objects.link(arm)
bpy.context.view_layer.objects.active=arm;arm.select_set(True);bpy.ops.object.mode_set(mode='EDIT')
for name,ref in [('upper','LeftArm'),('forearm','LeftForeArm')]:
 b=arm_data.edit_bones.new(name);b.head=refs[ref]['head'];b.tail=refs[ref]['tail']
arm_data.edit_bones['forearm'].parent=arm_data.edit_bones['upper'];bpy.ops.object.mode_set(mode='OBJECT')
colors={'bone':(.73,.64,.49,1),'muscle':(.49,.14,.16,1),'tendon':(.8,.76,.64,1),'cartilage':(.79,.86,.85,1),'ligament':(.65,.71,.64,1),'joint':(.2,.47,.41,1),'fat':(.75,.57,.25,1)}
materials={}
for kind,color in colors.items():
 mat=bpy.data.materials.new('Kinesis_'+kind);mat.diffuse_color=color;mat.use_nodes=True;shader=mat.node_tree.nodes.get('Principled BSDF');shader.inputs['Base Color'].default_value=color;shader.inputs['Roughness'].default_value=.48 if kind=='muscle' else .65;materials[kind]=mat
records=[];objects=[]
for source in list(bpy.data.objects):
 identity='za-'+hashlib.sha256(source.name.encode()).hexdigest()[:12];s=meta.get(identity)
 if not s or s['side']!='left' or 'upper' not in s['areas'] or source.type!='MESH':continue
 en=s['english'].lower();layer=s['layer']
 if layer=='muscle' and not re.search(r'\bbiceps brachii\b|\bbrachialis\b|\bbrachioradialis\b|triceps brachii|deltoid|flexor carpi radialis|extensor carpi radialis longus',en):continue
 if layer not in ['bone','muscle']:continue
 obj=bpy.data.objects.new(identity,source.data.copy());obj.data.transform(source.matrix_world);scene.collection.objects.link(obj)
 face_kinds=[classify_surface(source.material_slots[p.material_index].material.name if p.material_index<len(source.material_slots) and source.material_slots[p.material_index].material else '',layer) for p in source.data.polygons]
 kinds=sorted(set(face_kinds));obj.data.materials.clear()
 for kind in kinds:obj.data.materials.append(materials[kind])
 for poly,kind in zip(obj.data.polygons,face_kinds):poly.material_index=kinds.index(kind)
 # Authored display weights from longitudinal mesh bounds. These are not attachment footprints.
 zmin=min(v.co.z for v in obj.data.vertices);zmax=max(v.co.z for v in obj.data.vertices)
 groups=[obj.vertex_groups.new(name=n) for n in ['upper','forearm']]
 for v in obj.data.vertices:
  if layer=='bone':w=0 if re.search(r'humerus|scapula|clavicle',en) else 1
  elif 'deltoid' in en:w=0
  else:
   t=(zmax-v.co.z)/max(zmax-zmin,.001)
   lo,hi=(.0,.28) if re.search(r'brachioradialis|carpi',en) else (.42,.98) if 'brachialis' in en else (.55,.98)
   t=max(0,min(1,(t-lo)/(hi-lo)));w=t*t*(3-2*t)
  if w<1:groups[0].add([v.index],1-w,'REPLACE')
  if w>0:groups[1].add([v.index],w,'REPLACE')
 modifier=obj.modifiers.new('Experimental two-bone display deformation','ARMATURE');modifier.object=arm;modifier.use_deform_preserve_volume=False;obj.parent=arm
 role='elbow-flexor' if re.search(r'\bbiceps brachii\b|\bbrachialis\b|\bbrachioradialis\b',en) else 'context'
 obj['sourceId']=identity;obj['sourceName']=source.name;obj['teachingRole']=role
 records.append({'id':identity,'label':s['label'],'english':s['english'],'side':'left','layer':layer,'role':role,'sourceName':source.name,'vertices':len(obj.data.vertices)})
 objects.append(obj)
# A closed 6 s display cycle: 10 to 110 authored degrees from the source rest rig.
pb=arm.pose.bones['forearm'];pb.rotation_mode='QUATERNION'
axis=arm_data.bones['forearm'].matrix_local.to_3x3().inverted()@Vector((1,0,0))
for frame in range(0,181,3):
 phase=frame/180;degrees=10+100*(1-math.cos(2*math.pi*phase))/2
 pb.rotation_quaternion=Quaternion(axis,-math.radians(degrees));pb.keyframe_insert(data_path='rotation_quaternion',frame=frame)
arm.animation_data.action.name='Cable curl study — authored unvalidated cycle'
scene.frame_set(0)
for o in scene.objects:o.select_set(False)
for o in [arm]+objects:o.select_set(True)
bpy.context.view_layer.objects.active=arm
options=dict(filepath=str(OUT/'cable-curl-left.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_force_sampling=True,export_frame_range=True,export_skins=True,export_morph=False,export_extras=True,export_yup=True,export_apply=False,export_optimize_animation_size=True)
supported={p.identifier for p in bpy.ops.export_scene.gltf.get_rna_type().properties}
bpy.ops.export_scene.gltf(**{k:v for k,v in options.items() if k in supported})
asset=OUT/'cable-curl-left.glb'
info={'id':'cable-curl-left-pilot','status':'experimental-simulation','reviewedBy':None,'sourceRepository':pin['repository'],'sourceCommit':pin['commit'],'license':'CC-BY-SA-4.0','assetSha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'motion':{'variant':'single-arm-low-cable-curl-study','durationSeconds':6,'authoredAngleRangeDegrees':[10,110],'meaning':'Display convention from source rest pose; not personal ROM, measured kinematics or a prescribed training range.'},'rig':{'landmarkProvenance':'Z-Biomechanics Armature LeftArm and LeftForeArm rest coordinates; source model metadata, not independently verified anatomy.','weighting':'authored longitudinal mesh-bound skin weights; no source muscle skin weights were available','sourceRefs':{k:refs[k] for k in ['LeftArm','LeftForeArm','LeftHand']}},'structures':records,'sources':[{'title':'OpenStax Anatomy and Physiology 2e §11.5 — Muscles That Move the Forearm','url':'https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs','checkedAt':'2026-10-20','access':'Full section text, forearm-flexor paragraphs; supports biceps brachii, brachialis and brachioradialis elbow-flexion function only.'},{'title':'Z-Anatomy source meshes and Z-Biomechanics rig','url':pin['repository']+'/tree/'+pin['commit'],'checkedAt':'2026-10-20','access':'Local pinned Startup.blend and Biomechanics.blend; embedded scripts disabled; source metadata, not clinical validation.'}],'supportedClaims':['Biceps brachii, brachialis and brachioradialis contribute to forearm flexion at the elbow.'],'limitations':['An experimental authored motion study, not motion capture or a validated exercise demonstration.','Skin weights and soft-tissue deformation are authored display approximations; no verified attachment or fascicle mapping.','Highlight identifies teaching structures, not EMG, force, percentage activation or phase-dependent recruitment.','Range and timing are display choices, not individualized exercise instructions.','Single arm only; grip, shoulder/scapular stabilization and cable/hand contact are not biomechanically validated.','Independent clinician/anatomist review of geometry, movement and mapping remains pending.']}
(OUT/'cable-curl-left.json').write_text(json.dumps(info,ensure_ascii=False,indent=2))
print('CURL_EXPORTED',json.dumps({'structures':len(records),'flexors':[s['english'] for s in records if s['role']=='elbow-flexor'],'bytes':asset.stat().st_size}),flush=True)
