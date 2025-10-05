const enum MAX {
    RGB = 255,
    HUE = 360,
    SVL = 100
}

class CMYK
{
    c: number;
    m: number;
    y: number;
    k: number;

    constructor(c: number, m: number, y: number, k: number)
    {
        this.c = Math.round(c);
        this.m = Math.round(m);
        this.y = Math.round(y);
        this.k = Math.round(k);
    }
}

class HSL
{
    h: number;
    s: number;
    l: number;

    constructor(h: number, s: number, l: number)
    {
        this.h = Math.round(h);
        this.s = Math.round(s);
        this.l = Math.round(l);
    }
}

class HSV
{
    h: number;
    s: number;
    v: number;

    constructor(h: number, s: number, v: number)
    {
        this.h = Math.round(h);
        this.s = Math.round(s);
        this.v = Math.round(v);
    }
}

class RGB
{
    r: number;
    g: number;
    b: number;
    
    constructor(r: number, g: number, b: number)
    {
        this.r = Math.round(r);
        this.g = Math.round(g);
        this.b = Math.round(b);
    }
}

export const RGB2HSL = (r: any, g: number, b: number) => {
    if (typeof r === 'object')
    {
        const _r = r.r;
        const _g = r.g;
        const _b = r.b;

        r = ((_r % (MAX.RGB + 1)) / MAX.RGB);
        g = ((_g % (MAX.RGB + 1)) / MAX.RGB);
        b = ((_b % (MAX.RGB + 1)) / MAX.RGB);
    }
    else
    {
        r = ((r % (MAX.RGB + 1)) / MAX.RGB);
        g = ((g % (MAX.RGB + 1)) / MAX.RGB);
        b = ((b % (MAX.RGB + 1)) / MAX.RGB);
    }

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    if (min === max)
    {
        return new HSL(0, 0, ((max + min) / 2) * MAX.SVL);
    }

    const d = max - min;
    const l = (min + max) / 2;

    switch (max)
    {
    
    case r:
        return new HSL(((((g - b) / d) + (g < b ? 6 : 0)) / 6) * MAX.HUE, ((l > 0.5) ? (d / (2 - d)) : d / (max + min)) * MAX.SVL, l * MAX.SVL);
    
    case g:
        return new HSL(((((b - r) / d) + 2) / 6) * MAX.HUE, ((l > 0.5) ? (d / (2 - d)) : d / (max + min)) * MAX.SVL, l * MAX.SVL);
    
    case b:
        return new HSL(((((r - g) / d) + 4) / 6) * MAX.HUE, ((l > 0.5) ? (d / (2 - d)) : d / (max + min)) * MAX.SVL, l * MAX.SVL);
    
    }

    return new HSL(0, ((l > 0.5) ? (d / (2 - d)) : d / (max + min)) * MAX.SVL, l * MAX.SVL);
}

export const RGB2HSV = (r: any, g: number, b: number) => {
    if (typeof r === 'object') {
        const args = r
        r = args.r; g = args.g; b = args.b;
    }

    r = ((r % (MAX.RGB + 1)) / MAX.RGB);
    g = ((g % (MAX.RGB + 1)) / MAX.RGB);
    b = ((b % (MAX.RGB + 1)) / MAX.RGB);

    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);

    const d = max - min;

    if (min === max)
    {
        return new HSV(0, (max === 0 ? 0 : d / max) * MAX.SVL, max * MAX.SVL);
    }

    switch (max)
    {
    
    case r:
        return new HSV((((g - b) / d) + (g < b ? 6 : 0)) / 6, (max === 0 ? 0 : d / max) * MAX.SVL, max * MAX.SVL);

    case g:
        return new HSV((((b - r) / d) + 2) / 6, (max === 0 ? 0 : d / max) * MAX.SVL, max * MAX.SVL);

    case b:
        return new HSV((((r - g) / d) + 4) / 6, (max === 0 ? 0 : d / max) * MAX.SVL, max * MAX.SVL);
    
    }

    return new HSV(0, (max === 0 ? 0 : d / max) * MAX.SVL, max * MAX.SVL);
}

export const HSL2RGB = (h: any, s: number, l: number) => {
    if (typeof h === 'object')
    {
        l = h.l;
        s = h.s;
        h = h.h;
    }

    h = _normalizeAngle(h);
    h = ((h === MAX.HUE) ? 1 : (h % MAX.HUE / MAX.HUE));
    s = ((s === MAX.SVL) ? 1 : (s % MAX.SVL / MAX.SVL));
    l = ((l === MAX.SVL) ? 1 : (l % MAX.SVL / MAX.SVL));

    if (s === 0)
    {
        return new RGB(l * MAX.RGB, l * MAX.RGB, l * MAX.RGB);
    }

    const q = (l < 0.5 ? l * (1 + s) : l + s - (l * s));
    const p = 2 * l - q;

    return new RGB(_hue2Rgb(p, q, h + 1 / 3) * MAX.RGB, _hue2Rgb(p, q, h) * MAX.RGB, _hue2Rgb(p, q, h - 1 / 3) * MAX.RGB);
}

