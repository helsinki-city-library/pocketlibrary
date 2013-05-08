/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine
*/

describe("main_menu", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("main_menu.html");
        this.main_menuView = new window.MainMenuView();
    });

    it("should contain correct anchors", function() {
        expect($('a[href="#/own-stuff"]')).toExist();
        expect($('a[href="#/library"]')).toExist();
        expect($('a[href="#/friend-loan"]')).toExist();
        expect($('a[href="#/settings"]')).toExist();
    });

    it("should trigger click event if anchor is clicked", function() {
        var trigger_spy = spyOn(this.main_menuView, "trigger");
        $('a[href="#/own-stuff"]').click();
        expect(trigger_spy).toHaveBeenCalled();
    });

});
