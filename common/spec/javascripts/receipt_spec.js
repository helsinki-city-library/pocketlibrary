/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  describe, it, beforeEach, $, _, expect, spyOn, loadFixtures, moment, console
*/

describe("receipt view", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("receipt.html");

    });

    it("should be able to take on a collection of works", function() {
        this.receipt = new window.ReceiptView({
            model: new window.ReceiptModel({
                items: new window.WorkCollection()
            })
        });

        this.receipt.model.set("items", new window.WorkCollection([
            new window.Work({ library_id: "1", author: "McHarrison, Paul", short_title: "One sun", due_date: "24/03/2012" }),
            new window.Work({ library_id: "2", author: "George, Michael", short_title: "Two suns", due_date: "24/03/2012" }),
            new window.Work({ library_id: "3", author: "Best, Pete", short_title: "Three suns", due_date: "24/03/2012" })
        ]));

        this.receipt.render();

        var $receipt = $('#receipt .content');

        expect($receipt.find('header h2')).toHaveText(moment().format("DD.MM.YYYY HH:MM"));
        expect($receipt.find('ul').children().length).toBe(3);
        expect($receipt.find('ul li h1').first()).toHaveText("One sun");
        expect($receipt.find('ul li .due-date').first()).toHaveText("24/03/2012");
    });
});
