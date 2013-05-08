/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  describe, it, beforeEach, $, _, expect, spyOn, console
*/

describe("user loan renewal", function() {
    "use strict";

    var ajaxSpy = function(response) {
        return function(parms) {
            parms.success(response);
            return $.Deferred(function(dfd) {
                dfd.resolve(response);
            }).promise();
        };
    };

    beforeEach(function() {
        this.user = window.CurrentUser;
        var libraryCardNumber = 1234,
            PIN = 1234,
            ajax_spy = spyOn($, 'ajax').andCallFake(ajaxSpy({"patron identifier": libraryCardNumber, "valid patron": true, "institution id": "kohalibrary", "recall items count": 0, "unavailable holds count": 0, "screen message": "Greetings from Koha. ", "valid patron password": true, "charged items count": 1, "home address": "6012 Library Rd.", "hold items count": 0, "overdue items count": 0, "transaction date": "2012-02-29T09:34:05", "language": { "id": 0, "name": "Unknown (default)" }, "home phone number": "(212) 555-1212", "patron status": [], "personal name": "Matti Meikäläinen", "items": { "charged items": ["30091038040906", "30091037297085", "30091038524057" ]}, "fee limit": [ 5, 0 ], "fine items count": 0 })),
            lsSpy = spyOn(window.localStorage, 'setItem');
                
        this.user.login(libraryCardNumber, PIN);
        this.removeAllSpies();
        window.LoanWorkCollection = new window.WorkCollection([
            new window.Work({
                library_id: "1",
                barcode: "30091038040906"
            }),
            new window.Work({
                library_id: "2",
                barcode: "30091037297085"
            }),
            new window.Work({
                library_id: "3",
                barcode: "30091038524057"
            })
        ]);
    });

    it("should be able to call auth header without params", function() {
        var header = this.user.makeAuthHeader();
        expect(header).toEqual("Basic MTIzNDoxMjM0");
    });

    it("should be possible to renew a book", function() {
        var book_id = "30091038040906",
            s = spyOn($, 'ajax').andCallFake(ajaxSpy({"status": true, "due date": "1.1.2013"})),
            t = spyOn(this.user, 'trigger'),
            trigger_args = {book_id: book_id, "status": true, "due date": "1.1.2013"};

        this.user.renewBook(book_id);
        expect(s).toHaveBeenCalled();
        expect(t).toHaveBeenCalledWith("book:renew", trigger_args);
    });

    it("should be possible to renew all books", function() {
        var s = spyOn($, 'ajax').andCallFake(ajaxSpy({"status": true, "due date": "1.1.2013"})),
            t = spyOn(this.user, 'trigger');

        this.user.renewAllBooks();

        expect(s.callCount).toEqual(3);
        expect(t.mostRecentCall.args[0]).toBe("book:renew-all:completed");
    });
});
