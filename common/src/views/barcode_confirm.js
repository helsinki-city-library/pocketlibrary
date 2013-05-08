/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 $, Backbone, _, console, $el, device
*/

(function() {
    "use strict";
    window.BarcodeConfirmView = Backbone.View.extend({
        el: '#barcode-confirm',
        model: window.Work,

        events: {
            'submit .barcode-pin-confirm-form': 'blurForm',
            'blur .pin-input': 'confirmPin'
        },

        blurForm: function(e) {
            $('.pin-input').blur();
            return false;
        },

        confirmPin: function(e) {
            var pin = $('.pin-input').attr("value");
            if (localStorage.getItem("user:pin") === pin) {
                this.trigger("pin:correct", this.model.get("barcode"));
            } else {
                this.trigger("pin:wrong");
            }
            $('.pin-input').val('');
        },

        fetchBookInfo: function() {
            var self = this;
            this.model.fetchExtra(
                null,
                function () {console.log('error fetching extra work info');}).then(
                    function () {
                        window.CurrentUser.getWorkInfo(self.model.get("barcode")).done(function(response) {
                            self.model.set("title", response.title);
                        }).fail(function() {
                            self.model.set("title", "");
                        }).always(function() {
                            self.render();
                        });
                    }
                );
        },


        render: function(canceled) {
            if (!this.barcodeConfirmTemplate) {
                this.barcodeConfirmTemplate =
                    _.template($('#barcode-confirm-template').html());
            }
            if (!this.friendLoanUnavailableTemplate) {
                this.friendLoanUnavailableTemplate =
                    _.template($('#exceptional-situation-template').html());
            }

            var hold_count = this.model.get("hold_count"),
                title = this.model.get("title"),
                messages = window.localization.messages;

            if (hold_count > 0) {
                $(this.el).html(
                    this.friendLoanUnavailableTemplate({
                        messages: [
                            messages.friendloanHoldRestriction(),
                            messages.holdCount(hold_count, title)
                        ]}));
            }
            else if (title === "") {
                    $(this.el).html(
                        this.friendLoanUnavailableTemplate({
                            messages: [messages.friendloanFail()]}));
            } else if (canceled === true) {
                $(this.el).html(
                    this.friendLoanUnavailableTemplate({
                        messages: [
                            messages.friendloanUnconfirmed()
                        ]
                    }));

            }
            else {
                $(this.el).html(this.barcodeConfirmTemplate(this.model.toJSON()));
            }
        }

    });
}());
