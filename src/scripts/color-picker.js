var ColorPicker;

(function () {
    "use strict";

    /**
     * Sliding mouse event
     *
     * @param element
     * @param onMoving
     */
    var onSlide = function (element, onMoving) {
        element.addEventListener('mousedown', function (e) {
            onMoving.apply(element[0], [e]);
            var mouseUp = function () {
                document.removeEventListener('mousemove', onMoving);
            };
            document.addEventListener('mousemove', onMoving);
            document.addEventListener('mouseup', mouseUp);
        });
    };


    /**
     * Init color picker
     *
     * @param selector
     * @param optio
     * @constructor
     */
    ColorPicker = function (selector, options) {
        this.selector = selector;
        var settings = this.settings = Utils.extend({
            hex: '#000',
            sliders: {
                hue: {
                    h: null,
                    s: null,
                    v: null
                },
                rgb: {
                    r: null,
                    g: null,
                    b: null
                }
            },
            onChange: function (value) {return value;}
        }, options);

        this.rgb = ColorConverter.hex2rgb(settings.hex);

        this.hsv = ColorConverter.rgb2hsv(this.rgb);

        this.pickingArea = Utils.createElementAndAppendIt('picking-area', selector);

        this.pickerHandle = Utils.createElementAndAppendIt('picker-handle', this.pickingArea);

        this.huePicker = Utils.createElementAndAppendIt('color-picker-h', selector);

        this.refreshPicker();

        var self = this;

        /**
         * Saturation  & Brightness picker
         */
        onSlide(this.pickingArea, function (e) {

            var x = e.pageX - (self.pickingAreaBounds.left + window.scrollX);
            var y = e.pageY - (self.pickingAreaBounds.top + window.scrollY);

            e.preventDefault();

            if (x < 0) {
                x = 0;
            }
            if (y < 0) {
                y = 0;
            }

            if (x > self.pickingAreaBounds.width) {
                x = self.pickingAreaBounds.width;
            }
            if (y > self.pickingAreaBounds.height) {
                y = self.pickingAreaBounds.height;
            }

            self.pickerHandle.style.left = Math.round(x - self.pickerHandleBounds.width / 2 ) + 'px';
            self.pickerHandle.style.top = Math.round(y - self.pickerHandleBounds.height / 2 ) + 'px';

            self.hsv.s = x / self.pickingAreaBounds.width;
            self.hsv.v = 1 - (y / self.pickingAreaBounds.height);

            self.hsv.v = parseFloat(self.hsv.v.toFixed(3));
            self.hsv.s = parseFloat(self.hsv.s.toFixed(3));

            self.fetchColors();

            self.updateGradients();

            self.refreshSliders();

            settings.onChange.apply(self);
        });

        // Picker  Hue slider
        this.pickerHueSlider = new Slider(self.huePicker, {
            max: 360,
            value: Math.round(this.hsv.h * 360),
            controls:false,
            onChange: function (value) {
                self.hsv.h = value / 360;
                self.fetchColors();
                self.refreshSliders();
                self.updateGradients();
                settings.onChange.apply(self);
            }
        });

        this.update();



        /**
         * Buld HSV Sliders
         *
         * @type {{}}
         */
        this.hsvSliders = {};

        if (!this.settings.sliders.hue.h) {
            this.settings.sliders.hue.h = Utils.createElementAndAppendIt('hsv-h-slider', selector);
        }
        // HSB  Hue slider
        this.hsvSliders.h = new Slider(this.settings.sliders.hue.h, {
            max: 360,
            value: Math.round(this.hsv.h * 360),
            onChange: function (value) {
                self.updateH(value / 360);
                self.updateGradients();
                self.refreshSliders('hsv');
            }
        });


        if (!this.settings.sliders.hue.s) {
            this.settings.sliders.hue.s = Utils.createElementAndAppendIt('hsv-s-slider', selector);
        }
        // HSB  Saturation slider
        this.hsvSliders.s = new Slider(this.settings.sliders.hue.s, {
            max: 100,
            value: Math.round(this.hsv.s * 100),
            onChange: function (value) {
                self.updateS(value / 100);
                self.updateGradients();
                self.refreshSliders('hsv');
            }
        });

        if (!this.settings.sliders.hue.v) {
            this.settings.sliders.hue.v = Utils.createElementAndAppendIt('hsv-v-slider', selector);
        }
        // HSB  Saturation slider
        this.hsvSliders.v = new Slider(this.settings.sliders.hue.v, {
            max: 100,
            value: Math.round(this.hsv.v * 100),
            onChange: function (value) {
                self.updateV(value / 100);
                self.updateGradients();
                self.refreshSliders('hsv');
            }
        });

        /**
         * Build RGB Sliders
         *
         * @type {{}}
         */
        this.rgbSliders = {};

        if (!this.settings.sliders.rgb.r) {
            this.settings.sliders.rgb.r = Utils.createElementAndAppendIt('rgb-r-slider', selector);
        }
        // Red  slider
        this.rgbSliders.r = new Slider(this.settings.sliders.rgb.r, {
            max: 255,
            value: this.rgb.r,
            onChange: function (value) {
                self.rgb.r = value;
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('rgb');
            }
        });

        if (!this.settings.sliders.rgb.g) {
            this.settings.sliders.rgb.g = Utils.createElementAndAppendIt('rgb-g-slider', selector);
        }
        // Green slider
        this.rgbSliders.g = new Slider(this.settings.sliders.rgb.g, {
            max: 255,
            value: this.rgb.g,
            onChange: function (value) {
                self.rgb.g = value;
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('rgb');
            }
        });

        if (!this.settings.sliders.rgb.b) {
            this.settings.sliders.rgb.b = Utils.createElementAndAppendIt('rgb-b-slider', selector);
        }

        // Blue slider
        this.rgbSliders.b = new Slider(this.settings.sliders.rgb.b, {
            max: 255,
            value: this.rgb.b,
            onChange: function (value) {
                self.rgb.b = value;
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('rgb');
            }
        });


        /**
         * Build CMYK Sliders
         *
         * @type {{}}
         */
        this.cmykSliders = {};

        // Cyan slider
        if (!this.settings.sliders.cmyk.c) {
            this.settings.sliders.cmyk.c = Utils.createElementAndAppendIt('cmyk-c-slider', selector);
        }
        this.cmykSliders.c = new Slider(this.settings.sliders.cmyk.c, {
            max: 100,
            value: self.cmyk.c,
            onChange: function (value) {
                self.cmyk.c = value;
                self.rgb = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(self.cmyk.c, self.cmyk.m, self.cmyk.y, self.cmyk.k));
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('cmyk');
            }
        });


        // Magenta slider
        if (!this.settings.sliders.cmyk.m) {
            this.settings.sliders.cmyk.m = Utils.createElementAndAppendIt('cmyk-m-slider', selector);
        }
        this.cmykSliders.m = new Slider(this.settings.sliders.cmyk.m, {
            max: 100,
            value: self.cmyk.m,
            onChange: function (value) {
                self.cmyk.m = value;
                self.rgb = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(self.cmyk.c, self.cmyk.m, self.cmyk.y, self.cmyk.k));
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('cmyk');
            }
        });


        // Yellow slider
        if (!this.settings.sliders.cmyk.y) {
            this.settings.sliders.cmyk.y = Utils.createElementAndAppendIt('cmyk-y-slider', selector);
        }
        this.cmykSliders.y = new Slider(this.settings.sliders.cmyk.y, {
            max: 100,
            value: self.cmyk.y,
            onChange: function (value) {
                self.cmyk.y = value;
                self.rgb = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(self.cmyk.c, self.cmyk.m, self.cmyk.y, self.cmyk.k));
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('cmyk');
            }
        });

        // Key/Black Slider
        if (!this.settings.sliders.cmyk.k) {
            this.settings.sliders.cmyk.k = Utils.createElementAndAppendIt('cmyk-k-slider', selector);
        }
        this.cmykSliders.k = new Slider(this.settings.sliders.cmyk.k, {
            max: 100,
            value: self.cmyk.k,
            onChange: function (value) {
                self.cmyk.k = value;
                self.rgb = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(self.cmyk.c, self.cmyk.m, self.cmyk.y, self.cmyk.k));
                self.update(ColorConverter.rgb2hsv(self.rgb));
                self.updateGradients();
                self.refreshSliders('cmyk');
            }
        });

        // CREATE sliders and picker gradients on init
        this.updateGradients();

        // Fire onInit event
        settings.onInit.apply(this);



    };

    /**
     * Update by given hsv color
     *
     * @param hsv
     */
    ColorPicker.prototype.update = function (hsv) {
        if (hsv) {
            this.hsv = hsv;
        }
        this.fetchColors();
        this.pickerHandle.style.left = Math.round((this.hsv.s * this.pickingAreaBounds.width) - this.pickerHandleBounds.width / 2 ) + 'px';
        this.pickerHandle.style.top = Math.round(( (1 - this.hsv.v) * this.pickingAreaBounds.height) - this.pickerHandleBounds.height / 2) + 'px';
        this.pickerHueSlider.move(Math.round(this.hsv.h * 360) );
        this.settings.onChange.apply(this);
    };


    /**
     * Get CSS Gradient  of Hue colors of current saturation and brightness
     *
     * @returns {string}
     */
    ColorPicker.prototype.getHueGradient = function () {
        return ' -webkit-linear-gradient(left,' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(0 / 360, this.hsv.s, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(60 / 360, this.hsv.s, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(120 / 360, this.hsv.s, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(180 / 360, this.hsv.s, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(240 / 360, this.hsv.s, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(300 / 360, this.hsv.s, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(0 / 360, this.hsv.s, this.hsv.v)).toString() + ')';
    };

    /**
     * Get css gradient of  current color from lowest to highest intensity.
     *
     * @returns {string}
     */
    ColorPicker.prototype.getSaturationGradient = function () {
        return ' -webkit-linear-gradient(left,' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(this.hsv.h, 0, this.hsv.v)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(this.hsv.h, 1, this.hsv.v)).toString() + ')';
    };

    /**
     * Get css gradient of  current color from highest to lowest brightness.
     * @returns {string}
     */
    ColorPicker.prototype.getBrightnessGradient = function () {
        return ' -webkit-linear-gradient(left,' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(this.hsv.h, this.hsv.s, 0)).toString() + ',' +
            ColorConverter.hsv2rgb(new ColorConverter.HSV(this.hsv.h, this.hsv.s, 1)).toString() + ')';
    };

    /**
     * Build hue slider gradient
     */
    ColorPicker.prototype.buildHueGradient = function () {
        this.pickerHueSlider.getSliderDom().style.background = this.getHueGradient();
    };

    /**
     * Update hue
     *
     * @param h
     */
    ColorPicker.prototype.updateH = function (h) {
        this.hsv.h = h;
        this.update(this.hsv);
    };

    /**
     * Update Saturation
     *
     * @param h
     */
    ColorPicker.prototype.updateS = function (s) {
        this.hsv.s = s;
        this.update(this.hsv);
    };
    /**
     * Update brightness/value
     *
     * @param v
     */
    ColorPicker.prototype.updateV = function (v) {
        this.hsv.v = v;
        this.update(this.hsv);
    };

    /**
     * Refresh  picker and  colors sliders
     *
     */
    ColorPicker.prototype.updateGradients = function () {

        this.buildHueGradient();

        this.hsvSliders.h.getSliderDom().style.background = this.getHueGradient();
        this.hsvSliders.s.getSliderDom().style.background = this.getSaturationGradient();
        this.hsvSliders.v.getSliderDom().style.background = this.getBrightnessGradient();

        this.rgbSliders.r.getSliderDom().style.background = '-webkit-linear-gradient(left, rgb(0,' + this.rgb.g + ',' + this.rgb.b + '), rgb(255,' + this.rgb.g + ',' + this.rgb.b + '))';
        this.rgbSliders.g.getSliderDom().style.background = '-webkit-linear-gradient(left, rgb(' + this.rgb.r + ',0,' + this.rgb.b + '), rgb(' + this.rgb.r + ', 255,' + this.rgb.b + '))';
        this.rgbSliders.b.getSliderDom().style.background = '-webkit-linear-gradient(left, rgb(' + this.rgb.r + ',' + this.rgb.g + ',0), rgb(' + this.rgb.r + ',' + this.rgb.g + ',255))';


        var cFrom = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(0, this.cmyk.m, this.cmyk.y, this.cmyk.k)).toString();
        var cTo = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(100, this.cmyk.m, this.cmyk.y, this.cmyk.k)).toString();

        var mFrom = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(this.cmyk.c, 0, this.cmyk.y, this.cmyk.k)).toString();
        var mTo = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(this.cmyk.c, 100, this.cmyk.y, this.cmyk.k)).toString();

        var yFrom = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(this.cmyk.c, this.cmyk.m, 0, this.cmyk.k)).toString();
        var yTo = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(this.cmyk.c, this.cmyk.m, 100, this.cmyk.k)).toString();

        var kFrom = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(this.cmyk.c, this.cmyk.m, this.cmyk.y, 0)).toString();
        var kTo = ColorConverter.cmyk2rgb(new ColorConverter.CMYK(this.cmyk.c, this.cmyk.m, this.cmyk.y, 100)).toString();

        this.cmykSliders.c.getSliderDom().style.background = ' -webkit-linear-gradient(left,' + cFrom + ', ' + cTo + ')';
        this.cmykSliders.m.getSliderDom().style.background = ' -webkit-linear-gradient(left,' + mFrom + ', ' + mTo + ')';
        this.cmykSliders.y.getSliderDom().style.background = ' -webkit-linear-gradient(left,' + yFrom + ', ' + yTo + ')';
        this.cmykSliders.k.getSliderDom().style.background = ' -webkit-linear-gradient(left,' + kFrom + ', ' + kTo + ')';
        this.pickingArea.style.background = ColorConverter.hsv2rgb(new ColorConverter.HSV(this.hsv.h, 1, 1)).toString();
    };

    /**+
     * Populate RGB, HEX and CMYK colors from current HSV color
     */
    ColorPicker.prototype.fetchColors = function () {
        this.rgb = ColorConverter.hsv2rgb(this.hsv);
        if(this.updateFrom != 'hex'){
            this.hex = ColorConverter.rgb2hex(this.rgb);
        }else{
            this.hex = this.source;
        }
        this.cmyk = ColorConverter.rgb2cmyk(this.rgb);
    };

    /**
     * Refresh sliders positions
     *
     * @param except
     */
    ColorPicker.prototype.refreshSliders = function (except) {
        if (except != 'hsv') {
            this.hsvSliders.h.move(Math.round(this.hsv.h * 360));
            this.hsvSliders.s.move(Math.round(this.hsv.s * 100));
            this.hsvSliders.v.move(Math.round(this.hsv.v * 100));
        }
        if (except != 'rgb') {
            this.rgbSliders.r.move(this.rgb.r);
            this.rgbSliders.g.move(this.rgb.g);
            this.rgbSliders.b.move(this.rgb.b);
        }
        if (except != 'cmyk') {
            this.cmykSliders.c.move(this.cmyk.c);
            this.cmykSliders.m.move(this.cmyk.m);
            this.cmykSliders.y.move(this.cmyk.y);
            this.cmykSliders.k.move(this.cmyk.k);
        }
    };
    
    /**
     * Refresh Picker handle position
     */
    ColorPicker.prototype.refreshPicker = function(){
        this.pickerHandleBounds = this.pickerHandle.getBoundingClientRect();
        this.pickingAreaBounds = this.pickingArea.getBoundingClientRect();
        this.pickerHandle.style.left = Math.round((this.hsv.s * this.pickingAreaBounds.width) - this.pickerHandleBounds.width / 2) + 'px';
        this.pickerHandle.style.top = Math.round(( (1 - this.hsv.v) * this.pickingAreaBounds.height) - this.pickerHandleBounds.height / 2) + 'px';
    };

    /**
     * Update color picker from hex input
     * 
     * @param hex
     */
    ColorPicker.prototype.updateFromHex = function(hex){
        this.updateFrom = 'hex';
        this.source = hex;

        var rgb = ColorConverter.hex2rgb(hex);
        if(rgb){
            var hsv = ColorConverter.rgb2hsv(rgb);
            this.update(hsv);
        }
        this.refreshSliders();
        this.updateGradients();
        this.updateFrom = null;
        this.source = null;
    };
    
})();