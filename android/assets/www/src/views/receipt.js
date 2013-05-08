/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 $, Backbone, _, console
*/
(function() {
    "use strict";

    window.ReceiptView = Backbone.View.extend({
        el: '#receipt',
        initialize: function() {
            if (!this.model) {
                this.model = new window.ReceiptModel();
            }

            this.model.on('change', function() {
                console.log("Model changed. Rendering.");
                this.render();
            }, this);
        },

        renderItems: function() {
            var $list = this.$el.find('ul');

            $list.empty();
            this.model.get("items").each(function(item) {
                var v = new window.ReceiptItemView({model : item});
                $list.append(v.render().el);
            });
        },

        render: function() {
            if (!this.template) {
                this.template = _.template($('#receipt-view-template').html());
            }

            this.$el.find('.content').empty().append(this.template(this.model.toJSON()));

            if (this.model.get("items").length > 0) {
                this.renderItems();
            }

            this.trigger("module:rendered");
        }
    });

    window.ReceiptItemView = Backbone.View.extend({
        tagName: 'li',
        render: function() {
            if (!this.template) {
                this.template = _.template($('#receipt-item-template').html());
            }
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });
}());
