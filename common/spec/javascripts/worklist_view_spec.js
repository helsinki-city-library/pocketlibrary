/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine, set
*/
describe("work list view", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("work_list.html");

        window.LoanWorkCollection.reset([
            new window.Work({ library_id: "1", author: "Best, Pete" }),
            new window.Work({ library_id: "2", author: "McHarrison, Paul" }),
            new window.Work({ library_id: "3", author: "George, Michael" })
        ]);

        window.ReservedWorkCollection.reset([
            new window.Work({ library_id: "1", author: "York, New" }),
            new window.Work({ library_id: "2", author: "Tulip, Helen" }),
            new window.Work({ library_id: "3", author: "Riemann, Bernhard" })
        ]);

        var OwnStuff = window.WorkListView.extend({
            el: "#own-stuff",
            collections: {
                loans: window.LoanWorkCollection,
                history: window.HistoryWorkCollection,
                reserved: window.ReservedWorkCollection
            }
        });

        this.ownStuff = new OwnStuff();
    });

    it("should contain a menu and a bunch of work collections", function() {
        expect($('#own-stuff .mid-bar')).toExist();
        expect($('#own-stuff ul.history')).toExist();
    });

    it("should react to menu events", function() {
        this.ownStuff.$el.find('.mid-bar a:nth-child(2)').click();
        this.ownStuff.render();

        window.ReservedWorkCollection.add(
            new window.Work({ author: "Newman, John" })
        );

        expect($('#own-stuff .mid-bar .selected').data('name')).toBe('reserved');
        expect($('#own-stuff ul.selected').data('name')).toBe('reserved');
        expect($('#own-stuff ul.selected').children().length).toBe(4);
    });

    it("should give me an event when I select a work", function() {
        var s = spyOn(this.ownStuff, 'trigger').andCallFake(function(event, item) {
            expect(event).toMatch(/(work:selected)|(module:rendered)/);
            if (item) {
                expect(item.get("author")).toBe("Best, Pete");
            }
        });

        this.ownStuff.render();
        $('#own-stuff ul.selected .work').first().click();

        expect(s).toHaveBeenCalled();
    });
    it("should give me an event when I delete a work", function() {
        var s = spyOn(this.ownStuff, 'trigger');

        this.ownStuff.render();
        $('#own-stuff ul.selected .work .delete').show();
        $('#own-stuff ul.selected .work .delete').first().click();

        expect(s).toHaveBeenCalled();
    });
});
