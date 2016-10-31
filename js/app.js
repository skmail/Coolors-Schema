if(typeof templateUrl == 'undefined'){
    templateUrl = 'templates/color-pane.html';
}

load(templatUrl,function(xhr){

    var panels = document.querySelectorAll('[color-pane]');

    var adjustTabs;

    var pickers = [];

    var panelHeight = window.innerHeight - document.getElementById('header').getBoundingClientRect().height - 5 + 'px';

    var refreshPicker = function(picker){

        picker.refreshSliders();

        // Refresh HSV sliders
        picker.hsvSliders.h.refresh();
        picker.hsvSliders.s.refresh();
        picker.hsvSliders.v.refresh();

        // Refresh RGB sliders
        picker.rgbSliders.r.refresh();
        picker.rgbSliders.g.refresh();
        picker.rgbSliders.b.refresh();

        // Refresh CMYK sliders
        picker.cmykSliders.c.refresh();
        picker.cmykSliders.m.refresh();
        picker.cmykSliders.y.refresh();
        picker.cmykSliders.k.refresh();

        // Refresh picker
        picker.pickerHandleBounds = picker.pickerHandle.getBoundingClientRect();
        picker.pickingAreaBounds = picker.pickingArea.getBoundingClientRect();

        picker.refreshPicker();
        picker.pickerHueSlider.refresh();
        picker.updateGradients();
    };

    for(var panelIndex = 0 ; panelIndex < panels.length ; panelIndex++){

        (function(){

            var panel = panels[panelIndex];

            panel.innerHTML = xhr.responseText;

            var innerPanel = panel.children[0];

            panel.style.height = panelHeight;
            innerPanel.style.height = panelHeight;
             var picker;
            
            var hexInput = panel.querySelector('.hex > input');
            var cmykInfo = panel.querySelector('.color-info-cmyk');

            var adjustButton  = panel.querySelector('.adjust.option');
            var adjustTab = panel.querySelector('.adjust-tab');

            var shadesButton  = panel.querySelector('.shades.option');
            var shadesContainer  = panel.querySelector('.shades-container');
            var shadesItems = shadesContainer.querySelectorAll('.shade-item');


            hexInput.addEventListener('click',function(){
                this.focus ();
                Utils.inputSelectionRange(this,1,7);
            });

            hexInput.addEventListener('keyup',function(e){
                var inp = String.fromCharCode(event.keyCode);
                if (/[a-zA-Z0-9]/.test(inp) || event.keyCode == 8 || event.keyCode == 46){
                    picker.updateFromHex(this.value);
                }
            });

            var pickerChangesCallback = function(){
                innerPanel.style.background = this.hex;
                hexInput.value = this.hex;
                cmykInfo.innerHTML = this.cmyk.toString();
                if(this.hsv.v > 0.5){
                    Utils.addClass(panel,'light');
                }else{
                    Utils.removeClass(panel,'light');
                }
            };

            picker = new ColorPicker(panel.getElementsByClassName('color-picker')[0],{
                hex:panel.getAttribute('hex'),
                sliders:{
                    hue:{
                        h:panel.getElementsByClassName('hsb-h-slider')[0],
                        s:panel.getElementsByClassName('hsb-s-slider')[0],
                        v:panel.getElementsByClassName('hsb-v-slider')[0]
                    },
                    rgb:{
                        r:panel.getElementsByClassName('rgb-r-slider')[0],
                        g:panel.getElementsByClassName('rgb-g-slider')[0],
                        b:panel.getElementsByClassName('rgb-b-slider')[0]
                    },
                    cmyk:{
                        c:panel.getElementsByClassName('cmyk-c-slider')[0],
                        m:panel.getElementsByClassName('cmyk-m-slider')[0],
                        y:panel.getElementsByClassName('cmyk-y-slider')[0],
                        k:panel.getElementsByClassName('cmyk-k-slider')[0]
                    }
                },
                onInit:pickerChangesCallback,
                onChange: pickerChangesCallback
            });

            pickers.push(picker);

            new Tabs(adjustTab,{
                onChange:function(){
                    refreshPicker(picker);
                }
            });

            adjustButton.addEventListener('click',function(){
                if(!adjustTabs){
                    adjustTabs = document.querySelectorAll('.adjust-tab');
                }
                Utils.each(adjustTabs,function(index,element){
                   Utils.removeClass(element,'active');
                });
                Utils.addClass(adjustTab,'active');

                refreshPicker(picker);
            });

            document.addEventListener('click',function(e){
                if(!Utils.isDescendantOrSelfOf(e.target,adjustTab) && !Utils.isDescendantOrSelfOf(e.target,adjustButton)){
                    Utils.removeClass(adjustTab,'active');
                }
            });


            shadesButton.addEventListener('click',function(e){

                Utils.addClass(shadesContainer,'active');

                var createElement = function(element,rgb){
                    element.style.background = rgb.toString();
                    var hex =  ColorConverter.rgb2hex(rgb);
                    element.innerHTML = '<div>' + hex + '</div>' ;
                    element.addEventListener('click',function(){
                        picker.updateFromHex(hex);
                        Utils.removeClass(shadesContainer,'active');
                    });
                };

                var newRgb = new ColorConverter.RGB(0,0,0);

                var counter = shadesItems.length - 1;

                var f = 0.09;

                // Shades
                for(var i = 0; i < 10 ; i++){
                    var factor = i * f + f;
                    newRgb.r = Math.round(picker.rgb.r * factor);
                    newRgb.g = Math.round(picker.rgb.g * factor);
                    newRgb.b = Math.round(picker.rgb.b * factor);
                    createElement(shadesItems[counter--],newRgb);
                }

                // Middle color
                createElement(shadesItems[(shadesItems.length - 1) / 2],picker.rgb);

                // Tint
                for(var i = 0; i < 10 ; i++ ){
                    var factor = i * f + f;
                    newRgb.r = Math.round(picker.rgb.r + (255 - picker.rgb.r) * factor);
                    newRgb.g = Math.round(picker.rgb.g + (255 - picker.rgb.g) * factor);
                    newRgb.b = Math.round(picker.rgb.b + (255 - picker.rgb.b) * factor);
                    createElement(shadesItems[9 - i],newRgb);
                    counter--;
                }

            });

        })();
    }

    var generateRandomMonochromatic = function(){
        var h = Math.random();
        for(var i = 0 ; i < pickers.length; i++){
            pickers[i].update(new ColorConverter.HSV(h,Math.random() ,Math.random() ));
            refreshPicker(pickers[i]);
        }
    };
    document.addEventListener('keyup',function(e){
        if(e.keyCode == 32){
            generateRandomMonochromatic();
        }
    });

    var resizingTimeOut = null;

    window.onresize = function(){
        if (resizingTimeOut != null){
            clearTimeout(resizingTimeOut);
        }
        resizingTimeOut = setTimeout(function(){
            var panelHeight = window.innerHeight - document.getElementById('header').getBoundingClientRect().height - 5 + 'px';
            for (var i = 0 ; i < panels.length; i++) {
                var panel = panels[i];
                var innerPanel = panel.children[0];
                panel.style.height = panelHeight;
                innerPanel.style.height = panelHeight;
            }
        }, 500);
    };

});





/**
 * http://blog.garstasio.com/you-dont-need-jquery/ajax/
 *
 * @param url
 * @param callback
 */

function load(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET',url);
    xhr.onload = function() {
        if (xhr.status === 200) {
            callback(xhr);
        }
        else {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
}