export const HSV2RGB = (h: any, s: number, v: number) => {
    if (typeof h === 'object')
    {
        const _h = _normalizeAngle(h.h);
        const _s = h.s;
        const _v = h.v;

        h = ((_h === MAX.HUE) ? 1 : (((_h % MAX.HUE) / MAX.HUE) * 6));
        s = ((_s === MAX.SVL) ? 1 : ((_s % MAX.SVL) / MAX.SVL));
        v = ((_v === MAX.SVL) ? 1 : ((_v % MAX.SVL) / MAX.SVL));
    }
    else
    {
        h = _normalizeAngle(h);

        h = ((h === MAX.HUE) ? 1 : (((h % MAX.HUE) / MAX.HUE) * 6));
        s = ((s === MAX.SVL) ? 1 : ((s % MAX.SVL) / MAX.SVL));
        v = ((v === MAX.SVL) ? 1 : ((v % MAX.SVL) / MAX.SVL));
    }

    const f = h % 1;

    const p = v * (1 - s);
    const q = v * (1 - (f * s));
    const t = v * (1 - ((1 - f) * s));

    const mod = Math.floor(h) % 6;

    // @ts-ignore
    return new RGB([v, q, p, p, t, v][mod] * MAX.RGB, [t, v, v, q, p, p][mod] * MAX.RGB, [p, p, t, v, v, q][mod] * MAX.RGB);
}

export const RGB2HEX = (r: any, g: number, b: number) => {
    if (typeof r === 'object')
    {
        return `#${Math.round(r.r).toString(16).padStart(2, '0')}${Math.round(r.g).toString(16).padStart(2, '0')}${Math.round(r.b).toString(16).padStart(2, '0')}`;
    }

    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

export const HEX2RGB = (hex: string) => {
    const result: null | string[] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    // @ts-ignore
    return ((result !== null) ? new RGB(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null);
}

export const HSV2HEX = (h: any, s: number, v: number) => {
    const rgb = HSV2RGB(h, s, v);

    return ((rgb !== null) ? RGB2HEX(rgb.r, rgb.g, rgb.b) : '#000000');
}

export const hex2HSV = function (hex: string) {
    const rgb = HEX2RGB(hex);

    return ((rgb !== null) ? RGB2HSV(rgb.r, rgb.g, rgb.b) : new HSV(0, 0, 0));
}

export const HSL2HEX = (h: any, s: number, l: number) => {
    const rgb = HSL2RGB(h, s, l);

    return ((rgb !== null) ? RGB2HEX(rgb.r, rgb.g, rgb.b) : '#000000');
}

export const hex2HSL = function (hex: string) {
    const rgb = HEX2RGB(hex);

    return ((rgb !== null) ? RGB2HSL(rgb.r, rgb.g, rgb.b) : new HSL(0, 0, 0));
}

export const RGB2CMYK = (r: any, g: number, b: number) => {
    let rPrime, gPrime, bPrime;
    
    if (typeof r === 'object')
    {
        rPrime = r.r / 255;
        gPrime = r.g / 255;
        bPrime = r.b / 255;
    }
    else
    {
        rPrime = r / 255;
        gPrime = g / 255;
        bPrime = b / 255;
    }

    const k = 1 - Math.max(rPrime, gPrime, bPrime);
    const l = 1 - k;

    // @ts-ignore
    return new CMYK(((l - rPrime) / l).toFixed(3), ((l - gPrime) / l).toFixed(3), ((l - bPrime) / l).toFixed(3), k.toFixed(3));
}

export const CMYK2RGB = (c: any, m: number, y: number, k: number) => {
    if (typeof c === 'object')
    {
        const l = 255 * (1 - c.k);

        return new RGB((1 - c.c) * l, (1 - c.m) * l, (1 - c.y) * l);
    }

    const l = 255 * (1 - k);

    return new RGB((1 - c) * l, (1 - m) * l, (1 - y) * l);
}

export const HSV2HSL = (h: any, s: number, v: number) => {
    if (typeof h === 'object')
    {
        v = h.v;
        s = h.s;
        h = h.h;
    }

    const l = (2 - s) * v / 2;

    if (l === 0)
    {
        return new HSL(h, s, l);
    }

    if (l === MAX.SVL)
    {
        return new HSL(h, 0, l);
    }
    
    if (l < MAX.SVL / 2)
    {
        return new HSL(h, s * v / (l * 2), l);
    }
    
    return new HSL(h, s * v / (2 - (l * 2)), l);
}

export const HSL2HSV = (h: any, s: number, l: number) => {
    if (typeof h === 'object')
    {
        l = h.l;
        s = h.s;
        h = h.h;
    }

    s *= (l < 50 ? l : (100 - l));

    const k = l + s;

    return new HSV(h, (2 * s) / k, k);
}

export const HEX2DEC = (hexColor: string) => {
    return ((typeof hexColor === 'string') ? parseInt(hexColor.replace('#', ''), 16) : 0);
}

export const DEC2HEX = (decimalColor: string | number) => {
    return ((typeof decimalColor === 'string') ? +decimalColor : decimalColor).toString(16);
}

const _normalizeAngle = (degrees: number) => {
    return ((degrees % 360) + 360) % 360;
}

const _hue2Rgb = (p: number, q: number, t: number) => {
    t = ((t % 1) + 1) % 1;
    
    if (t < 1 / 6)
    {
        return p + ((q - p) * 6 * t);
    }
    
    if (t < 1 / 2)
    {
        return q;
    }
    
    if (t < 2 / 3)
    {
        return p + ((q - p) * (2 / 3 - t) * 6);
    }

    return p;
}