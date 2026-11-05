"""Source collection selection, independent of Blender for regression checks."""

def is_head_source(name, collections):
    return 'Head' in collections or 'ethmoid bone' in name.lower()


def source_layer(name, collections):
    if name.endswith(('.i', '.j', '.ol', '.or', '.el', '.er', '.g')):
        return None
    # Upstream separately credits a noncommercial inner-ear model. Ossicles are
    # in its Bonus collection; their per-object origin is not established here.
    # Retain that bounded exclusion rather than assuming the global license wins.
    if 'Auditory ossicles' in collections:
        return None
    if '1: Skeletal system' in collections:
        return 'bone'
    if 'Muscles' in collections and '4: Muscular system' in collections:
        return 'muscle'
    if '3: Joints' in collections:
        return 'joint'
    return None
