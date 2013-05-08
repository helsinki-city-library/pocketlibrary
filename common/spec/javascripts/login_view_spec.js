/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine
*/
describe("login", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("login.html");

        this.loginView = new window.LoginView();
        this.loginView.render();
    });

    it("should login when submitting the form", function() {
        var s = spyOn(window.CurrentUser, 'login').andCallFake(function() {
                window.CurrentUser.trigger("error:login");
                return { done: function() {
                    return { fail: function() {} };
                } };
            }),
            $form = $('#login-screen form.login_form');

        expect($form).toExist();
        $form
            .find('input[name="username"]').val('jc_libuser').end()
            .find('input[name="pin"]').val('1234');

        $form.submit();
        expect(s).toHaveBeenCalled();
    });

    it("should provide an error message when login fails", function() {
        var s = spyOn(window.CurrentUser, 'login').andCallFake(function() {
                window.CurrentUser.trigger("error:login");
                return { done: function() {
                    return { fail: function() {} };
                } };
            }),
            $form = $('#login-screen form.login_form');

        expect($form).toExist();
        $form
            .find('input[name="username"]').val('jc_libuser').end()
            .find('input[name="pin"]').val('1234');

        $form.submit();

        expect(s).toHaveBeenCalled();
        expect($('#login .error')).toBeVisible();
    });
});
