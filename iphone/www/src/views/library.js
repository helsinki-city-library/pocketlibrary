/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 $, Backbone, _, console
*/
(function() {
    "use strict";

    window.LibraryView = window.WorkListView.extend({
        el: '#library',
        collections: {
            recent: window.RecentWorkCollection,
            recommended: window.RecommendedWorkCollection,
            search_author: window.SearchAuthorWorkCollection,
            search_title: window.SearchTitleWorkCollection
        },

        events: $.extend({}, window.WorkListView.prototype.events, {
            "click .fetch-more": "fetchMoreResults"
        }),

        initialize: function() {
            window.WorkListView.prototype.initialize.call(this);
            this.previous_term = null;

            $('#search-bar')
                .bind('submit', function() {
                    $('#search-bar [type="search"]').blur();
                    return false;
                })
                .find('form [type="search"]').click(function(e) {
                    var d = $(this).width() - e.offsetX;
                    if (d < 24) {
                        $(this).val('');
                        window.SearchTitleWorkCollection.reset();
                        window.SearchAuthorWorkCollection.reset();
                    }
                }).blur(_.bind(this.doSearch, this));
        },

        doSearch: function(name) {
            var $search = $('#search-bar form [type="search"]'),
                term = $search.val();

            if (term === '') { return; }
            if (typeof name === 'object') { name = this.selectedCollectionName(); }

            if (this.previousTerm && this.previousTerm !== term) {
                window.SearchTitleWorkCollection.reset();
                window.SearchAuthorWorkCollection.reset();
            }

            this.$el.find('ul.' + name)
                    .find('li.empty, li.fetch-more, li.fetch-info').remove().end()
                    .append('<li class="fetch-info"></li>');

            this.collections[name].search(term);
            this.previousTerm = term;

            window.startAnimation("li.fetch-info");
        },

        changeSelectedMenuItem: function(name) {
            if (name === "recent" || name === "recommended") {
                $('body').removeClass('search-mode from-right');
                $('#search-bar')
                    .find('[type="search"]').attr('disabled', 'disabled').val('');
                
                this.$el
                    .find('.search-bar')
                        .find('.selected').removeClass('selected').end()
                        .find('[data-name="search_title"]').addClass('selected').end()
                    .end()
                    .find('ul.search_title, ul.search_author').empty();

                window.WorkListView.prototype.changeSelectedMenuItem.call(this, name);
            } else if (name === "search") {
                $('#search-bar [type="search"]').attr('disabled', null).val('');

                window.SearchTitleWorkCollection.reset();
                window.SearchAuthorWorkCollection.reset();

                _.defer(function() {
                    $('body').addClass('search-mode');
                });
                this.clearFetchQueue();
                this.resetCollectionStates();
            } else {
                var search_term = $('#search-bar form [type="search"]').val();
                this.$el.find('.search-bar')
                    .find('.selected').removeClass('selected').end()
                    .find('[data-name="' + name + '"]').addClass('selected');
                
                if (search_term !== '') {
                    this.doSearch(name);
                }
                return true;
            }
        },

        resetCollectionStates: function() {
            this.collections.search_author.resetEntries();
            this.collections.search_title.resetEntries();
        },

        showCollection: function(name) {
            if (name === "search") {
                name = "search_title";
            }

            window.WorkListView.prototype.showCollection.call(this, name);
        },

        isSearchMode: function() {
            var s = this.selectedCollectionName();
            return s === "search_author" || s === "search_title";
        },

        fetchMoreResults: function() {
            this.$el.find('.fetch-more').html(window.localization.messages.fetching());
            this.selectedCollection().more();
            return false;
        },

        render: function() {
            window.WorkListView.prototype.render.apply(this, arguments);

            var $list = this.$el.find('ul.' + this.selectedCollectionName()),
                c = this.selectedCollection();
            if (c.hasMorePages && c.hasMorePages()) {
                $list.append('<li class="fetch-more">' + window.localization.messages.fetchMore() + '</li>');
            }
        },

        fetchCollection: function(name) {
            if (!/search/.exec(name)) {
                window.WorkListView.prototype.fetchCollection.call(this, name);
            }
        }
    });
}());
