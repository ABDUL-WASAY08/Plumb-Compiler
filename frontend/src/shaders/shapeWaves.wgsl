// Animated background: soft, slowly drifting grey wave bands on white.
// vgpu runs this over a fixed fullscreen triangle and supplies uv with
// (0, 0) at the TOP-LEFT corner.

struct Params {
  time: f32,
  aspect: f32,
  intensity: f32,
  scale: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

// Layered sine waves build a smooth, slowly moving height field.
fn field(p: vec2f) -> f32 {
  var h = sin(p.x * 3.1 + params.time * 0.55);
  h = h + sin(p.y * 2.3 - params.time * 0.40) * 0.8;
  h = h + sin((p.x + p.y) * 1.6 + params.time * 0.30) * 0.6;
  h = h + sin(length(p) * 2.0 - params.time * 0.50) * 0.5;
  return h;
}

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = vec2f(uv.x * params.aspect, uv.y) * params.scale;

  // Normalise the field to roughly 0..1 and shape it into bands.
  let w = field(p) * 0.22 + 0.5;

  // Neutral greys (zinc ramp).
  let white = vec3f(1.000, 1.000, 1.000);
  let sky   = vec3f(0.937, 0.937, 0.949); // zinc-100
  let mid   = vec3f(0.831, 0.831, 0.847); // zinc-300
  let deep  = vec3f(0.631, 0.631, 0.663); // zinc-400

  let bands = smoothstep(0.30, 0.95, w);

  var color = mix(white, sky, bands * params.intensity);
  color = mix(color, mid, pow(bands, 2.0) * params.intensity * 0.70);
  color = mix(color, deep, pow(bands, 5.0) * params.intensity * 0.35);

  return vec4f(color, 1.0);
}
