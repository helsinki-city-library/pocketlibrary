/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 $, Backbone, _, console
*/
(function() {
    "use strict";

    window.UserBarcodeView = Backbone.View.extend({
        el: '#barcode',

        render: function() {
            var img = $('<img src="' + window.CurrentUser.get("barcode_url") + '" />'),
                self = this;

            img.bind('load', function() {
                self.trigger("module:rendered");
            });

            this.$el.find('.content').empty().append(img);
        }
    });
}());
