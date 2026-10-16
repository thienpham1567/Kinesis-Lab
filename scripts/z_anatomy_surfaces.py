"""Source tissue classification and geometric thickness sampling. Requires Blender Python."""
import bmesh
import statistics
from mathutils import Vector
from mathutils.bvhtree import BVHTree

METHOD = 'inward-normal-cone-median-v1'
THICKNESS_NAMES = {'Acetabular labrum.l','Acetabular labrum.r','Femur.l','Femur.r',
                   'Gluteus maximus muscle.l','Gluteus maximus muscle.r',
                   'Gluteus medius muscle.l','Gluteus medius muscle.r','Hip bone.l','Hip bone.r'}

def classify_surface(name, layer):
    name = name.lower().strip()
    if name.startswith('bone'): return 'bone'
    if 'cartilage' in name: return 'cartilage'
    if 'tendon' in name: return 'tendon'
    if 'ligament' in name or 'articular capsule' in name: return 'ligament'
    if name == 'fat': return 'fat'
    return layer

def ray_thickness(bvh, point, outward, diagonal):
    if outward.length < 1e-10: return None
    inward = -outward.normalized()
    tangent = inward.cross(Vector((0,0,1)))
    if tangent.length < .1: tangent = inward.cross(Vector((0,1,0)))
    tangent.normalize(); bitangent = inward.cross(tangent).normalized()
    epsilon = max(diagonal*1e-5, 1e-7)
    origin = point + inward*epsilon
    directions = [inward] + [(inward + axis*.15).normalized() for axis in [tangent,-tangent,bitangent,-bitangent]]
    values = []
    for direction in directions:
        location, normal, index, distance = bvh.ray_cast(origin,direction,diagonal*2)
        # Accept an exit surface, excluding nearby self hits and rays starting outside.
        if location is not None and distance > epsilon*2 and normal.dot(direction) > 1e-5:
            values.append(distance*direction.dot(inward)+epsilon)
    return statistics.median(values) if len(values)>=3 else None

def bake_thickness(source):
    bm = bmesh.new()
    try:
        bm.from_mesh(source.data)
        bm.transform(source.matrix_world)
        if any(not edge.is_manifold for edge in bm.edges): return {'reason':'non_manifold'}
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        bm.normal_update()
        if bm.calc_volume(signed=True) < 0:
            bmesh.ops.reverse_faces(bm,faces=list(bm.faces)); bm.normal_update()
        bm.verts.ensure_lookup_table()
        low=Vector(tuple(min(v.co[i] for v in bm.verts) for i in range(3)))
        high=Vector(tuple(max(v.co[i] for v in bm.verts) for i in range(3)))
        diagonal=(high-low).length
        if diagonal < 1e-8: return {'reason':'degenerate'}
        bvh=BVHTree.FromBMesh(bm)
        sampled=[ray_thickness(bvh,v.co,v.normal,diagonal) for v in bm.verts]
        valid=sorted(v for v in sampled if v is not None)
        coverage=len(valid)/len(sampled)
        if coverage < .95: return {'reason':'low_coverage','coverage':coverage}
        return {'values':[v if v is not None else 0 for v in sampled],
                'validity':[1.0 if v is not None else 0.0 for v in sampled],
                'stats':{'method':METHOD,'units':'m','vertices':len(sampled),'validVertices':len(valid),
                         'min':valid[0],'p50':statistics.median(valid),'p95':valid[int((len(valid)-1)*.95)],'max':valid[-1]}}
    finally:
        bm.free()
