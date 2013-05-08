/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  Backbone, console, $, $el, confirm, alert, moment, _, FB
*/

(function() {
    "use strict";
    window.WorkView = Backbone.View.extend({
        el: '#work',
        model: window.Work,

        events: {
            'click .renew-loan': 'renewLoan',
            'click .add-pin': 'addPin',
            'click .reserve-book': 'reserveBook',
            'click .fb-like': 'fbLike',
            "touchstart a": "highlightItem",
            "touchmove a": "unHighlightItem",
            "touchcancel a": "unHighlightItem",
            "touchend a": "unHighlightItem"
        },

        highlightItem: function(e) {
            $(e.target).addClass('selected');
        },

        unHighlightItem: function(e) {
            $(e.target).removeClass('selected');
        },

        initialize: function() {
            this.jqXHR = undefined;
        },

        addPin: _.debounce(function(e) {
            var $marker = $('.marked-button'),
                $button = $('.add-pin'),
                $likeButton = $('.fb-like'),
                marker = $marker.offset(),
                button = $button.offset(),
                left = marker.left - button.left,
                top = marker.top - button.top,
                right = $('#work .work_actions').width() - ($('.fb-like').width() + 21);
            $button.css({
                webkitTransform: 'translate3d(' + left + 'px, ' + top + 'px, 0)',
                width: $marker.width(),
                webkitTransition: 'all 0.3s ease-in',
                opacity: 0
            });
            $likeButton.css({
                webkitTransform: 'translate3d(-' + right + 'px, 0, 0)',
                webkitTransition: 'all 0.3s ease-in'
            });

            _.delay(function() {
                $button.hide();
            }, 300);

            this.trigger("book:mark", this.model);

            return false;
        }, 1000, true),
        
        postFbRecommendation: function() {
            FB.ui({
                method: 'feed',
                name: window.localization.messages.fbRecommendTitle(this.model),
                caption: window.localization.messages.fbRecommendCaption(this.model),
                description: window.localization.messages.fbRecommendDescription(this.model),
                link: this.model.getLibraryUrl(),
                picture: this.model.fbPictureUrl()
            }, function (response) {
                if (response && response.post_id) {
                    window.library.alert(window.localization.messages.fbRecommendationSuccessful());
                }
            });
        },

        fbLike: _.debounce(function(e) {
            var self = this;

            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    self.postFbRecommendation();
                } else {
                    FB.login(function(response) {
                        if (response.authResponse) {
                            self.postFbRecommendation();
                        }
                    }, {scope: 'publish_stream'});
                }
            });

            e.preventDefault();
            return false;
        }, 1000, true),

        renewLoan: _.debounce(function(e) {
            var self = this,
                onConfirm = function (button) {
                    if (button === window.localization.okButton) {
                        window.CurrentUser.on("book:renew", self.renewCompleted, self);
                        window.CurrentUser.on("book:renew:fail", self.renewFailed, self);
                        window.CurrentUser.renewBook(self.model.get("barcode"));
                        self.trigger("book:renew:started");
                    }
                };
            if (typeof navigator.notification !== "undefined") {
                navigator.notification.confirm(window.localization.messages.renewLoan(this.model), onConfirm, window.localization.messages.notificationTitle(), window.localization.messages.confirmButtonLabels());
            } else {
                if (confirm(window.localization.messages.renewLoan(this.model))) {
                    window.CurrentUser.on("book:renew", this.renewCompleted, this);
                    window.CurrentUser.on("book:renew:fail", this.renewFailed, this);
                    window.CurrentUser.renewBook(this.model.get("barcode"));
                    this.trigger("book:renew:started");
                }
            }
            e.preventDefault();
        }, 1000, true),

        renewCompleted: function(args) {
            if (args["due date"]) {
                this.model.set("due_date", moment(args["due date"], "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY"));
            } else {
                this.model.set("due_date", window.localization.messages.renewDueDateFailed());
            }
            this.trigger("book:renew:completed", this.model);
            window.CurrentUser.off("book:renew", this.renewCompleted);
        },

        renewFailed: function(args) {
            window.CurrentUser.off("book:renew:fail", this.renewFailed);
            this.model.set("due_date", window.localization.messages.renewFailed(args));
            this.model.set("status_important", "error");
            this.trigger("book:renew:completed", this.model);
        },

        reserveBook: _.debounce(function(e) {
            this.trigger("book:reserve", this.model);
            e.preventDefault();
        }, 1000, true),

        cancelFetch: function() {
            if (this.jqXHR) {
                this.jqXHR.abort();
            }
        },

        resetView: function() {
            this.$el.find(".work_info").html("");
            this.$el.find(".work_actions").html("");
        },

        render: function() {
            this.resetView();
            var self = this;
            this.jqXHR = this.model.fetchExtra(
                function() {
                    self.jqXHR = null;

                    var extraClasses = self.model.getExtraClasses();
                    if (extraClasses === "") {
                        self.$el.attr("class", "");
                    } else {
                        self.$el.addClass(self.model.getExtraClasses());
                    }
                    if (self.model.get('default_picture')) {
                        self.$el.addClass("default-picture");
                    }
                    if (!self.workTemplate) {
                        self.workTemplate = _.template($('#work-template').html());
                    }
                    $(self.el).find(".work_info").html(self.workTemplate(self.model.toJSON()));

                    if (!self.actionTemplate) {
                        self.actionTemplate = _.template($('#work-action-template').html());
                    }
                    $(self.el).find(".work_actions").html(self.actionTemplate(self.model.toJSON()));

                    if (self.model.get("title").length > 50) {
                        $(".work_info .work_header").css("font-size", "14px");
                    }

                    $(self.el).find('.work-picture img').bind('load', function() {
                        self.trigger("module:ready");
                        self.trigger("module:rendered");
                    });
                }
            );
        }
    });

}());
