"""Run with Blender --background --factory-startup --python scripts/check_thickness_bake.py."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
import bpy,bmesh
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from z_anatomy_surfaces import classify_surface, ray_thickness, bake_thickness
assert classify_surface('Tendon','muscle')=='tendon'
assert classify_surface('Cartilage','bone')=='cartilage'
assert classify_surface('Extension','muscle')=='muscle'
assert classify_surface('Bone-7','bone')=='bone'
assert classify_surface('Articular capsule','joint')=='ligament'
bm=bmesh.new();bmesh.ops.create_cube(bm,size=2);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.normal_update()
bvh=BVHTree.FromBMesh(bm)
distance=ray_thickness(bvh,Vector((1,0,0)),Vector((1,0,0)),4)
assert distance is not None and abs(distance-2)<.0001, distance
mesh=bpy.data.meshes.new('cube fixture');bm.to_mesh(mesh)
obj=bpy.data.objects.new('cube fixture',mesh)
result=bake_thickness(obj)
assert result['stats']['validVertices']==8,result
assert all(v>0 for v in result['values'])
bm.faces.ensure_lookup_table();bmesh.ops.delete(bm,geom=[bm.faces[0]],context='FACES');bm.to_mesh(mesh)
assert bake_thickness(obj)['reason']=='non_manifold'
bm.free()
print('Thickness bake checks passed: tissue classes, known 2m slab, closed cube and rejection of open geometry.')
