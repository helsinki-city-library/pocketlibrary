/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine, set
*/
describe("settings view", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("settings.html");

        window.iscroll = new iScroll("wrapper");
        this.user = new window.User();
        this.user.set({ card_number: 1234,
            first_name: "Etu",
            last_name: "Suku",
            payments: 12,
            items: null
            });
        this.settings = new window.SettingsView();
        this.settings.model = this.user;

        this.settings.render();
    });


    it("should contain a menu and user info", function() {
        expect($('#settings .mid-bar')).toExist();
        expect($('#settings .user-info')).toExist();
    });

    it("should contain right user info", function() {
        expect($("#settings a[href='#/settings']").html()).toBe("sinä");
        expect($("#settings .user_name").html()).toBe("Etu Suku");
        expect($("#settings .cardNum").html()).toBe("1234");
        expect($("#settings .payments").html()).toBe("12 €");
    });

    it("should show user info and not general info", function() {
        var userInfo = this.settings.$el.find('#user-info-content').css("display"),
            generalInfo = this.settings.$el.find('#general-info').css("display");
        
        expect(userInfo).toBe("block");
        expect(generalInfo).toBe("none");
    });

    it("should react to menu events", function() {
        this.settings.$el.find('.mid-bar a:nth-child(2)').click();

        expect($('#settings .mid-bar .selected').data('name')).toBe('general-info');
        
        var userInfo = this.settings.$el.find('#user-info-content').css("display"),
            generalInfo = this.settings.$el.find('#general-info').css("display");

        expect(userInfo).toBe("none");
        expect(generalInfo).toBe("block");
    });
    it("should logout when logout-button is pressed", function() {
        this.settings.$el.find('.logout a').click();

        expect(this.user.get("first_name")).toBe(null);
    });

});
