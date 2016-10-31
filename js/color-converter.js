var ColorConverter = {};

/**
 * HSV Object
 *
 * @param h
 * @param s
 * @param v
 * @constructor
 */
ColorConverter.HSV = function (h, s, v) {
    if (h <= 0) { h = 0; }
    if (s <= 0) { s = 0; }
    if (v <= 0) { v = 0; }

    if (h > 1) { h = 1; }
    if (s > 1) { s = 1; }
    if (v > 1) { v = 1; }

    this.h = h ;
    this.s = s;
    this.v = v;
};

ColorConverter.HSV.prototype.toString = function to() {
    return 'HSV(' + this.h + ', ' + this.s + ',' + this.v + ')';
};


/**
 * RGB Object
 *
 * @param r
 * @param g
 * @param b
 * @constructor
 */
ColorConverter.RGB = function(r, g, b) {
    if (r <= 0) { r = 0; }
    if (g <= 0) { g = 0; }
    if (b <= 0) { b = 0; }

    if (r > 255) { r = 255; }
    if (g > 255) { g = 255; }
    if (b > 255) { b = 255; }

    this.r = r;
    this.g = g;
    this.b = b;
};

ColorConverter.RGB.prototype.toString = function() {
    return 'rgb(' + this.r + ', ' + this.g + ',' + this.b + ')';
};

/**
 * CMYK Object
 *
 * @param c
 * @param m
 * @param y
 * @param k
 */
ColorConverter.CMYK = function (c, m, y, k) {
    if (c <= 0) { c = 0; }
    if (m <= 0) { m = 0; }
    if (y <= 0) { y = 0; }
    if (k <= 0) { k = 0; }

    if (c > 100) { c = 100; }
    if (m > 100) { m = 100; }
    if (y > 100) { y = 100; }
    if (k > 100) { k = 100; }

    this.c = c;
    this.m = m;
    this.y = y;
    this.k = k;
};
ColorConverter.CMYK.prototype.toString = function() {
    return 'cmyk(' + this.c + ', ' + this.m + ',' + this.y + ',' + this.k + ')';
};
/**
 * RGB to HSV
 *
 * @param RGB
 * @returns {ColorConverter.HSV}
 */
ColorConverter.rgb2hsv = function (RGB) {

    var rr, gg, bb,
        r = RGB.r / 255,
        g = RGB.g / 255,
        b = RGB.b / 255,
        h, s,
        v = Math.max(r, g, b),
        diff = v - Math.min(r, g, b),
        diffc = function(c){
            return (v - c) / 6 / diff + 1 / 2;
        };

    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(r);
        gg = diffc(g);
        bb = diffc(b);

        if (r === v) {
            h = bb - gg;
        } else if (g === v) {
            h = (1 / 3) + rr - bb;
        } else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        } else if (h > 1) {
            h -= 1;
        }
    }

    return new ColorConverter.HSV(h,s,v);
};

/**
 * Convert HSV to RGB
 * @url http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 *
 * @param hsv
 * @returns {ColorConverter.RGB}
 */
ColorConverter.hsv2rgb = function (hsv) {
    var rgb = new ColorConverter.RGB(0,0,0);
    var i = Math.floor(hsv.h * 6);
    var f = hsv.h * 6 - i;
    var p = hsv.v * (1 - hsv.s);
    var q = hsv.v * (1 - f * hsv.s);
    var t = hsv.v * (1 - (1 - f) * hsv.s);
    switch (i % 6) {
        case 0:
            rgb.r = hsv.v, rgb.g = t, rgb.b = p;
            break;
        case 1:
            rgb.r = q, rgb.g = hsv.v, rgb.b = p;
            break;
        case 2:
            rgb.r = p, rgb.g = hsv.v, rgb.b = t;
            break;
        case 3:
            rgb.r = p, rgb.g = q, rgb.b = hsv.v;
            break;
        case 4:
            rgb.r = t, rgb.g = p, rgb.b = hsv.v;
            break;
        case 5:
            rgb.r = hsv.v, rgb.g = p, rgb.b = q;
            break;
    }
    rgb.r = Math.round(255 * rgb.r);
    rgb.g = Math.round(255 * rgb.g);
    rgb.b = Math.round(255 * rgb.b);
    return  rgb;
};


/**
 * RGB to HEX
 * @url https://gist.github.com/Arahnoid/9923989
 *
 * @param RGB
 * @returns {string}
 */
ColorConverter.rgb2hex = function (RGB) {
    return "#" + ((1 << 24) + (RGB.r << 16) + (RGB.g << 8) + RGB.b).toString(16).slice(1);
};


/**
 * HEX to RGB
 * @url https://gist.github.com/Arahnoid/9923989
 *
 * @param hex
 * @returns {ColorConverter.RGB}
 */
ColorConverter.hex2rgb = function (hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return new  ColorConverter.RGB(parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16))
    }
};


/**
 * RGB to CMYK
 * https://gist.github.com/felipesabino/5066336
 *
 * @param RGB
 * @returns {ColorConverter.CMYK}
 */
ColorConverter.rgb2cmyk = function (RGB) {

   var CMYK = new ColorConverter.CMYK(0,0,0,0);

    // BLACK
    if (RGB.r == 0 && RGB.g == 0 && RGB.b == 0 ) {
        CMYK.k = 100;
        return CMYK;
    }

    CMYK.c = 1 - (RGB.r/255);
    CMYK.m = 1 - (RGB.g/255);
    CMYK.y = 1 - (RGB.b/255);

    var minCMY = Math.min(CMYK.c, Math.min(CMYK.m,CMYK.y));

    CMYK.c = ((CMYK.c - minCMY) / (1 - minCMY) * 100) >> 0 ;
    CMYK.m = ((CMYK.m - minCMY) / (1 - minCMY) * 100) >> 0;
    CMYK.y = ((CMYK.y - minCMY) / (1 - minCMY) * 100) >> 0;
    CMYK.k = (minCMY * 100) >> 0;
    
    return CMYK;
};


/**
 * CMYK to RGB
 *
 * https://gist.github.com/felipesabino/5066336
 * @param CMYK
 * @returns {ColorConverter.RGB}
 */
ColorConverter.cmyk2rgb  =  function (CMYK){
    var result = new ColorConverter.RGB(0, 0, 0);
    var c = CMYK.c / 100;
    var m = CMYK.m / 100;
    var y = CMYK.y / 100;
    var k = CMYK.k / 100;

    result.r = 1 - Math.min( 1, c * ( 1 - k ) + k );
    result.g = 1 - Math.min( 1, m * ( 1 - k ) + k );
    result.b = 1 - Math.min( 1, y * ( 1 - k ) + k );

    result.r = Math.round( result.r * 255 );
    result.g = Math.round( result.g * 255 );
    result.b = Math.round( result.b * 255 );

    return result;
};


// color = ColorConverter.cmyk2rgb(
//     ColorConverter.rgb2cmyk({
//         r:28,g:3,b:33
//     })
// );
//
// color = ColorConverter.rgb2cmyk(color);
// console.log(color);
