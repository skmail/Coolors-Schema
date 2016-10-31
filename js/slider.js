var Slider;

(function(){

    Slider = function (container,options) {

        var settings =  this.settings = Utils.extend({
            value : 0,
            max:100,
            controls:true,
            onChange:function(value){}
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
                if(value == this.value){
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
                    self.currentPosition = self.bounds.width
                }

                self.currentPosition = self.currentPosition >> 0;

                self.handle.style.left = (self.currentPosition - self.handleBounds.width  / 2 >> 0) + 'px';

                settings.value = (self.currentPosition / self.bounds.width) * settings.max >> 0;

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
        this.currentPosition = value / this.settings.max * this.bounds.width >> 0;
        this.handle.style.left = (this.currentPosition - this.handleBounds.width  / 2 >> 0) + 'px';
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
    }

    
})();