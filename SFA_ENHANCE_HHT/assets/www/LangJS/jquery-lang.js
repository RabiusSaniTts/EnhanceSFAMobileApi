var IgeEventsLite = function () {}

IgeEventsLite.prototype.on = function (evtName, fn) {
	if (evtName && fn) {
		this.eventList[evtName] = this.eventList[evtName] || [];
		this.eventList[evtName].push(fn);
	}
}
	
IgeEventsLite.prototype.emit = function (evtName) {
	if (evtName) {
		this.eventList = this.eventList || [];
		var args = [];
		for (var i = 1; i < arguments.length; i++) {
			args.push(arguments[i]);
		}
		if (evtName) {
			var fnList = this.eventList[evtName];
			for (var i in fnList) {
				if (typeof fnList[i] == 'function') {
					fnList[i].apply(this, args);
				}
			}
		}
	}
}

var jquery_lang_js = function () {
	this.events = new IgeEventsLite();
	
	this.on = this.events.on;
	this.emit = this.events.emit;
	
	return this;
}

jquery_lang_js.prototype.lang = {};
jquery_lang_js.prototype.defaultLang = 'en';
jquery_lang_js.prototype.currentLang = 'en';

jquery_lang_js.prototype.run = function(val) {
    var langElems = $('[lang]');
    var elemsLength = langElems.length;

    while (elemsLength--) {
        var elem = langElems[elemsLength];
        var langElem = $(elem);

        if (langElem.attr('lang') == this.defaultLang) {
            if (langElem.is("input")) {
                // An input element
                switch (langElem.attr('type')) {
                    case 'button':
                    case 'submit':
                        langElem.data('deftext', langElem.val());
                        break;
                }
            } else {
                // Not an input element
                langElem.data('deftext', langElem.html());
            }
        }
    }

    this.change(this.currentLang,val);
}

jquery_lang_js.prototype.loadPack = function(packPath) {
    $('<script type="text/javascript" charset="utf-8" src="' + packPath + '" />').appendTo("head");
}

jquery_lang_js.prototype.change = function(lang,val) {
    //console.log('Changing language to ' + lang);
    if (this.currentLang != lang) { this.update(lang); }
    this.currentLang = lang;

    // Get the page HTML
    var langElems = $('[lang]');
	/* Update by nidhi*/
	var elems = langElems[0];
	var langElemss = $(elems);
	
	if (langElemss.is("link")) {
		
	    langElemss.attr('href', '../css/'+val+'.css');
	}
	var elem1 = langElems[1];
	var langElem1 = $(elem1);
	if (langElem1.is("script")) {
	      langElem1.attr('src', '../LangJS/langpack/'+val+'.js');
	}
	   
	/* END by nidhi */
	
    if (lang != this.defaultLang) {
        var elemsLength = langElems.length;
	
        while (elemsLength--) {
            var elem = langElems[elemsLength];
	   
            var langElem = $(elem);   
	    
	    
            if (langElem.data('deftext')) {
		
                if (langElem.is("input")) {
                    // An input element
                    switch (langElem.attr('type')) {
                        case 'button':
                        case 'submit':
                            // A button or submit, change the value attribute
                            var currentText = langElem.val();
                            var defaultLangText = langElem.data('deftext');

                            var newText = this.lang[lang][defaultLangText] || currentText;
                            var newHtml = currentText.replace(currentText, newText);
                            langElem.val(newHtml);

                            // If element is customized button by JqueryMobile
                            langElem.prev('.ui-btn-inner').children('.ui-btn-text').html(newHtml);

                            if (currentText != newHtml) {
                                langElem.attr('lang', lang);
                            }
                            break;
                    }
                } else {
			
                    // Not an input element
                    var currentText = langElem.html();
                    var defaultLangText = langElem.data('deftext');
                   
                    var newText = this.lang[lang][defaultLangText.trim()] || currentText;
		    
                    var newHtml = currentText.replace(currentText, newText);
		   
                    langElem.html(newHtml);

                    // If element is customized LINK by JqueryMobile
                    var LinkText = langElem.find('.ui-btn-inner').children('.ui-btn-text').html();
                    langElem.find('.ui-btn-inner').children('.ui-btn-text').html(this.lang[lang][LinkText]);

                    if (currentText != newHtml) {
                        langElem.attr('lang', lang);
                    }
                }
            } else {
                //console.log('No language data for element... have you executed .run() first?');
            }
        }
    } else {
        // Restore the deftext data
        langElems.each(function() {
            var langElem = $(this);
            if (langElem.data('deftext')) {
                if (langElem.is("input")) {
                    // An input element
                    switch (langElem.attr('type')) {
                        case 'button':
                        case 'submit':
                            langElem.val(langElem.data('deftext'));
                            langElem.prev('.ui-btn-inner').children('.ui-btn-text').html(langElem.data('deftext'));
                            break;
                    }
                } else {
                    langElem.html(langElem.data('deftext'));
                }
            }
        });
    }
}

jquery_lang_js.prototype.update = function(lang) {
    this.emit('update', lang);
}