/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine, set, spyOn
*/
describe("friendloan view", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("friend_loan.html");
        this.user = window.CurrentUser;
        var libraryCardNumber = 1234,
            PIN = 1234,
            ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                parms.success({"patron identifier": libraryCardNumber, "valid patron": true, "institution id": "kohalibrary", "recall items count": 0, "unavailable holds count": 0, "screen message": "Greetings from Koha. ", "valid patron password": true, "charged items count": 1, "home address": "6012 Library Rd.", "hold items count": 0, "overdue items count": 0, "transaction date": "2012-02-29T09:34:05", "language": { "id": 0, "name": "Unknown (default)" }, "home phone number": "(212) 555-1212", "patron status": [], "personal name": "Matti Meikäläinen", "items": { "charged items": ["30091038040906", "30091037297085", "30091038524057" ]}, "fee amount": [ 500, 2 ], "fine items count": 0 });
                return $.Deferred();
            }),
            lsSpy = spyOn(window.localStorage, 'setItem');
                
        this.user.login(libraryCardNumber, PIN);
        this.removeAllSpies();

        window.device = { platform: 'iPhone' };

        this.friendView = new window.FriendLoanView();
    });

    it("should contain instructions and elements to start a friend loan", function() {
        expect($('#friend-loan .instructions')).toExist();
        expect($('#friend-loan .actions')).toExist();
        expect($('#friend-loan .read-barcode a')).toExist();
        expect($('#friend-loan .barcode-input-form input')).toExist();
    });

    it("should loan book when book id is given and form is submitted", function() {
        var oldFunc = window.WorkCollection.prototype.fetch,
            pin_spy = spyOn(this.friendView, 'trigger').andCallThrough(),
            ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                parms.success({"due date": null, "status": true });
            }),
            alert_spy = spyOn(window, "alert");

        window.WorkCollection.prototype.fetch = function() {
            this.models[0] = {toJSON: function() {} };
            this.trigger("change");

            return $.Deferred();
        };
        this.friendView.$el.find(".barcode-input").attr("value", "123456");
        this.friendView.$el.find(".barcode-input-form").submit();

        expect(pin_spy).toHaveBeenCalledWith("barcode:read", "123456");

        window.WorkCollection.prototype.fetch = oldFunc;

    });

    it("should loan book with readed id when using barcode scanner", function() {
        var loan_spy = spyOn(this.friendView, 'trigger').andCallThrough(),
            oldFunc = window.WorkCollection.prototype.fetch,
            ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                parms.success({"due date": null, "status": true });
            }),
            alert_spy = spyOn(window, "alert");
        window.plugins = { };
        window.plugins.barcodeScanner = {
            scan: function(success, error, options) {
                var result = {text: "12345"};
                success(result);
            }
        };

        window.WorkCollection.prototype.fetch = function() {
            this.models[0] = {toJSON: function() {} };
            this.trigger("change");

            return $.Deferred();
        };

        this.friendView.$el.find(".read-barcode a").click();
        
        expect(loan_spy).toHaveBeenCalledWith("barcode:read", "12345");

        window.WorkCollection.prototype.fetch = oldFunc;
    });
    
});
