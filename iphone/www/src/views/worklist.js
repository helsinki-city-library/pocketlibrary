/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  Backbone,console, $, _, clearTimeout
*/

(function() {
    "use strict";

    var timer = 0;
    window.WorkCollectionItemView = Backbone.View.extend({
        tagName: "li",

        events: {
            "click .delete": "deleteItem",
            "click": "itemSelected",
            "touchstart": "touchStart",
            "touchend": "touchEnd",
            "touchmove": "touchMove"
        },

        setActive: function(e) {
            this.$el.addClass('active');
            timer = null;
        },

        touchStart: function(e) {
            timer = setTimeout(_.bind(this.setActive, this), 100);
        },
        touchMove: function(e) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        },
        touchEnd: function(e) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            this.$el.removeClass('active');
        },

        deleteItem: _.debounce(function(e) {
            this.trigger("work:deleted", e.currentTarget);
            e.preventDefault();
            return false;
        }, 1000, true),

        itemSelected: function(e) {
            this.trigger("work:selected", e.currentTarget);
            e.preventDefault();
            return false;
        },

        render: function() {
            if (!this.template) {
                this.template = _.template($('#work-item-template').html());
            }
            this.$el
                .html(this.template(this.model.toJSON()))
                .attr('data-type', this.model.get("type"))
                .attr('data-id', this.model.id)
                .addClass('work')
                .addClass(this.model.getExtraClasses());

            if (this.model.isRetina()) {
                var size = this.model.getDefaultPictureDimension(this.model.get("type"), false);
                this.$el.find("img").css("width", size.width).css("height", size.height);
            }

            return this;
        }
    });

    window.WorkListView = Backbone.View.extend({
        events: {
            'click .mid-bar a': 'menuSelectionChanged'
        },

        initialize: function() {
            var self = this;
            this.fetch_q = [];
            _.each(this.collections, function(c, key) {
                var cb = self.onCollectionChanged(key);
                c.on("change", cb, self);
                c.on("add", cb, self);
                c.on("remove", cb, self);
                c.on("reset", function(collection) {
                    this.fetched = false;
                    cb.call(this, collection);
                }, self);
            });
        },
        
        menuSelectionChanged: function(item) {
            var name = $(item.target).data('name');
            this.selectCollection(name);
            item.preventDefault();
        },

        selectCollection: function(name) {
            var skipRender = this.changeSelectedMenuItem(name);
            var self = this;
            window.CurrentUser.refreshUserInfo()
                .then(function() {
                    window.updateLoanUrl();
                    self.showCollection(name);
                    self.fetchCollection(name);
                    $('#loader').one('loadComplete', _.bind(function() {
                        self.render();
                    }, self));
                    if (!skipRender) { self.render(); }
                });
        },

        changeSelectedMenuItem: function(name) {
            this.$el.find('.menu')
                .find('.selected').removeClass('selected').end()
                .find('[data-name="' + name + '"]').addClass('selected');
        },

        showCollection: function(name) {
            this.$el
                .find('ul.selected').removeClass('selected').hide().end()
                .find('ul.' + name).addClass('selected').show();
        },

        selectedCollectionName: function() {
            return this.$el.find('ul.selected').data('name');
        },

        selectedCollection: function() {
            return this.collections[this.selectedCollectionName()] || [];
        },

        render: function(name) {
            var self = this,
                collection = this.collections[name] || this.selectedCollection(),
                collection_name = name || this.selectedCollectionName(),
                $list = this.$el.find('ul.' + collection_name),
                $listItem = $('<li class="empty"></li>'),
                topbarHeight = $('#top-bar').height(),
                midbarHeight = $('.mid-bar').height();

            $list.find(".empty, .fetch-info, .fetch-more").remove();

            if (collection.length === 0) {
                $list.empty();
                if ($('#loader').hasClass("sent")) {
                    $list.append($listItem);
                    window.startAnimation('#' + this.$el.attr('id') + ' li.empty');
                } else {
                    $list.append('<li class="empty">' + window.localization.messages.noWorks() + '</li>');
                }
            } else {
                $list.empty();
                collection.each(
                    function(item) {
                        var $item = $list.find('[data-id="' + item.id + '"]'),
                            view = new window.WorkCollectionItemView({ model: item }),
                            content = view.render().el;

                        if ($item.length === 0) {
                            $list.append(content);
                        } else {
                            $item.replaceWith(content);
                        }
                        view.on("work:selected", function(e) { self.trigger("work:selected", item); });
                        view.on("work:deleted", function(e) { self.trigger("work:deleted", item); });
                    }
                );
            }

            this.trigger("module:rendered");
        },

        onCollectionChanged: function(key) {
            return function(collection) {
                this.render(key);
            };
        },

        clearFetchQueue: function() {
            _.each(this.fetch_q, function(fetch) {
                fetch.abort();
            });
        },

        fetchCollection: function(name) {
            this.clearFetchQueue();
            var jqXHR = this.collections[name].fetch();
            if (jqXHR.hasOwnProperty('abort')) {
                this.fetch_q.push(jqXHR);
            }
            return jqXHR;
        }
    });
}());
