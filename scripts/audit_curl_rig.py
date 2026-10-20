"""Audit pinned Z-Biomechanics with embedded scripts disabled.
Run from repository root: Blender --background --factory-startup --disable-autoexec .data/z-anatomy/Biomechanics.blend --python-exit-code 1 --python scripts/audit_curl_rig.py
Writes rest-coordinate source inventory to ignored .data/z-anatomy/curl-objects.json; never edits the .blend.
"""
import bpy,json,re
from pathlib import Path
pattern=re.compile(r'biceps|brachialis|brachioradialis|arm|elbow|forearm|humerus|radius|ulna',re.I)
related=[{'name':o.name,'type':o.type,'parent':o.parent.name if o.parent else None,'bone':o.parent_bone,'groups':[g.name for g in o.vertex_groups] if o.type=='MESH' else [],'mods':[m.type for m in o.modifiers] if hasattr(o,'modifiers') else []} for o in bpy.data.objects if pattern.search(o.name)]
a=bpy.data.objects.get('Armature')
bones=[{'name':b.name,'parent':b.parent.name if b.parent else None,'head':list(b.head_local),'tail':list(b.tail_local),'matrix':[list(r) for r in b.matrix_local],'deform':b.use_deform,'rotation':list(a.pose.bones[b.name].rotation_euler),'constraints':[{'name':c.name,'type':c.type,'mute':c.mute,'influence':c.influence,'target':getattr(getattr(c,'target',None),'name',None),'subtarget':getattr(c,'subtarget',None)} for c in a.pose.bones[b.name].constraints]} for b in a.data.bones if re.search(r'LeftArm|LeftFore|LeftHand|Forearm|Elbow|Wrist|Ulna.l|Radius.l',b.name,re.I)]
Path('.data/z-anatomy/curl-objects.json').write_text(json.dumps({'related':related,'bones':bones},indent=2));print('CURL_RIG_AUDIT',json.dumps({'armature':a.name,'armatureBones':len(a.data.bones),'relatedObjects':len(related),'armBones':len(bones)}),flush=True)
