/**
 * jquery.switchBtn.js v1.0
 * jQuery Switch Button
 * @author Cem Akpolat <cem.akpolat@gtarc.com>
 *
 * While building this widget, jquery.switchButton plugin is used as a base, however,
 * the new features and totally different appearence distinguish that from the base project.
 * this widget serves as a switch button, which is extremely customizable.
 *
 *@namespace
 */

(function($) {

    $.widget("gtarc.switchBtn", {

        options: {
            checked: undefined,			// State of the switch
            show_labels: false,			// Should we show the on and off labels?
            labels_placement: "left", 	// Position of the labels: "both", "left" or "right"
            label:"LABEL",
            label_class:'switch-button-label',
            label_on_class:'switch-button-label-on',
            label_off_class:'switch-button-label-off',

            alt_label:"Off",
            width: 25,					// Width of the button in pixels
            height: 12,					// Height of the button in pixels
            button_width: 12,			// Width of the sliding part in pixels
            clear: true,				// Should we insert a div with style="clear: both;" after the switch button?
            clear_after: null,		    // Override the element after which the clearing div should be inserted (null > right after the button)
            on_callback: undefined,		//callback function that will be executed after going to on state
            off_callback: undefined,		//callback function that will be executed after going to off state
            //backgrounds
            btn_bg_class:'switch-button-background',
            btn_bg_active_class:'bg-active ',
            btn_bg_non_active_class:'bg-nonactive',
            //buttons
            btn_icon:'icon-calendar',
            btn_icon_color_active:'#466587',
            btn_icon_color_non_active:'#CACCCD',
            btn_class:'switch-button-button ',
            btn_active_class:'btn-active',
            btn_non_active_class:'btn-nonactive'
        },

        _create: function() {
            // Init the switch from the checkbox if no state was specified on creation
            if (this.options.checked === undefined) {
                this.options.checked = this.element.prop("checked");
            }

            this._initLayout();
            this._initEvents();
        },

        _initLayout: function() {
            // Hide the receiver element
            this.element.hide(); // this means "<input>" element

            // Create our objects: two labels and the button
            this.label = $("<span>").addClass(this.options.label_class+'-'+this.options.labels_placement);
            this.button_bg = $("<div>").addClass(this.options.btn_bg_class);
            this.button = $("<div>").addClass(this.options.btn_class);

            // Insert the objects into the DOM
            this.button_bg.insertAfter(this.element);
            this.label.insertAfter(this.button_bg);

            this.button_bg.append(this.button);

            // Insert a clearing element after the specified element if needed
            if(this.options.clear)
            {
                if (this.options.clear_after === null) {
                    this.options.clear_after = this.label;
                }
                $("<div>").css({
                    clear: "left"
                }).insertAfter(this.options.clear_after);
            }



            bgStar =
                $('<div>',
                    {
                        'class' : this.options.btn_icon,
                        css:{
                            padding:'5px 3px 5px 3px',
                            color:'red',
                            background:'no-repeat'
                        }
                    }).appendTo(this.button);

            // Call refresh to update labels text and visibility
            this._refresh();

            // Init labels and switch state
            // This will animate all checked switches to the ON position when
            // loading... this is intentional!
            this.options.checked = !this.options.checked;
            this._toggleSwitch();
        },

        _refresh: function() {
            // Refresh labels display
            if (this.options.show_labels) {
                this.label.show();
            }
            else {
                this.label.hide();
            }

            // Refresh labels texts
            this.label.html(this.options.label);

            // Refresh button's dimensions
            this.button_bg.width(this.options.width);
            this.button_bg.height(this.options.height);
            this.button.width(this.options.button_width);
            this.button.height(this.options.height);

        },

        _initEvents: function() {
            var self = this;

            // Toggle switch when the switch is clicked
            this.button_bg.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                self._toggleSwitch();
                return false;
            });
            this.button.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                self._toggleSwitch();
                return false;
            });

            // Set switch value when clicking labels
            this.label.click(function(e) {
//                if (self.options.checked && self.options.labels_placement === "both") {
//                    return false;
//                }
                self._toggleSwitch();
                return false;
            });



        },

        _setOption: function(key, value) {
            if (key === "checked") {
                this._setChecked(value);
                return;
            }

            this.options[key] = value;
            this._refresh();
        },

        _setChecked: function(value) {
            if (value === this.options.checked) {
                return;
            }

            this.options.checked = !value;
            this._toggleSwitch();
        },

        _toggleSwitch: function() {
            this.options.checked = !this.options.checked;
            var newLeft = "";

            if (this.options.checked) {
                // Update the underlying checkbox state
               // console.debug(this.btn_icon,"checked");
                this.element.prop("checked", true);
                this.element.change();
                this.button_bg.parent().children('.trans').removeClass(this.options.label_off_class).addClass(this.options.label_on_class);

                var dLeft = this.options.width - this.options.button_width;

                newLeft = "+=" + dLeft;
                this.label.removeClass(this.options.label_off_class).addClass(this.options.label_on_class);
                this.button_bg.addClass("checked").removeClass(this.options.btn_bg_non_active_class).addClass(this.options.btn_bg_active_class);
                //this.button_bg.addClass("checked").switchClass(this.options.btn_bg_non_active_class,this.options.btn_bg_active_class, 400, "easeInOutCubic");

//                this.button.removeClass("btn-nonactive").addClass("btn-active");
                this.button.removeClass(this.options.btn_non_active_class).addClass(this.options.btn_active_class);
                this.button.children('.'+this.options.btn_icon).css({color:this.options.btn_icon_color_active});
                //execute on state callback if its supplied
                if(typeof this.options.on_callback === 'function') this.options.on_callback.call(this);
            }
            else {
               // console.debug(this.btn_icon,"unchecked");
                // Update the underlying checkbox state
                this.element.prop("checked", false);
                this.button_bg.parent().children ('.trans').removeClass(this.options.label_on_class).addClass(this.options.label_off_class);
                this.button.children('.'+this.options.btn_icon).css({color:this.options.btn_icon_color_non_active});
                this.element.change();
                newLeft = "0px";// newLeft = "-1px";

                this.label.removeClass(this.options.label_on_class).addClass(this.options.label_off_class);
                this.button_bg.addClass("checked").removeClass(this.options.btn_bg_active_class).addClass(this.options.btn_bg_non_active_class);


                //this.button.removeClass("btn-active").addClass("btn-nonactive");
                this.button.removeClass(this.options.btn_active_class).addClass(this.options.btn_non_active_class);

                //execute off state callback if its supplied
                if(typeof this.options.off_callback === 'function') this.options.off_callback.call(this);
            }
            // Animate the switch
            this.button.animate({ left: newLeft }, 250, "easeInOutCubic");
        }

    });

})(jQuery);
