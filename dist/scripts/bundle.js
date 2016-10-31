var Utils = {};

(function(){
    "use strict";

    /**
     * Array loop
     *
     * @param elements
     * @param callback
     */
    Utils.each = function(elements,callback){
        if(typeof elements === 'string'){
            elements = document.querySelectorAll(elements);
        }
        for(var i = 0; i< elements.length; i++){
            if(typeof callback === 'function'){
                callback(i,elements[i]);
            }
        }
    };

    /**
     * Add class on html element
     *
     * @param element
     * @param className
     */
    Utils.addClass = function (element, className) {
        if (!Utils.hasClass(element, className)) {
            element.className += ' ' + className;
            element.className = element.className.replace(/ +(?= )/g,'').trim();
        }
    };

    /**
     * Check if html element has certain class
     *
     * @param element
     * @param classname
     * @returns {boolean}
     */
    Utils.hasClass = function(element,classname){
        classname = " " + classname + " ";
        if(!element){
            return false;
        }
        if ( (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(" " + classname + " ") > -1 ) {
            return true;
        }
        return false;
    };

    /**
     * Remove class from html element
     * @param node
     * @param className
     */
    Utils.removeClass = function(node,className) {
        node.className = node.className.replace(
            new RegExp('(^|\\s+)' + className + '(\\s+|$)', 'g'),
            '$1'
        ).replace(/ +(?= )/g,'').trim();
    };

    /**
     * merge to object into new object
     *
     * @param defaults
     * @param options
     * @returns {{}}
     */
    Utils.extend = function (defaults, options) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

    /**
     * http://stackoverflow.com/questions/646611/programmatically-selecting-partial-text-in-an-input-field
     *
     * @param field
     * @param start
     * @param end
     */
    Utils.inputSelectionRange = function(field, start, end) {
        if( field.createTextRange ) {
            var selRange = field.createTextRange();
            selRange.collapse(true);
            selRange.moveStart('character', start);
            selRange.moveEnd('character', end);
            selRange.select();
            field.focus();
        } else if( field.setSelectionRange ) {
            field.focus();
            field.setSelectionRange(start, end);
        } else if( typeof field.selectionStart !== 'undefined' ) {
            field.selectionStart = start;
            field.selectionEnd = end;
            field.focus();
        }
    };

    /**
     * Check if element is a children of given element of is the same element.
     *
     * @param child
     * @param parent
     * @returns {boolean}
     */
    Utils.isDescendantOrSelfOf = function (child,parent) {
        if (child == parent) {
            return true;
        }
        var node = child.parentNode;
        while (node !== null) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    };


    /**
     *
     * Create div element and append  to to exists element
     *
     * @param className
     * @param $parent
     * @returns {Element}
     */
    Utils.createElementAndAppendIt = function(className,$parent, type){
        if(!type){
            type = 'div';
        }
        var element = document.createElement(type);
        element.className = className;
        $parent.appendChild(element);
        return element;
    };

})();
var Tabs;

(function(){

    "use strict";
    
    Tabs = function(element,options){

        this.element = element;

        var settings = Utils.extend({
            onChange:function(){}
        },options);

        var $this = this;

        var tabsButtons = this.element.querySelectorAll(' .tabs-btns > ul > li > a');

        Utils.each(tabsButtons,function(index,tabButton){
            tabButton.addEventListener('click',function(){
                Utils.each(tabsButtons,function(index,li){
                    Utils.removeClass(li,'active');
                });
                Utils.addClass(tabButton,'active');
                var tabName = this.getAttribute('data-tab');
                Utils.each($this.element.querySelectorAll(' .tab-pane '),function(index,tabPane){
                    if(tabPane.getAttribute('data-tab') === tabName){
                        Utils.addClass(tabPane,'active');
                        Utils.addClass(element,'active');
                        settings.onChange();
                    }else{
                        Utils.removeClass(tabPane,'active');
                    }
                });
            });
        });
    };




}());
var Slider;

(function(){

    "use strict";

    Slider = function (container,options) {

        var settings =  this.settings = Utils.extend({
            value : 0,
            max:100,
            controls:true,
            onChange:function(value){return value;}
        },options);

        var self = this;
        
        Utils.addClass(container,'slider-container');

        if(settings.controls){
            var controlsContainer = Utils.createElementAndAppendIt('slider-controls',container);
            var increaseButton = Utils.createElementAndAppendIt('slider-inc',controlsContainer,'button');
            increaseButton.innerHTML = '+';
            var decreaseButton = Utils.createElementAndAppendIt('slider-dec',controlsContainer,'button');
            decreaseButton.innerHTML = '-';
            var input = this.input = Utils.createElementAndAppendIt('slider-input',controlsContainer,'input');

            increaseButton.addEventListener('click',function(){
                if(settings.value < settings.max){
                    self.update(parseInt(self.settings.value) + 1);
                    input.value = settings.value;
                }
            });

            decreaseButton.addEventListener('click',function(){
                if(settings.value > 0){
                    self.update(parseInt(self.settings.value) - 1);
                    input.value = settings.value;
                }
            });

            input.addEventListener('keyup',function(){
                var value = parseInt(this.value);
                if(value === this.value){
                    self.update(value);
                }
            });

            input.value = settings.value;
        }


        this.slider = Utils.createElementAndAppendIt('slider',container);
        this.handle = Utils.createElementAndAppendIt('slider-handle',this.slider);

        this.refresh();

        this.slider.addEventListener('mousedown',function(e){

            var point = {
                x: self.currentPosition + self.bounds.left
            };

            var drag = function(e){

                e.preventDefault();

                var diffX = e.pageX  - point.x;

                //  Slider must moved when mouse cursor inside slider only
                if(diffX < 0 && e.pageX < self.bounds.left && settings.value  <= 0){
                    return ;
                }else if(diffX > 0 && e.pageX > self.bounds.left + self.bounds.width  && self.currentPosition  >= self.bounds.width ){
                    return;
                }

                self.currentPosition += diffX;

                point.x = e.pageX;
                if(self.currentPosition < 0){
                    self.currentPosition = 0;
                }
                if(self.currentPosition > self.bounds.width){
                    self.currentPosition = self.bounds.width;
                }

                self.currentPosition = Math.round(self.currentPosition);

                self.handle.style.left = Math.round(self.currentPosition - self.handleBounds.width  / 2) + 'px';

                settings.value = Math.round((self.currentPosition / self.bounds.width) * settings.max);

                settings.onChange(settings.value);

                if(settings.controls){
                    input.value = settings.value;
                }
            };

            // Drag on click
            drag(e);

            var up = function(){
                document.removeEventListener('mousemove',drag);
                document.removeEventListener('mousemove',up);
            };
            document.addEventListener('mousemove',drag);
            document.addEventListener('mouseup',up);
        });

    };

    /**
     * Update slider value and fire onChange callback
     *
     * @param value
     */
    Slider.prototype.update = function(value){
        this.move(value);
        this.settings.onChange(this.settings.value);
    };

    /**
     * Update slider value without fire onChange callback
     *
     * @param value
     */
    Slider.prototype.move = function(value){
        this.currentPosition = Math.round(value / this.settings.max * this.bounds.width);
        this.handle.style.left = Math.round(this.currentPosition - this.handleBounds.width  / 2 ) + 'px';
        this.settings.value = value;
        if(this.settings.controls){
            this.input.value = this.settings.value;
        }
    };

    /**
     * Return slider htmlElement
     * @returns {Element|*}
     */
    Slider.prototype.getSliderDom = function(){
        return this.slider;
    };

    /**
     * Set slider bounds and  move slide handle to the current value
     */
    Slider.prototype.refresh = function(){
        this.bounds = this.slider.getBoundingClientRect();
        this.handleBounds = this.handle.getBoundingClientRect(); 
        this.move(this.settings.value);
    };
    
})();
var ColorConverter = {};

(function(){
    "use strict";
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
     *
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

        if (diff === 0) {
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
                rgb.r = hsv.v;
                rgb.g = t;
                rgb.b = p;
                break;
            case 1:
                rgb.r = q;
                rgb.g = hsv.v;
                rgb.b = p;
                break;
            case 2:
                rgb.r = p;
                rgb.g = hsv.v;
                rgb.b = t;
                break;
            case 3:
                rgb.r = p;
                rgb.g = q;
                rgb.b = hsv.v;
                break;
            case 4:
                rgb.r = t;
                rgb.g = p;
                rgb.b = hsv.v;
                break;
            case 5:
                rgb.r = hsv.v;
                rgb.g = p;
                rgb.b = q;
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
            return new  ColorConverter.RGB(parseInt(result[1], 16),parseInt(result[2], 16),parseInt(result[3], 16));
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
        if (RGB.r === 0 && RGB.g === 0 && RGB.b === 0 ) {
            CMYK.k = 100;
            return CMYK;
        }

        CMYK.c = 1 - (RGB.r/255);
        CMYK.m = 1 - (RGB.g/255);
        CMYK.y = 1 - (RGB.b/255);

        var minCMY = Math.min(CMYK.c, Math.min(CMYK.m,CMYK.y));

        CMYK.c = Math.round((CMYK.c - minCMY) / (1 - minCMY) * 100) ;
        CMYK.m = Math.round((CMYK.m - minCMY) / (1 - minCMY) * 100);
        CMYK.y = Math.round((CMYK.y - minCMY) / (1 - minCMY) * 100);
        CMYK.k = Math.round(minCMY * 100);

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
})();
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