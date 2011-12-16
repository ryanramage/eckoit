/*******JQUERY TOGGLE EDIT v1.6 *****
 *    by alan clarke
 *    created: 15 Mar 2011
 *    last update: 7 May 2011,
 *    alan@staticvoid.info
 *
 *    Special thanks to the following for their comments, feedback and code changes:
 *        david price, davidprice.pen.io
 *
 *****************************/
(function($) {
    jQuery.expr[':'].focus = function(elem) {
        return elem === document.activeElement && (elem.type || elem.href);
    };

    $.widget("ui.toggleEdit", {
        options: {
            types: [ ],
            copyCss: true,
            eventsEnabled: true,
            events: {},
            listeners: {},
            delay: 1000,
            stickyFocus: true,
            defaultText: '    '
        },
        defaults: {
            events: {
                edit: "click",
                delayedit: false,
                canceledit: false,
                preview: "mouseleave",
                cancelpreview: "mouseenter",
                delaypreview: 800
            },
            listeners: {
                edit: "p",
                canceledit: "p",
                preview: "i",
                cancelpreview: "i"
            }
        },
        _init: function() {
            var self = this;
            //bugfix deep default options are overridden on second init. still need to find source issue
            self.options.events = $.extend(true, {}, self.defaults.events, self.options.events);
            self.options.listeners = $.extend(true, {}, self.defaults.listeners, self.options.listeners);
            //skip submit buttons and hidden fields
            if (self.element.is(":submit") || self.element.is("input[type=hidden]")) {
                return false;
            }
            //cleanup
            if (typeof self.element.data("toggleEdit-preview") !== "undefined") {
                self.clear();
                self.disableEvents();
            }
            //init preview element
            self.p = $("<div class=\"toggleEdit toggleEdit-preview toggleEdit-preview-" + self._tag(self.element) + "\"></div>").insertAfter(self.element);
            self.element.addClass("toggleEdit toggleEdit-edit toggleEdit-edit-" + self._tag(self.element))
            //store reference to preview element
            .data("toggleEdit-preview", self.p);
            self.eventsEnabled = self.options.eventsEnabled;
            if (self.eventsEnabled) {
                self.enableEvents();
            }
            else {
                self._initHandlers();
                self.preview();
            }
        },
        toggle: function() {
            var self = this;
            if (self.editmode) {
                self.preview();
            }
            else {
                self.edit();
            }
        },
        edit: function(event, init) {
            var self = this;
            self.editmode = true;
            self.text = self._parseValue(self.element);
            self.p.hide();
            self.element.show();
            if (!init) {
                self._trigger("onedit", event, {
                    text: self.text,
                    preview: self.p,
                    element: self.element
                });
            }
        },
        preview: function(event, init) {
            var self = this;
            //if el is focused, delay preview till blur
            if (self.options.stickyFocus) {
                var i = self._getTypeInput(self.element);
                if (typeof self.handlers === 'undefined') {
                    self.handlers = {
                        preview: null
                    };
                }
                i.unbind('blur', self.handlers.preview.trigger);
                if (i.is(':focus')) {
                    i.bind('blur', self.handlers.preview.trigger);
                    return false;
                }
            }
            self.editmode = false;
            self.text = self._parseValue(self.element);
            self.element.hide();
            self._setup();
            self.p.show();
            if (!init) {
                self._trigger("onpreview", event, {
                    text: self.text,
                    preview: self.p,
                    element: self.element
                });
            }
        },
        previewEl: function() {
            return this.p;
        },
        _tag: function(e) {
            return e.get(0).tagName.toLowerCase();
        },
        _getTypeInput: function(e) {
            var self = this;
            var i;
            //custom inputs overide defaults
            for (i = 0;
            i < self.options.types.length;
            i++) {
                if ($.isFunction(self.options.types[i].is) && $.isFunction(self.options.types[i].input)) {
                    if (self.options.types[i].is(e)) {
                        return self.options.types[i].input(e);
                    }
                }
            }
            return e;
        },
        _parseValue: function() {
            var self = this;
            var i;
            var val;
            //custom inputs overide defaults
            for (i = 0;
            i < self.options.types.length;
            i++) {
                if ($.isFunction(self.options.types[i].is) && $.isFunction(self.options.types[i].text)) {
                    if (self.options.types[i].is(self.element)) {
                        val = self.options.types[i].text(self.element);
                        return val ? val : self.options.defaultText;
                    }
                }
            }
            if (self.element.is("select")) {
                return self.element.find("option[value=" + self.element.val() + "]").text();
            }
            else {
                if (self.element.is(":checkbox")) {
                    if (self.element.is(":checked")) {
                        return "Yes";
                    }
                    else {
                        return "No";
                    }
                }
                val = self.element.val();
                return val ? val : self.options.defaultText;
            }
        },
        _listner: function(selector) {
            var self = this;
            switch (selector) {
            case "e":
                return self.element;
            case "p":
                return self.p;
            case "i":
                return self._getTypeInput(self.element);
            default:
                return $(selector);
            }
        },
        //applies css to and populates preview element
        _setup: function() {
            var self = this;
            var css = {};
            if (self.options.copyCss) {
                var width = self.element.width();
                var height = self.element.height();
                var display = self.element.css("display");
                var floatVal = self.element.css("float");
                if (!self.element.is(":checkbox")) {
					if(self.element.is('input[type="text"],select')){
						css['whiteSpace'] = 'nowrap';
					}
					if (width) {
                        css.minWidth = width;
                    }
                    if (height) {
                        css.height = height;
                    }
                }
                if (display) {
                    css.display = display;
                }
                if (floatVal) {
                    css['float'] = floatVal;
                }
				
            }
            self.p.css(css).html(self.text);
        },
        _initHandlers: function() {
            var self = this;
            self.handlers = {
                preview: {
                    trigger: function(event) {
                        if (!self.options.events.delaypreview) {
                            self.preview(event);
                        }
                        else {
                            self.handlers.preview.timeout = setTimeout(function() {
                                self.preview(event);
                            }, self.options.events.delaypreview);
                        }
                    },
                    cancel: function() {
                        clearTimeout(self.handlers.preview.timeout);
                        self._trigger("cancelpreview", event, {
                            text: self.text,
                            preview: self.p,
                            element: self.element
                        });
                    }
                },
                edit: {
                    trigger: function(event) {
                        if (!self.options.events.delayedit) {
                            self.edit(event);
                        }
                        else {
                            self.handlers.edit.timeout = setTimeout(function() {
                                self.edit(event);
                            }, self.options.events.delayedit);
                        }
                    },
                    cancel: function() {
                        clearTimeout(self.handlers.edit.timeout);
                        self._trigger("canceledit", event, {
                            text: self.text,
                            preview: self.p,
                            element: self.element
                        });
                    }
                }
            };
        },
        enableEvents: function(edit) {
            var self = this;
            self.editmode = true;

            //store event handlers so that they can be unbound during cleanup
            self._initHandlers();
            self._listner(self.options.listeners.edit).bind(self.options.events.edit, self.handlers.edit.trigger);

            if (self.options.events.canceledit && self.options.events.delayedit) {
                self.handlers.edit.cancel = function() {
                    //cancel switch to edit mode
                    clearTimeout(self.handlers.edit.timeout);
                };
                self._listner(self.options.listeners.canceledit).bind(self.options.events.canceledit, self.handlers.edit.cancel);
            }

            self._listner(self.options.listeners.preview).bind(self.options.events.preview, self.handlers.preview.trigger);

            if (self.options.events.cancelpreview && self.options.events.delaypreview) {
                self.handlers.preview.cancel = function() {
                    //cancel switch to preview mode
                    clearTimeout(self.handlers.preview.timeout);
                };
                self._listner(self.options.listeners.cancelpreview).bind(self.options.events.cancelpreview, self.handlers.preview.cancel);
            }

            //mode to default to on enabling the events
            if (edit) {
                self.edit(false, true);
            }
            else {
                self.preview(false, true);
            }
            self.eventsEnabled = true;
        },
        disableEvents: function() {
            var self = this;
            self.element.unbind(self.options.events.preview, self.handlers.preview.trigger);
            if (self.handlers.preview.cancel) {
                self.element.unbind(self.options.events.cancelpreview, self.handlers.preview.cancel);
            }
            self.element.unbind(self.options.events.edit, self.handlers.edit.trigger);
            if (self.handlers.edit.cancel) {
                self.element.unbind(self.options.events.canceledit, self.handlers.edit.cancel);
            }
            self.eventsEnabled = false;
        },
        clear: function() {
            var self = this;
            self.element.data("toggleEdit-preview").remove();
            self.element.data("toggleEdit-preview", null);
            self.element.show();
        },
        destroy: function() {
            var self = this;
            self.clear();
            self.disableEvents();
            $.Widget.prototype.destroy.apply(self, arguments);
        }
    });
})(jQuery);