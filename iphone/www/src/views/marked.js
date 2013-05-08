/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 Backbone, $, btoa, console, _, confirm, alert, MarkedWorkCollection
*/

(function() {
    "use strict";

    window.MarkedView = window.WorkListView.extend({
        el: '#marked',
        url: "markeds",
        collections: { marked: window.MarkedWorkCollection },

        render: function() {
            this.$el.find('ul').empty();
            window.WorkListView.prototype.render.apply(this, arguments);

            var self = this;
            _.defer(function() {
                self.$el.find('.delete').each(function(i, item) {
                    var h = $(item).parents('li').outerHeight();
                    $(item).css('top', (h - 48) / 2);
                });
            });
            if (window.MarkedWorkCollection.models.length === 0) {
                $('.marked-button').hide();
            } else {
                $('.marked-button').show();
            }
        }
    });


}());
