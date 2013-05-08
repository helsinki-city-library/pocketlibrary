/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
 Backbone, $, btoa, console, _, moment, device
*/
(function() {
    "use strict";
    window.Settings = {
        'LoansUrl': 'https://',
        'MetaDataUrl': 'http://',
        'ReservationsUrl': 'https://'
    };

    window.ReceiptModel = Backbone.Model.extend({
        defaults: function() {
            return {
                "current_date": moment().format("DD.MM.YYYY HH:MM"),
                "items": null
            };
        }
    });

    window.ReservationLibrary = Backbone.Model.extend({
        defaults: function() {
            return {
                "id": "",
                "name": ""
            };
        }
    });

    window.Work = Backbone.Model.extend({
        idAttribute: "library_id",
        defaults: function() {
            return {
                "author": null,
                "title": null,
                "picture_url": null,
                "type": null,
                "reservation_status": null,
                "favorite": false,
                "publication_year": 0,
                "isbn": 0,
                "publisher": null,
                "library_id": 0,
                "barcode": 0,
                "holdings": null,
                "status": "",
                "status_important": "",
                "short_title": "",
                "thumbnail_url": "",
                "extent": null,
                "hold_count": -1
            };
        },

        parse: function(item) {
            var self = this,
                retina = false,
                author = item.author ||
                    (item.author_details[0] && item.author_details[0].name.trim().replace(".", "").split(",").reverse().join(" ")) || "-",
                title = item.title.replace(/\s\/\s/, ' ').replace(/\s:\s/, ': ');

            return {
                barcode: item.code,
                title: title,
                short_title: _(title).truncate(24),
                isbn: item.isbn,
                type: item.type,
                extent: item.extent,
                hold_count: item.hold_count,
                library_id: item.library_id,
                publication_year: item.year,
                publisher: item.publisher,
                thumbnail_url: self.getDefaultPictureUrl(true, item.type, self.isRetina()),
                short_author: author ? _(author).truncate(30) : "",
                author: author,
                status: (function() {
                    var status;
                    if (item.code.length >= 13) {
                        window.CurrentUser.getWorkInfo(item.code).then(function(response) {
                            if(response.hasOwnProperty("due_date")) {
                                var due = moment(response.due_date, "YYYY-MM-DDTHH:mm:ss");
                                if (due.diff(moment(), 'days') <= 2) {
                                    self.set("status_important", "important", { silent: true });
                                }
                                self.set("status", window.localization.messages.dueDate(due));
                            } else {
                                self.set("status", response.status);
                            }
                        }).fail(function() {
                            self.set("status", window.localization.messages.error(), { silent: true });
                            self.set("status_important", "important");
                        });
                        status = window.localization.messages.fetching();
                        window.startAnimation('.status');
                    } else {
                        status = window.localization.messages.type(item.type, item.extent);
                    }

                    return status;
                }())
            };
        },

        extraUrl: function(id) {
            return window.Settings.MetaDataUrl + "/records/" + id + ".json";
        },

        barcodeUrl: function (barcode) {
            return window.Settings.MetaDataUrl + '/search/item.json?query[]=' + barcode;
        },

        pictureUrl: function(isbn) {
            return "http://" + isbn;
        },

        fbPictureUrl: function() {
            return this.get('default_picture') ? 
                'http://' : 
                this.pictureUrl(this.get('isbn')); 
        },

        getLibraryUrl: function() {
           var bIndex = this.get('library_id').indexOf('b'),
                id = this.get('library_id').substring(bIndex),
                titleEncoded = escape(this.get('title'));

            if (id.length > 0) {
                return "http://" + id;
            } else {
                return "http://" + titleEncoded;
            }
        },

        getDefaultPictureUrl: function(thumbnail, type, retina_disp) {
            var prefix = "img/", 
                big = "",
                url = "",
                retina = "";
            if (!thumbnail) {
                big = "_big";
            } 
            if (retina_disp) {
                retina = "@2x";
            }
            switch (type) {
            case "book":
                url = "book" + big + retina + ".png";
                break;
            case "film":
                url = "film" + big + retina + ".png";
                break;
            case "computer file":
            case "ebook":
                url = "ebook" + big + retina + ".png";
                break;
            case "periodical":
                url = "magazine" + big + retina + ".png";
                break;
            case "map":
                url = "map" + big + retina + ".png";
                break;
            case "sound recording":
            case "music recording":
                url = "music" + big + retina + ".png";
                break;
            case "sheet music":
                url = "note" + big + retina + ".png";
                break;
            case "www":
                url = "www" + big + retina + ".png";
                break;
            default:
                url = "other" + big + retina + ".png";
            }

            return prefix + url;
        },
        getDefaultPictureDimension: function(type, big) {
            var ret = { width: 0, height: 0 };
            if (big) {
                ret.width = 72;
                ret.height = 72;
            } else if (type === "book") {
                ret.width = 15;
                ret.height = 23;
            } else {
                ret.width = 24;
                ret.height = 24;
            }
            return ret;

        },
        isRetina: function() {
            return window.devicePixelRatio >= 2;
        },
        fetchExtra: function(success, error) {
            var self = this,
                jqXHR = null;

            var success_callback = function(response) {
                if (response === undefined) {
                    error();
                    return null;
                }
                
                var holdings = [];
                _.each(response.holdings, function(holding) {
                    holding.location = holding.location.replace(/\s(?:edu|adu|aik|las)/i, "");
                    if(_.filter(holdings, function(item) { return holding.location === item.location; }).length === 0) {
                        holdings.push(holding);
                    }
                });

                self.set("isbn", response.isbn, {silent: true});
                self.set("holdings", holdings, {silent: true});
                self.set("hold_count", response.hold_count, {silent: true});
                self.parseHoldings();
                self.fetchPicture().done(function() {
                    if (success) {
                        success();
                    }
                }).fail(function() {
                    self.set("picture_url", self.getDefaultPictureUrl(false, self.get("type"), self.isRetina()), { silent: true });
                    self.set("default_picture", true);
                    if (success) {
                        success();
                    }
                });
            };

            var url = null;
            var library_id = this.get("library_id");
            var barcode = this.get("barcode");

            if (library_id !== null && library_id !== 0) {
                url = this.extraUrl(library_id);
            }
            else if (barcode !== null && barcode !== 0) {
                url = this.barcodeUrl(barcode);
                var wrapped_function = success_callback;
                success_callback = function(response) {
                    wrapped_function(response['records'][barcode]);
                };
            }
            else {
                return jqXHR;
            }

            if (url !== null) {
                jqXHR = $.ajax({
                    url: url,
                    success: success_callback,
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(textStatus);
                        console.log(errorThrown);
                        if (error) {
                            error();
                        }
                    }
                });
                return jqXHR;
            }
            return jqXHR;
        },

        getExtraClasses: function() {
            var ret = "";
            if (!this.get("author")) {
                ret += " no-author";
            } 
            if (!this.get("title")) {
                ret += " no-title";
            }
            if (!this.get("publication_year")) {
                ret += " no-year";
            }
            if (!this.get("publisher")) {
                ret += " no-publisher";
            }
            return ret;
        },

        fetchPicture: function() {
            var self = this,
                dfd = $.Deferred(),
                response;

            if (this.get("isbn") !== null && this.get("type") === "book") {
                self.set('picture_url', self.pictureUrl(self.get("isbn")));
                $.get(self.pictureUrl(self.get("isbn")))
                    .done(function() {
                        dfd.resolve();
                    })
                    .fail(function() {
                        dfd.reject();
                    });

                response = dfd.promise();
            } else {
                self.set("picture_url", null);
                dfd.reject();
                response = dfd.promise();
            }

            return response;
        },

        parseHoldings: function() {
            if (this.get("holdings") !== null) {
                var count = 0,
                    holdingsContent = "";
                _.each(this.get("holdings"), function(item) {
                    if (item.status === "ON SHELF") {
                        count += 1;
                        holdingsContent += item.location + ", ";
                    }
                });
                this.set("holdings_count", count);
                if (count === 1) {
                    this.set("holdings_word", window.localization.messages.item());
                } else {
                    this.set("holdings_word", window.localization.messages.items());
                }
                // Remove last , from holdingsContent
                this.set("holdings_content", holdingsContent.slice(0, holdingsContent.lastIndexOf(",")));
            } else {
                // Set default values
                this.set("holdings_count", 0);
                this.set("holdings_word", window.localization.messages.items());
                this.set("holdings_content", "");
            }
        },

        availableBooksForReservation: function(success, error) {
            return window.CurrentUser.availableBooksForReservation(this.id, success, error);
        }
    });

    window.CodedWork = window.Work.extend({
        idAttribute: "barcode"
    });

    window.User = Backbone.Model.extend({
        defaults: function() {
            return {
                "card_number": null,
                "first_name": null,
                "last_name": null,
                "payments": 0.00,
                "items": null,
                "barcode_url": null
            };
        },
        pin: function(callback) {
            callback("1234");
        },
        initialize: function() {
            var card_number = window.localStorage.getItem("user:card_number"),
                pin = window.localStorage.getItem("user:pin");

            if (card_number && pin) {
                this.login(card_number, pin);
            }
        },

        getAppId: function() {
            return '';
        },

        getDeviceId: function () {
            if (typeof device !== "undefined") {
                return device.uuid;
            }
            return 'unknown';
        },

        getInstallationId: function () {
            // DeviceId doesn't always work on android, but
            // we need a way to identify an application instance
            // (doesn't need to be theoretically absolutely unique,
            //  Date.now is good enough.)
            var instId = window.localStorage.getItem("app:inst");
            if (instId === null) {
                instId = Date.now();
                window.localStorage.setItem("app:inst", instId);
            }
            return instId;
        },

        makeAuthHeader: function(user, pass) {
            if (!user && !pass) {
                user = this.get("card_number");
                pass = this.get("pin");
            } else {
                this.set("card_number", user, { silent: true });
                this.set("pin", pass, { silent: true });
            }

            var tok = user + ':' + pass,
                hash = btoa(tok);
            return "Basic " + hash;
        },

        baseUrl: function() { return; },
        barcodeUrl: function(card_number, size) { return window.Settings.MetaDataUrl + ":5000/barcode/" + card_number + "?size=" + size; },
        loginUrl: function(card_number) { return window.Settings.LoansUrl + '/patron/' + card_number; },
        refreshUserInfo: function() {
            return window.CurrentUser.setUserInfo(
                localStorage.getItem("user:card_number"),
                localStorage.getItem("user:pin"), true);
        },
        setUserInfo: function(card_number, pin, silent) {
            if (!silent) {
                silent = false;
            }
            var self = this,
                promise = $.ajax({
                    url: this.loginUrl(card_number),
                    cache: false,
                    timeout: 10000,
                    beforeSend: function(req) {
                        if (typeof device !== "undefined" && device.platform !== 'browser') {
                            req.setRequestHeader('DeviceId', self.getDeviceId());
                        }
                        req.setRequestHeader('AppInstId', self.getInstallationId());
                        req.setRequestHeader('AppId', self.getAppId());
                        req.setRequestHeader('Authorization', self.makeAuthHeader(card_number, pin));
                    },
                    success: function(response) {
                        var name = response["personal name"].split(',');
                        _.each(response.items, function(item, key) {
                            response.items[key] =
                                typeof item === 'string' ? [item] : item;
                        });

                        self.set({ card_number: card_number,
                            first_name: _(name[1]).trim(),
                            last_name: _(name[0]).trim(),
                            payments: (function() {
                                if (response["fee amount"]) {
                                    var n = parseFloat(response["fee amount"][0]) *
                                                Math.pow(10, -response["fee amount"][1]);
                                    return n.toFixed(2);
                                }
                                return 0.0;
                            }()),
                            items: response.items,
                            barcode_url: self.barcodeUrl(card_number, 's')}, {silent: silent});
                        window.localStorage.setItem("user:card_number", card_number);
                        window.localStorage.setItem("user:pin", pin);
                    }
                });
            return promise;
        },
        login: function(card_number, pin) {
            var promise = this.setUserInfo(card_number, pin),
                self = this;
            this.trigger('change:login');
            promise.fail(function(response) {
                console.log("Oh no. Ono: " + response.statusText);
                self.trigger("error:login", (response.statusText === 'timeout'));
            });
            return promise;
        },

        logout: function() {
            this.set(this.defaults());
            window.LoanWorkCollection.reset();
            window.ReservedWorkCollection.reset();
            window.HistoryWorkCollection.reset();
            window.localStorage.removeItem("user:card_number");
            window.localStorage.removeItem("user:pin");
            
            //Stop WakefulIntentService
            console.log("Stopping WakefulIntentService...");
            window.plugins.notificationService.stopservice(function(success){},
            		function(error){
            			alert("NotificationService error: " + error);
            });
        },

        injectHeader: function(before) {
            var self = this;
            return function(req) {
                if (typeof device !== "undefined" && device.platform !== 'browser') {
                    req.setRequestHeader('DeviceId', self.getDeviceId());
                }
                req.setRequestHeader('AppInstId', self.getInstallationId());
                req.setRequestHeader('AppId', self.getAppId());
                req.setRequestHeader('Authorization', self.makeAuthHeader());
                if (before) { before(req); }
            };
        },

        ajax: function(options) {
            var injectHeader = this.injectHeader(options.before),
                opts = $.extend({}, {
                    beforeSend: injectHeader
                }, options);

            return $.ajax(opts);
        },

        bookStatusUrl: function(book_id) {
            return window.Settings.LoansUrl + '/item/' + book_id;
        },

        renewUrl: function(book_id) {
            return window.Settings.LoansUrl + '/patron/' +
                this.get("card_number") + '/loan?item=' + book_id;
        },

        reserveLibraryListUrl: function(book_id) {
            return window.Settings.ReservationsUrl + "/patron/" 
                + this.get("card_number") + "/libraries?record=" + book_id;
        },

        reserveUrl: function(book_id, library_id) {
            return window.Settings.ReservationsUrl + "/patron/"
                + this.get("card_number") + "/hold?record=" + book_id + "&library=" + library_id;
        },

        renewBook: function(book_id) {
            return this.bookTransaction(book_id, "POST", false);
        },

        loanBook: function(book_id) {
            return this.bookTransaction(book_id, "PUT", true);
        },

        availableBooksForReservation: function(book_id, success, error) {
            var self = this;
            return self.ajax({
                url: self.reserveLibraryListUrl(book_id),
                dataType: "json",
                timeout: 10000,
                success: function(response) {
                    if(response.hasOwnProperty('error')) {
                        error();
                    } else {
                        var libraries = _.filter(_.map(response,
                            function(value, key) {
                                var library = new window.ReservationLibrary();
                                library.set({ id: key, name: value});
                                return library;
                            }), function(value) {
                                return value.id !== "zzzzz" && value.id !== "--";
                            }).sort(function(a, b) {
                                var an = a.get("name"), bn = b.get("name");
                                if (an < bn) { return -1; }
                                else if(an > bn) { return 1; }
                                else return 0;
                            });
                        success(libraries);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if (error) {
                        error();
                    }
                }
            });
        },

        reserveBook: function(book_id, from_library) {
            var self = this;
            this.trigger("book:reserve:started");
            return self.ajax({
                url: this.reserveUrl(book_id, from_library),
                type: 'PUT',
                dataType: 'json',
                success: function(response) {
                    var response_args = $.extend({}, {book_id: book_id, library_id: from_library}, response);
                    if(response.ok) {
                        self.trigger('book:reserve:complete', response_args);
                    } else {
                        self.trigger('book:reserve:fail', response_args);
                    }
                },
                error: function(response) {
                    var response_args = $.extend({}, {book_id: book_id, library_id: from_library}, response);
                    self.trigger('book:reserve:fail', response_args);
                }
            });
        },

        bookTransaction: function(book_id, method, suppressErrors) {
            var self = this;
            return this.ajax({
                url: this.renewUrl(book_id),
                type: method,
                dataType: "json",
                suppressErrors: suppressErrors,
                success: function(response) {
                    var response_args = $.extend({}, {book_id: book_id}, response);
                    self.trigger("book:renew", response_args);
                },
                error: function(response) {
                    var response_args = $.extend({}, {book_id: book_id}, response);
                    self.trigger("book:renew:fail", response_args);
                }
            });
        },
        
        renewAllBooks: function() {
            var self = this,
                triggered = false,
                items = this.get("items"),
                statuses = {},
                num_left = (items["charged items"] || []).length - 1,
                finish = function(item, response) {
                    statuses[item] =
                        window.LoanWorkCollection.filter(
                            function(v) {
                                return v.get("barcode") === item;
                            }
                        )[0];

                    if (statuses[item]) {
                        if (response.hasOwnProperty("status") && response.status !== 200) {
                            statuses[item].set("due_date", window.localization.messages.renewFailed(), { silent: true });
                            statuses[item].set("status_important", "error");
                        } else {
                            if (response.hasOwnProperty("ok") && response["ok"]) {
                                statuses[item].set("due_date", moment(response["due date"], "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY"));
                            }
                            else {
                                statuses[item].set("due_date", window.localization.messages.renewFailed(), { silent: true });
                                statuses[item].set("status_important", "error");
                            }
                        }
                    } else {
                        delete statuses[item];
                    }

                    if (num_left <= 0) {
                        self.trigger("book:renew-all:completed", statuses);
                    }

                    num_left -= 1;
                };

            if (items.hasOwnProperty("charged items")) {
                _.each(items["charged items"], function(item) {
                    var promise = self.renewBook(item);
                        if (!triggered) {
                            self.trigger("book:renew-all:started");
                            triggered = true;
                        }
                        promise
                            .done(_.bind(finish, self, item))
                            .fail(_.bind(finish, self, item));

                });
            }
        },

        getWorkInfo: function(book_id) {
            var self = this,
                dfd = $.Deferred();
            this.ajax({
                url: this.bookStatusUrl(book_id),
                success: function(response) {
                    var status = response["circulation status"].id,
                        args = {title: response["title identifier"], book_id: book_id, status: response.status};
                    switch(status) {
                    case 4: // charged
                        args = $.extend(args, { due_date: response['due date'] });
                        break;
                    case 8: // waiting for pickup
                        args = $.extend(args, { status: window.localization.messages.waitingForPickup() + ": " + moment(response["hold pickup date"], "YYYY-MM-DDTHH:mm:ss").format("DD.MM.YYYY")});
                        break;
                    case 10: // in transit
                        args = $.extend(args, { status: window.localization.messages.itemInTransit() });
                        break;
                    }
                    dfd.resolve(args);
                },
                error: function(response) {
                    dfd.reject(response);
                }
            });
            return dfd.promise();
        },

        addNewItem: function(barcode) {
            this.get("items")["charged items"].push(barcode);
        }

    });

    window.WorkCollection = Backbone.Collection.extend({
        model: window.Work,
        parse: function(response) {
            var self = this;
            return _.map(response.records, function(value, key) {
                return $.extend({}, value, { code: key, due_date: (self.skipDueDates ? 'skippin' : null) });
            });
        },
        fetch: function(options) {
            var response;

            if (this.url) {
                console.log("Fetching " + this.url);
                response = Backbone.Collection.prototype.fetch.call(this, $.extend({}, options, { parse: true }));
            } else {
                response = $.Deferred().reject().promise();
            }

            return response;
        }
    });

    window.WorkSearchCollection = window.WorkCollection.extend({
        initialize: function(models, term) {
            if (term) {
                this.url = this.baseUrl + term;
            }
        },
        search: function(term) {
            if (term && term !== '') {
                window.GA.trackEventWithCategory("book", "search", term);
                this.url = this.baseUrl + term;
                this.fetch();
            }
        },
        more: function() {
            if (this.has_more_pages) {
                this.fetch({ data: { page: this.current_page + 1 }, add: true });
            }
        },
        sync: function(method, model, options) {
            options.dataType = "jsonp";
            return Backbone.sync(method, model, options);
        },
        hasMorePages: function() {
            return this.has_more_pages;
        },
        parse: function(response) {
            this.total_entries = response.total_entries;
            this.current_page = response.current_page;
            this.has_more_pages = (this.current_page * response.per_page < this.total_entries);

            return window.WorkCollection.prototype.parse.apply(this, arguments);
        },
        resetEntries: function() {
            this.total_entries = 0;
            this.current_page = 0;
            this.has_more_pages = false;
        }
    });

    window.WorkSearchAuthorCollection = window.WorkSearchCollection.extend({
        baseUrl: window.Settings.MetaDataUrl + '/search/author.json?query='
    });

    window.WorkSearchTitleCollection = window.WorkSearchCollection.extend({
        baseUrl: window.Settings.MetaDataUrl + '/search/title.json?query='
    });

    window.UserWorkCollection = window.WorkCollection.extend({
        model: window.CodedWork,
        initialize: function(models, options) {
            this.key = options.key;
            window.CurrentUser.on("change:items", this.onItemsChanged, this);
        },

        onItemsChanged: function(response) {
            this.url = this.constructUrl();
        },

        constructUrl: function() {
            var items = window.CurrentUser.get("items"),
                url = this.baseUrl;

            if (items && items.hasOwnProperty(this.key)) {
                url += items[this.key].join("&query[]=");
                return url;
            }
            return null;
        },

        baseUrl: window.Settings.MetaDataUrl + '/search/item.json?query[]='
    });

    window.MarkedCollection = window.WorkCollection.extend({
        url: "markeds",
        initialize: function(models, options) {
            this.fetch();
        },
        sync: function(method, model, options) {
            switch (method) {
            case "read":
                var fromStorage = localStorage.getItem("marked"),
                    retData = "",
                    deferred = $.Deferred();
                if (fromStorage !== null) {
                    retData = { "records": JSON.parse(fromStorage) };
                } else {
                    retData = { "records": null };
                }
                if (retData) {
                    options.success(retData);
                    deferred.resolve();
                } else {
                    options.error("Marked books not found");
                    deferred.reject();
                }
                return deferred;
            }
        },
        save: function() {
            localStorage.setItem("marked", JSON.stringify(this.models));
        }
    });


    window.CurrentUser = new window.User();

    window.LoanWorkCollection = new window.UserWorkCollection(null, { key: "charged items" });
    window.ReservedWorkCollection = new window.UserWorkCollection(null, { key: "hold items" });
    window.HistoryWorkCollection = new window.WorkCollection();
    window.MarkedWorkCollection = new window.MarkedCollection();

    window.RecentWorkCollection = new window.WorkCollection();
    window.RecentWorkCollection.url = window.Settings.MetaDataUrl + "/records.json/?page=001";
    window.RecommendedWorkCollection = new window.WorkCollection();
    window.RecommendedWorkCollection.url = window.Settings.MetaDataUrl + "/lists/recommendations.json";
    window.SearchAuthorWorkCollection = new window.WorkSearchAuthorCollection();
    window.SearchTitleWorkCollection = new window.WorkSearchTitleCollection();

}());

