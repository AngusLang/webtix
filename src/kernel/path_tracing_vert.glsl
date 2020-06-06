#version 300 es
precision highp float;

layout(location = 0) in vec3 position;

out vec2 uv;

void main()
{
  uv = position.xy;
  gl_Position = vec4(position, 1.0);
}