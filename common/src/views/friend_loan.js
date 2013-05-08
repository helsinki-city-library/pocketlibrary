/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  Backbone,console, $, _, $el, confirm, alert, device, moment
*/

(function() {
    "use strict";
    window.FriendLoanView = Backbone.View.extend({
        el: '#friend-loan',

        events: {
            'click .read-barcode a': 'readBarcode',
            'submit .barcode-input-form': 'blurForm',
            'blur .barcode-input': 'confirmPin',
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

        blurForm: function(e) {
            $('.barcode-input').blur();
            return false;
        },

        confirmPin: function(e, id) {
            var book_id = id || $('.barcode-input').val();
            if (book_id) {
                this.trigger("barcode:read", book_id);
            }
            $('.barcode-input').val('');
        },

        readBarcode: function(e) {
            var self = this,
                barcodeClassName;

            if (device.platform === 'android') {
                barcodeClassName = "com.phonegap.plugins.barcodescanner.BarcodeScanner";
            } else {
                barcodeClassName = "scannerOverlay";
            }

            window.plugins.barcodeScanner.scan(function(result) {
                if (result.cancelled) {
                    console.log("viivakoodin luku peruutettiin");
                } else {
                    self.confirmPin(null, result.text);
                }
            }, function(error) {
                window.library.alert(window.localization.messages.barcodeReadFailed(), function() {}, window.localization.messages.notificationTitle());
            }, barcodeClassName);

            e.preventDefault();
        },

        loanBook: function(e, id) {
            var book_id = id,
                userCollection = new window.WorkCollection(),
                self = this;

            window.CurrentUser.on("book:renew", this.loanCompleted, this);
            window.CurrentUser.on("book:renew:fail", this.loanFailed, this);
            userCollection.url = window.UserWorkCollection.prototype.baseUrl + book_id;
            userCollection.skipDueDates = true;

            userCollection.fetch().done(function(response) {
                if (Object.keys(response.records).length === 0) {
                    var error = new window.Work();
                    window.library.alert(window.localization.messages.friendLoanFailedBarcode(), function() {},
                        window.localization.messages.notificationTitle());
                }
            }).then(function(response) {
                self.attemptLoan(userCollection, book_id);
            });

            window.setTimeout(function() {
                if ($('#loader').hasClass("sent")) {
                    $('#loader').show();
                }
            }, 500);
            return false;
        },

        attemptLoan: function(userCollection, book_id) {
            if (!userCollection.models[0]) {
                return;
            }
            this.work = new window.Work(userCollection.models[0].toJSON());
            var self = this,
                onConfirm = function (button) {
                    if (button === true || button === window.localization.okButton) {
                        self.attemptLoan(userCollection, book_id);
                    } else {
                        self.trigger("book:friendloan:unconfirmed");
                    }
                };

            window.CurrentUser.loanBook(book_id).done(
                function (response) {
                    self.trigger("book:renew:started");
                }
            ).fail(function (response) {
                window.library.confirm(window.localization.messages.timeout_retry(),
                    onConfirm,
                    window.localization.messages.notificationTitle(),
                    window.localization.messages.confirmButtonLabels());
            });
        },
        
        loanCompleted: function(args) {
            window.CurrentUser.off("book:renew", this.loanCompleted);
            if (this.work) {
                if (args["due date"]) {
                    this.work.set("due_date", moment(args["due date"], "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY"));
                } else {
                    this.work.set("due_date", window.localization.messages.renewDueDateFailed());
                    this.work.set("status_important", "error");
                }
            }
            this.trigger("book:renew:completed", this.work);
        },
        
        loanFailed: function(args) {
            window.CurrentUser.off("book:renew:fail", this.loanFailed);
            if (this.work) {
                this.work.set("due_date", window.localization.messages.renewFailed(args));
                this.work.set("status_important", "error");
            }
            this.trigger("book:renew:completed", this.work);
        }

    });
}());
