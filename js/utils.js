
var Utils = {};


Utils.each = function(elements,callback){
    if(typeof elements == 'string'){
        elements = document.querySelectorAll(elements);
    }

    for(var i = 0; i< elements.length; i++){
        if(typeof callback == 'function'){
            callback(i,elements[i]);
        }
    }
};

Utils.addClass = function (element, className) {
    if (!Utils.hasClass(element, className)) {
        element.className += ' ' + className;
        element.className = element.className.replace(/ +(?= )/g,'').trim()
    }
};

Utils.hasClass = function(element,classname){
    var className = " " + classname + " ";
    if(!element){
        return false;
    }
    if ( (" " + element.className + " ").replace(/[\n\t]/g, " ").indexOf(" " + classname + " ") > -1 ) {
        return true;
    }
    return false;
}

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
    } else if( typeof field.selectionStart != 'undefined' ) {
        field.selectionStart = start;
        field.selectionEnd = end;
        field.focus();
    }
};


Utils.isDescendantOrSelfOf = function (child,parent) {
    if (child == parent) {
        return true;
    }
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}


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
