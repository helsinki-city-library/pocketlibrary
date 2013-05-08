/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 Backbone, $, btoa, console, _, confirm, alert
*/
(function() {
    "use strict";

    window.OwnStuffView = window.WorkListView.extend({
        el: '#own-stuff',
        collections: {
            loans: window.LoanWorkCollection,
            reserved: window.ReservedWorkCollection,
            history: window.HistoryWorkCollection
        },

        events: $.extend({}, window.WorkListView.prototype.events, {
            "click .renew-all": "renewAllBooks",
            "touchstart a": "highlightItem",
            "touchmove a": "unHighlightItem",
            "touchcancel a": "unHighlightItem",
            "touchend a": "unHighlightItem"
        }),

        highlightItem: function(e) {
            $(e.target).addClass('selected');
        },

        unHighlightItem: function(e) {
            $(e.target).removeClass('selected');
        },

        renewAllBooks: _.debounce(function(e) {
            var onConfirm = function (button) {
                if (button === window.localization.okButton) {
                    window.CurrentUser.renewAllBooks();
                }
            };
            window.library.confirm(window.localization.messages.renewAllBooksConfirmation(), onConfirm, window.localization.messages.notificationTitle(), window.localization.messages.confirmButtonLabels());

            e.preventDefault();
            return false;
        }, 1000, true),

        render: function() {
            var openInBrowser = function(link) {
                if (typeof device !== "undefined" && device.platform === "android") {
                    if (navigator && navigator.app) {
                        navigator.app.loadUrl(link, {openExternal: true});
                    }
                } else {
                    window.open(link, '_blank', 'location=yes');
                }
            }
            window.WorkListView.prototype.render.call(this);

            if (this.selectedCollectionName() === 'loans' && this.selectedCollection().models.length > 0) {
                $('.renew-all').css({ display: 'block' });
            } else {
                $('.renew-all').css({ display: 'none' });
            }

            if (this.selectedCollectionName() === 'reserved') {
                var $list = this.$el.find('ul.reserved'),
                    $listElement = $('<li class="reservation-info">' + window.localization.messages.reservationInfoText() + '</li>');

                $list.append($listElement);
                // Open link in browser instead of this webview
                $listElement.find('a').click(_.debounce(function(e) {
                    openInBrowser(e.target.href);
                    e.preventDefault();
                    return false;
                }, 1000, true));
            }

            this.adjustHeight();
        },
        adjustHeight: function() {
            if(!this.$el.is(':visible')) {
                return;
            }

            if (!this.minHeight) {
                this.minHeight = parseInt(this.$el.find('ul.selected').css('minHeight'), 10);
            }

            if (this.selectedCollectionName() === 'loans' && $('.renew-all:visible').length) {
                this.$el.find('ul.selected').css('minHeight', this.minHeight - 56);
            } else {
                this.$el.find('ul.selected').css('minHeight', this.minHeight);
            }
        },

        showCollection: function() {
            window.WorkListView.prototype.showCollection.apply(this, arguments);
        }
    });
}());
