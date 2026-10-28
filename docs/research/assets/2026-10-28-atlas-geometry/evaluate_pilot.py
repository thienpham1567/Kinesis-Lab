import bpy, json, re, hashlib
from pathlib import Path
names={'Anterior talofibular ligament','Calcaneofibular ligament','Articular disc of acromioclavicular joint','Articular disc of sternoclavicular joint','Articular disc of distal radio-ulnar joint'}
depsgraph=bpy.context.evaluated_depsgraph_get()
rows=[]
for obj in bpy.data.objects:
    if obj.type!='MESH' or re.sub(r'\.(l|r)$','',obj.name).strip('() ') not in names: continue
    evaluated=obj.evaluated_get(depsgraph)
    mesh=evaluated.to_mesh()
    mesh.calc_loop_triangles()
    points=[obj.matrix_world @ v.co for v in mesh.vertices]
    edge_faces={}
    for face in mesh.polygons:
        for a,b in face.edge_keys:
            key=tuple(sorted((a,b)))
            edge_faces[key]=edge_faces.get(key,0)+1
    rows.append({'id':'za-'+hashlib.sha256(obj.name.encode()).hexdigest()[:12], 'sourceName':obj.name,'evaluation':'viewport modifier settings, original stack unchanged','baseTriangles':sum(max(len(p.vertices)-2,0) for p in obj.data.polygons),'evaluatedTriangles':len(mesh.loop_triangles),'evaluatedVertices':len(mesh.vertices),'boundaryEdges':sum(n==1 for n in edge_faces.values()),'nonmanifoldEdges':sum(n>2 for n in edge_faces.values()),'blenderWorldBounds':[[min(v[i] for v in points) for i in range(3)],[max(v[i] for v in points) for i in range(3)]],'limitations':['Original authored modifiers; not measured thickness or verified anatomical volume','Blender coordinates; not yet registered or exported into app coordinates','Closed topology does not establish anatomical correctness']})
    evaluated.to_mesh_clear()
Path('.data/z-anatomy/pilot-evaluated-inspection.json').write_text(json.dumps({'checkedAt':'2026-10-28','blenderVersion':bpy.app.version_string,'autoexecDisabled':not bpy.context.preferences.filepaths.use_scripts_auto_execute,'records':rows},indent=2)+'\n')
print('PILOT_EVALUATION_COMPLETE',len(rows))
