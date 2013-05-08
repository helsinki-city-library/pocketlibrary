/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  Backbone,console, $, _
*/

(function() {
    "use strict";
    window.SettingsView = Backbone.View.extend({
        el: '#settings',
        model: window.User,

        events: {
            'click .mid-bar a': 'menuSelectionChanged',
            'click .logout a': 'logoutUser',
            'click .show_bar_button': 'showBarcode',
            "touchstart a": "highlightItem",
            "touchmove a": "unHighlightItem",
            "touchcancel a": "unHighlightItem",
            "touchend a": "unHighlightItem"
        },

        highlightItem: function(e) {
            $(e.target).addClass('selected');
        },

        unHighlightItem: function(e) {
            $(e.target).removeClass('selected');
        },

        menuSelectionChanged: function(item) {
            item.preventDefault();
            var name = $(item.target).data('name');
            this.changeSelectedMenuItem.call(this, name);
            this.toggleSelected();
        },
        
        render: function() {
            if (!this.template) {
                this.template = _.template($('#settings-template').html());
            }
            $(this.el).html(this.template(this.model.toJSON()));

            this.toggleSelected();
        },

        changeSelectedMenuItem: function(name) {
            this.$el.find('.menu')
                .find('.selected').removeClass('selected').end()
                .find('[data-name="' + name + '"]').addClass('selected');
        },
        
        toggleSelected: function() {
            this.$el.find('.menu a')
                .each(function(i, e) {
                    var name = $(e).data("name");
                    $('#' + name).hide();
                    if ($(e).hasClass("selected")) {
                        $("#" + name).show();
                    }
                });
            this.trigger("module:rendered");
        },

        logoutUser: function(e) {
            this.model.logout();
            this.render();
            e.preventDefault();
        },

        showBarcode: function(e) {
            this.trigger("barcode:show");
            e.preventDefault();
        }
    });

}());
