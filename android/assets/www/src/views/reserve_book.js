/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 $, Backbone, _, console
*/
(function() {
    "use strict";

    window.ReserveBookView = Backbone.View.extend({
        events: {
            "click li": "selectLibrary",
            "touchstart li": "highlightItem",
            "touchmove li": "unHighlightItem",
            "touchcancel li": "unHighlightItem",
            "touchend li": "unHighlightItem"
        },
        el: '#reserve-book',
        model: window.ReservationLibrary,

        highlightItem: function(e) {
            $(e.target).addClass('selected');
        },

        unHighlightItem: function(e) {
            $(e.target).removeClass('selected');
        },

        selectLibrary: function(e) {
            var $library = $(e.target),
                self = this,
                onConfirm = function(button) {
                    if(button == window.localization.okButton) {
                        window.CurrentUser.reserveBook(self.model.get("library_id"), $library.data('id'));
                    }
                }

            navigator.notification.confirm(window.localization.messages.confirmReservation(this.model, $library.text()), onConfirm, window.localization.messages.notificationTitle(), window.localization.messages.confirmButtonLabels());
            e.preventDefault();
        },

        render: function() {
            if (!this.template) {
                this.template = _.template($('#reserve-book-template').html());
            }

            var self = this;
            this.model.availableBooksForReservation(function(libraries) {
                var $ul = self.$el.find('.content ul.selected');
                $ul.empty();

                self.$el.hide();
                _.each(libraries, function(library) {
                    $ul.append(self.template(library.toJSON()));
                });

                _.delay(function() {
                    self.$el.show();
                }, 1000);
            }, function(error) {
                self.trigger("book:reserve:list-error", error);
            });
        }
    });
}());

