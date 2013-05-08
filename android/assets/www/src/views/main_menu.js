/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  Backbone,console, $, _
*/

$(function() {
    "use strict";
    window.MainMenuView = Backbone.View.extend({
        el: '#main-menu',

        events: {
            "click a": "itemSelected",
            "touchstart a": "highlightItem",
            "touchmove a": "unHighlightItem",
            "touchcancel a": "unHighlightItem"
        },

        highlightItem: function(e) {
            $(e.target).addClass('selected');
        },

        unHighlightItem: function(e) {
            $(e.target).removeClass('selected');
        },

        itemSelected: function(e) {
            e.preventDefault();
            this.trigger("item:selected", $(e.target).data('name'));
        }
    });
});
