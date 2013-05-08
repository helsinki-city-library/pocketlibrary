/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  Backbone,console, $, _
*/

(function() {
    "use strict";
    window.LoginView = Backbone.View.extend({
        el: '#login-screen',
        model: window.CurrentUser,

        events: {
            "submit .login_form": "login",
            "touchstart input": "highlightItem",
            "touchmove input": "unHighlightItem",
            "touchcancel input": "unHighlightItem",
            "touchend input": "unHighlightItem"
        },

        highlightItem: function(e) {
            $(e.target).addClass('selected');
        },

        unHighlightItem: function(e) {
            $(e.target).removeClass('selected');
        },

        initialize: function() {
            this.model.on("error:login", function(timeout) {
                if (!timeout) {
                    this.$el.find('.error').show();
                }
            }, this);
        },

        render: function() {
            if (!this.template) {
                this.template = _.template($('#login-screen-template').html());
            }

            var model = {
                card_number: window.localStorage.getItem("user:card_number") || "",
                pin: window.localStorage.getItem("user:pin") || ""
            };
            
            $(this.el).html(this.template(model));
            return this;
        },

        username: function() {
            return this.$el.find('input[name="username"]').val();
        },

        pin: function() {
            return this.$el.find('input[name="pin"]').val();
        },

        login: function() {
            this.$el.find('.error').hide();
            var $submit = this.$el.find('input[type="submit"]'),
                reset = function() { $submit.val(window.localization.messages.logIn()).attr('disabled', null); };

            $submit.attr('disabled', 'disabled').val(window.localization.messages.wait());

            window.CurrentUser.login(this.username(), this.pin())
                .done(reset)
                .fail(reset);

            return false;
        }
    });

    var onResize = function() {
        $('#login-screen').css({ height: $(window).height() });
    };
    $(window).bind('resize', onResize);
    $(function() {
        onResize();
    });
}());
