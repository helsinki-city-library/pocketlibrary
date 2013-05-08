/*jslint
  browser: true, anon: true
*/
/*global
  Backbone,console
*/

(function() {
    "use strict";
    window.LoginView = Backbone.View.extend({
        el: '#login',
        model: window.CurrentUser,

        events: {
            "submit": "login"
        },

        username: function() {
            return this.$el.find('input[name="username"]').val();
        },

        pin: function() {
            return this.$el.find('input[name="pin"]').val();
        },

        login: function() {
            window.CurrentUser.login(this.username(), this.pin());
            return false;
        }
    });
}());
