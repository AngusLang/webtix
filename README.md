Webtix
-----
> Path-tracing render engine base on WebGL2.

This project was created to saving your life while you were suffered from wrote ray tracing applications on other RayTracing frameworks, such as Optix Metal-MPS or Mitsuba, Which might cost amount of your time to set up a project, config compile tools and so on.

We want that you could implement your customized ray-tracing algorithm by just write several lines of glsl shader code.

Assuming that ray-tracing developers would like to share their render result with others mostly. So we implement project with webgl & typescript. which was easily to share and present.

## Core Feature
- [x] BVH builder
- [ ] Builtin memory allocator
- [x] Buffer texture sampler
- [ ] BSDF kernel
- [x] Free camera control

## Documentations
[builtin](./doc/builtin.md)   
[buffer texture](./doc/buffer-texture.md)   
[kernel node](./doc/kernel-node.md)   