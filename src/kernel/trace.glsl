#ifndef traverse
#define traverse

#define IS_LEAF(n) (n.c.x <= EPSILON)
#define NOT_LEAF(n) (n.c.x > EPSILON)
#define BVH_BOX_MIN(n) (n.a)
#define BVH_BOX_MAX(n) (n.b)
#define BVH_CHILD_COUNT(n) (n.c.x)
#define BVH_PRIMITIVE_INDEX(n) (n.c.y)
#define BVH_STRIDE(n) (n.c.z)

struct trace_result {
  vec3 position;
  vec3 normal;
};

bool trace(const ray r, out trace_result result) {
  float i, t;
  bvh_block block;
  primitive_block p_block, near_primitive;
  primitive_intersection intersection, near_intersection;

  near_intersection.t = MAX_RAY_DISTANCE;

  for(i = 0.0; i < bvh_layout.count; i += bvh_layout.stride) {

    block = fetch_bvh(i);
    t = box_intersect(BVH_BOX_MIN(block), BVH_BOX_MAX(block), r);
    if (t >= 0.0 && t < near_intersection.t) {

      if(IS_LEAF(block)) {
        p_block = fetch_primitive(BVH_PRIMITIVE_INDEX(block));
        intersection = primitive_intersect(p_block, r);
        if (intersection.t > 0.0 && intersection.t < near_intersection.t) {
          near_intersection = intersection;
          near_primitive = p_block;
        }
      }

    } else {

      // skip node children
      if(NOT_LEAF(block)) {
        i += BVH_CHILD_COUNT(block) * bvh_layout.stride;
      }

    }
  }

  if (near_intersection.t < MAX_RAY_DISTANCE) {
    result.position = r.origin + r.direction * near_intersection.t;
    result.normal = primitive_centriod_normal(near_primitive, near_intersection.u, near_intersection.v);
    return true;
  }

  return false;
}

// traver
bool trace_shadow(const ray r) {
  float t, i;
  bvh_block block;
  primitive_block p_block;
  primitive_intersection intersection;

  for (i = 0.0; i < bvh_layout.count; i += bvh_layout.stride) {

    block = fetch_bvh(i);
    t = box_intersect(BVH_BOX_MIN(block), BVH_BOX_MAX(block), r);
    if (t >= 0.0) {
      if(IS_LEAF(block)) {
        p_block = fetch_primitive(BVH_PRIMITIVE_INDEX(block));
        intersection = primitive_intersect(p_block, r);
        if (intersection.t > 0.0)
          return true;
      }
    } else {
      if(NOT_LEAF(block)) {
        i += BVH_CHILD_COUNT(block) * bvh_layout.stride;
      }
    }
  }

  return false;
}

#endif