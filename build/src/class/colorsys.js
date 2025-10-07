// @bun
var __require = import.meta.require;

// src/class/colorsys.ts
class CMYK {
  c;
  m;
  y;
  k;
  constructor(c, m, y, k) {
    this.c = Math.round(c), this.m = Math.round(m), this.y = Math.round(y), this.k = Math.round(k);
  }
}

class HSL {
  h;
  s;
  l;
  constructor(h, s, l) {
    this.h = Math.round(h), this.s = Math.round(s), this.l = Math.round(l);
  }
}

class HSV {
  h;
  s;
  v;
  constructor(h, s, v) {
    this.h = Math.round(h), this.s = Math.round(s), this.v = Math.round(v);
  }
}

class RGB {
  r;
  g;
  b;
  constructor(r, g, b) {
    this.r = Math.round(r), this.g = Math.round(g), this.b = Math.round(b);
  }
}
var RGB2HSL = (r, g, b) => {
  if (typeof r === "object") {
    let { r: _r, g: _g, b: _b } = r;
    r = _r % 256 / 255 /* RGB */, g = _g % 256 / 255 /* RGB */, b = _b % 256 / 255 /* RGB */;
  } else
    r = r % 256 / 255 /* RGB */, g = g % 256 / 255 /* RGB */, b = b % 256 / 255 /* RGB */;
  let min = Math.min(r, g, b), max = Math.max(r, g, b);
  if (min === max)
    return new HSL(0, 0, (max + min) / 2 * 100 /* SVL */);
  let d = max - min, l = (min + max) / 2;
  switch (max) {
    case r:
      return new HSL(((g - b) / d + (g < b ? 6 : 0)) / 6 * 360 /* HUE */, (l > 0.5 ? d / (2 - d) : d / (max + min)) * 100 /* SVL */, l * 100 /* SVL */);
    case g:
      return new HSL(((b - r) / d + 2) / 6 * 360 /* HUE */, (l > 0.5 ? d / (2 - d) : d / (max + min)) * 100 /* SVL */, l * 100 /* SVL */);
    case b:
      return new HSL(((r - g) / d + 4) / 6 * 360 /* HUE */, (l > 0.5 ? d / (2 - d) : d / (max + min)) * 100 /* SVL */, l * 100 /* SVL */);
  }
  return new HSL(0, (l > 0.5 ? d / (2 - d) : d / (max + min)) * 100 /* SVL */, l * 100 /* SVL */);
}, RGB2HSV = (r, g, b) => {
  if (typeof r === "object") {
    let args = r;
    r = args.r, g = args.g, b = args.b;
  }
  r = r % 256 / 255 /* RGB */, g = g % 256 / 255 /* RGB */, b = b % 256 / 255 /* RGB */;
  let min = Math.min(r, g, b), max = Math.max(r, g, b), d = max - min;
  if (min === max)
    return new HSV(0, (max === 0 ? 0 : d / max) * 100 /* SVL */, max * 100 /* SVL */);
  switch (max) {
    case r:
      return new HSV(((g - b) / d + (g < b ? 6 : 0)) / 6, (max === 0 ? 0 : d / max) * 100 /* SVL */, max * 100 /* SVL */);
    case g:
      return new HSV(((b - r) / d + 2) / 6, (max === 0 ? 0 : d / max) * 100 /* SVL */, max * 100 /* SVL */);
    case b:
      return new HSV(((r - g) / d + 4) / 6, (max === 0 ? 0 : d / max) * 100 /* SVL */, max * 100 /* SVL */);
  }
  return new HSV(0, (max === 0 ? 0 : d / max) * 100 /* SVL */, max * 100 /* SVL */);
}, HSL2RGB = (h, s, l) => {
  if (typeof h === "object")
    l = h.l, s = h.s, h = h.h;
  if (h = _normalizeAngle(h), h = h === 360 /* HUE */ ? 1 : h % 360 /* HUE */ / 360 /* HUE */, s = s === 100 /* SVL */ ? 1 : s % 100 /* SVL */ / 100 /* SVL */, l = l === 100 /* SVL */ ? 1 : l % 100 /* SVL */ / 100 /* SVL */, s === 0)
    return new RGB(l * 255 /* RGB */, l * 255 /* RGB */, l * 255 /* RGB */);
  let q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return new RGB(_hue2Rgb(p, q, h + 0.3333333333333333) * 255 /* RGB */, _hue2Rgb(p, q, h) * 255 /* RGB */, _hue2Rgb(p, q, h - 0.3333333333333333) * 255 /* RGB */);
}, HSV2RGB = (h, s, v) => {
  if (typeof h === "object") {
    let _h = _normalizeAngle(h.h), _s = h.s, _v = h.v;
    h = _h === 360 /* HUE */ ? 1 : _h % 360 /* HUE */ / 360 /* HUE */ * 6, s = _s === 100 /* SVL */ ? 1 : _s % 100 /* SVL */ / 100 /* SVL */, v = _v === 100 /* SVL */ ? 1 : _v % 100 /* SVL */ / 100 /* SVL */;
  } else
    h = _normalizeAngle(h), h = h === 360 /* HUE */ ? 1 : h % 360 /* HUE */ / 360 /* HUE */ * 6, s = s === 100 /* SVL */ ? 1 : s % 100 /* SVL */ / 100 /* SVL */, v = v === 100 /* SVL */ ? 1 : v % 100 /* SVL */ / 100 /* SVL */;
  let f = h % 1, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = Math.floor(h) % 6;
  return new RGB([v, q, p, p, t, v][mod] * 255 /* RGB */, [t, v, v, q, p, p][mod] * 255 /* RGB */, [p, p, t, v, v, q][mod] * 255 /* RGB */);
}, RGB2HEX = (r, g, b) => {
  if (typeof r === "object")
    return `#${Math.round(r.r).toString(16).padStart(2, "0")}${Math.round(r.g).toString(16).padStart(2, "0")}${Math.round(r.b).toString(16).padStart(2, "0")}`;
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}, HEX2RGB = (hex) => {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result !== null ? new RGB(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
}, HSV2HEX = (h, s, v) => {
  let rgb = HSV2RGB(h, s, v);
  return rgb !== null ? RGB2HEX(rgb.r, rgb.g, rgb.b) : "#000000";
}, hex2HSV = function(hex) {
  let rgb = HEX2RGB(hex);
  return rgb !== null ? RGB2HSV(rgb.r, rgb.g, rgb.b) : new HSV(0, 0, 0);
}, HSL2HEX = (h, s, l) => {
  let rgb = HSL2RGB(h, s, l);
  return rgb !== null ? RGB2HEX(rgb.r, rgb.g, rgb.b) : "#000000";
}, hex2HSL = function(hex) {
  let rgb = HEX2RGB(hex);
  return rgb !== null ? RGB2HSL(rgb.r, rgb.g, rgb.b) : new HSL(0, 0, 0);
}, RGB2CMYK = (r, g, b) => {
  let rPrime, gPrime, bPrime;
  if (typeof r === "object")
    rPrime = r.r / 255, gPrime = r.g / 255, bPrime = r.b / 255;
  else
    rPrime = r / 255, gPrime = g / 255, bPrime = b / 255;
  let k = 1 - Math.max(rPrime, gPrime, bPrime), l = 1 - k;
  return new CMYK(((l - rPrime) / l).toFixed(3), ((l - gPrime) / l).toFixed(3), ((l - bPrime) / l).toFixed(3), k.toFixed(3));
}, CMYK2RGB = (c, m, y, k) => {
  if (typeof c === "object") {
    let l2 = 255 * (1 - c.k);
    return new RGB((1 - c.c) * l2, (1 - c.m) * l2, (1 - c.y) * l2);
  }
  let l = 255 * (1 - k);
  return new RGB((1 - c) * l, (1 - m) * l, (1 - y) * l);
}, HSV2HSL = (h, s, v) => {
  if (typeof h === "object")
    v = h.v, s = h.s, h = h.h;
  let l = (2 - s) * v / 2;
  if (l === 0)
    return new HSL(h, s, l);
  if (l === 100 /* SVL */)
    return new HSL(h, 0, l);
  if (l < 50)
    return new HSL(h, s * v / (l * 2), l);
  return new HSL(h, s * v / (2 - l * 2), l);
}, HSL2HSV = (h, s, l) => {
  if (typeof h === "object")
    l = h.l, s = h.s, h = h.h;
  s *= l < 50 ? l : 100 - l;
  let k = l + s;
  return new HSV(h, 2 * s / k, k);
}, HEX2DEC = (hexColor) => {
  return typeof hexColor === "string" ? parseInt(hexColor.replace("#", ""), 16) : 0;
}, DEC2HEX = (decimalColor) => {
  return (typeof decimalColor === "string" ? +decimalColor : decimalColor).toString(16);
}, _normalizeAngle = (degrees) => {
  return (degrees % 360 + 360) % 360;
}, _hue2Rgb = (p, q, t) => {
  if (t = (t % 1 + 1) % 1, t < 0.16666666666666666)
    return p + (q - p) * 6 * t;
  if (t < 0.5)
    return q;
  if (t < 0.6666666666666666)
    return p + (q - p) * (0.6666666666666666 - t) * 6;
  return p;
};
export {
  hex2HSV,
  hex2HSL,
  RGB2HSV,
  RGB2HSL,
  RGB2HEX,
  RGB2CMYK,
  HSV2RGB,
  HSV2HSL,
  HSV2HEX,
  HSL2RGB,
  HSL2HSV,
  HSL2HEX,
  HEX2RGB,
  HEX2DEC,
  DEC2HEX,
  CMYK2RGB
};
