/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine, set, spyOn
*/

describe("marked view", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("marked.html");
        this.marked1 = new window.Work({
            title: "Tuhat aurinkoa",
            type: "book",
            library_id: "(FI-HELMET)b1700421",
            publication_year: 2012,
            publisher: "Kustantaja",
            author: "Tekijä"
        });
        this.marked2 = new window.Work({
            title: "Yksi aurinko",
            type: "book",
            library_id: "(FI-HELMET)b1700422",
            publication_year: 2011,
            publisher: "Kustantaja",
            author: "Toinen tekijä"
        });
        
        //this.markedCollection = new window.MarkedCollection([this.marked1, this.marked2]);
        this.markedView = new window.MarkedView();
    });

    it("should contain selected list  where marked are rendered", function() {
        expect($('#marked ul.selected')).toExist();
    });

    it("should load marked works from localStorage and show them correctly", function() {
        var self = this,
            localStorageSet_spy = spyOn(localStorage, "setItem").andCallFake(function(params) {
            
            }),
            localStorageGet_spy = spyOn(localStorage, "getItem").andCallFake(function(params) {
                var arr = [self.marked1, self.marked2];
                return JSON.stringify(arr);
            }),
            markedCollection = new window.MarkedCollection();
        this.markedView.collections = { marked: markedCollection };
        this.markedView.render();
        expect($("#marked ul.selected li .title").first()).toHaveText("Tuhat aurinkoa");
    });


});
