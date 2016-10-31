var Tabs;

(function(){

    Tabs = function(element,options){

        this.element = element;

        var settings = Utils.extend({
            onChange:function(){}
        },options)
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
                    if(tabPane.getAttribute('data-tab') == tabName){
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