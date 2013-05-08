/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  describe, it, beforeEach, $, _, expect, spyOn
*/
describe("lainari models", function() {
    "use strict";
    var verifyEach = function() {
        var a = _.toArray(arguments),
            verifier = a.shift(),
            args = a;
        return function() {
            var self = this;
            _.each(
                _.toArray(args),
                function(name) {
                    return verifier(name).call(self, name);
                }
            );
        };
    };

    describe("work entity", function() {
        var verifyExistence =  function(name) {
            return function() {
                expect(this.work.get(name)).toBeDefined("Failed to see " + name);
            };
        };

        beforeEach(function() {
            this.work = new window.Work();
        });

        it("should be defined", function() {
            expect(window.Work).toBeDefined();
        });

        it("should contain author", verifyExistence("author"));
        it("should contain title", verifyExistence("title"));
        it("should contain picture", verifyExistence("picture_url"));
        it("should contain type", verifyExistence("type"));
        it("should contain reservation status", verifyExistence("reservation_status"));
        it("should be able to save to favorites", verifyExistence("favorite"));
        it("should contain publication's year", verifyExistence("publication_year"));
        it("should contain ISBN", verifyExistence("isbn"));
        it("should contain library id", verifyExistence("library_id"));
        it("should contain holdings array", verifyExistence("holdings"));

        it("should be able to fetch extra info if library id is given", function() {
            this.work.set("library_id", "(FI-HELMET)b1700421");
            var deferred = new $.Deferred(),
                self = this,
                ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                    
                    if (parms.url === self.work.extraUrl("(FI-HELMET)b1700421")) {
                        parms.success({"type":"book","isbn":"9197489409","title":"Anna : Amerikan mummu","library_id":"(FI-HELMET)b1700421","library_url":"http://haku.helmet.fi/iii/encore/record/C__Rb1700421__Orightresult?lang=fin","author":"Korhonen, Nina","publisher":"Journal","year":"2004","author_details":[{"name":"O'Neill, Aisling","role":null}],"extent":["[102] s. :"],"description":[],"contents":[],"holdings":[{"location":"It\u00e4keskus adu","shelf":"756.1","status":"ON SHELF"},{"location":"Kallio adu","shelf":"756.1","status":"ON SHELF"},{"location":"Pasila adu","shelf":"756.1","status":"DUE","date":"2012-03-27"},{"location":"Tikkurila adu","shelf":"75.792 KOR","status":"ON SHELF"},{"location":"T\u00f6\u00f6l\u00f6 adu","shelf":"756.1","status":"ON SHELF"}]});
                        return $.Deferred();
                    } else if (parms.url ===  self.work.pictureUrl("9197489409")) {
                        var object = {'getResponseHeader' : function(key) { 
                                if(key === "Location") {
                                    return "http://data.kirjavalitys.fi/data/gfx/def_pic.gif";
                                } else { return false; }
                            }
                        };
                        
                        parms.success("", 200, object);
                    }
                    return deferred;    
                });
            this.work.fetchExtra();
            deferred.resolve();
            expect(this.work.get("isbn")).toBe("9197489409");
            expect(this.work.get("holdings")).toContain({"location":"Kallio adu","shelf":"756.1","status":"ON SHELF"});
            expect(this.work.get("picture_url")).toBe("http://data.kirjavalitys.fi/data/gfx/def_pic.gif");
            expect(this.work.get("holdings_count")).toBe(4);
            expect(this.work.get("holdings_word")).toBe("kappaletta");

        });

    });

    describe("user", function() {
        var verifyExistence =  function(name) {
            return function() {
                expect(this.user.get(name)).toBeDefined("Failed to see " + name);
            };
        };

        describe("user logged out entity", function() {
            beforeEach(function() {
                this.user = window.CurrentUser;
            });

            it("should be defined", function() {
                expect(window.User).toBeDefined();
            });

            it("should contain librarycard number", verifyExistence("card_number"));
            it("should contain pin-code as a function", function() {
                var callback = function(pin) {
                    expect(pin).toBe("1234");
                };

                this.user.pin(callback);
            });
            it("should contain first name and last name",
                verifyEach(verifyExistence, "first_name", "last_name"));

            it("should contain info about payments",
                verifyExistence("payments"));
            it("should be able to login", function() {
                var libraryCardNumber = 1234,
                    PIN = 1234,
                    lsSpy = spyOn(window.localStorage, 'setItem'),
                    spy = spyOn(this.user, 'trigger'),
                    ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                        expect(parms.url).toBe(window.CurrentUser.loginUrl(libraryCardNumber));

                        parms.success({"patron identifier": libraryCardNumber, "valid patron": true, "institution id": "kohalibrary", "recall items count": 0, "unavailable holds count": 0, "screen message": "Greetings from Koha. ", "valid patron password": true, "charged items count": 1, "home address": "6012 Library Rd.", "hold items count": 0, "overdue items count": 0, "transaction date": "2012-02-29T09:34:05", "language": { "id": 0, "name": "Unknown (default)" }, "home phone number": "(212) 555-1212", "patron status": [], "personal name": "Meikäläinen, Matti", "items": { "charged items": "30091038040906" }, "fee amount": [500, 2], "fine items count": 0 });
                        return $.Deferred();
                    });

                this.user.login(libraryCardNumber, PIN);

                expect(this.user.get("first_name")).toBe("Matti");
                expect(this.user.get("last_name")).toBe("Meikäläinen");

                expect(spy).toHaveBeenCalledWith('change:login');
                expect(ajax_spy).toHaveBeenCalled();
            });

            it("should store the credentials to local storage", function() {
                var libraryCardNumber = 1234,
                    PIN = 1234,
                    spy = spyOn(this.user, 'trigger'),
                    lsSpy = spyOn(window.localStorage, 'setItem'),
                    ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                        expect(parms.url).toBe(window.CurrentUser.loginUrl(libraryCardNumber));

                        parms.success({"patron identifier": libraryCardNumber, "valid patron": true, "institution id": "kohalibrary", "recall items count": 0, "unavailable holds count": 0, "screen message": "Greetings from Koha. ", "valid patron password": true, "charged items count": 1, "home address": "6012 Library Rd.", "hold items count": 0, "overdue items count": 0, "transaction date": "2012-02-29T09:34:05", "language": { "id": 0, "name": "Unknown (default)" }, "home phone number": "(212) 555-1212", "patron status": [], "personal name": "Meikäläinen, Matti", "items": { "charged items": "30091038040906" }, "fee amount": [500, 2], "fine items count": 0 });
                        return $.Deferred();
                    });

                this.user.login(libraryCardNumber, PIN);

                expect(this.user.get("first_name")).toBe("Matti");
                expect(this.user.get("last_name")).toBe("Meikäläinen");

                expect(spy).toHaveBeenCalledWith('change:login');
                expect(ajax_spy).toHaveBeenCalled();
                expect(lsSpy.callCount).toBe(2);
            });
        });

        describe("user logged in entity", function() {
            beforeEach(function() {
                this.user = window.CurrentUser;
                var libraryCardNumber = 1234,
                    PIN = 1234,
                    ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                        if (parms.url !== window.CurrentUser.loginUrl(libraryCardNumber) &&
                                parms.url !== window.LoanWorkCollection.constructUrl() &&
                                parms.url !== window.CurrentUser.bookStatusUrl("30091038040906") &&
                                parms.url !== "http://example.com" ) {
                            expect(true).toBe(false);
                        }

                        if (parms.beforeSend) {
                            parms.beforeSend({ 
                                setRequestHeader: function(key, value) { expect(key).toBe("Authorization"); } 
                            });
                        }

                        if (parms.url === window.CurrentUser.bookStatusUrl("30091038040906")) {
                            parms.success({ "due date": "2012-03-02", status: "Great!" });
                        } else {
                            parms.success({"patron identifier": libraryCardNumber, "valid patron": true, "institution id": "kohalibrary", "recall items count": 0, "unavailable holds count": 0, "screen message": "Greetings from Koha. ", "valid patron password": true, "charged items count": 1, "home address": "6012 Library Rd.", "hold items count": 0, "overdue items count": 0, "transaction date": "2012-02-29T09:34:05", "language": { "id": 0, "name": "Unknown (default)" }, "home phone number": "(212) 555-1212", "patron status": [], "personal name": "Meikäläinen, Matti", "items": { "charged items": "30091038040906" }, "fee amount": [ 500, 2 ], "fine items count": 0 });
                        }
                        return $.Deferred();
                    }),
                    lsSpy = spyOn(window.localStorage, 'setItem');

                this.user.login(libraryCardNumber, PIN);
            });

            it("should be able to logout", function() {
                this.user.logout();
                expect(this.user.get("first_name")).toBe(null);
                expect(this.user.get("last_name")).toBe(null);
            });

            it("should contain payments from server", function() {
                expect(this.user.get("payments")).toBe("5.00");
            });

            it("should be able to make generic requests with authorization", function() {
                var s = spyOn(this.user, 'makeAuthHeader').andCallThrough();
                var s2 = spyOn(this.user, 'injectHeader').andCallThrough();

                this.user.ajax({ url: "http://example.com", success: function() { } })

                expect(s).toHaveBeenCalled();
                expect(s2).toHaveBeenCalled(); 
            });

            it("should be possible to make requests about a book's due date", function() {
                this.user.getWorkInfo("30091038040906").done(function(response) {
                    expect(response.due_date).toBe('2012-03-02');
                });
            });
        });
    });

    describe("work collections", function() {

        describe("empty collection", function() {
            it("should not contain any works", function() {
                this.collection = new window.WorkCollection();
                expect(this.collection.length).toBe(0);
            });
            it("should be able to fetch all books with search by author", function() {
                this.collection = new window.WorkSearchAuthorCollection(null, "Riihimäki, Aapo");
                var self = this,
                    ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                    parms.success({"records":[{"type":"book","isbn":"9519362347","title":"Antip\u00e4\u00e4oma : apokalyptinen tutkielma","library_id":"(FI-HELMET)b1477944","library_url":"http://www.helmet.fi/record=b1477944~S9*eng","author":"Riihim\u00e4ki, Aapo","author_details":[],"extent":["101 s. ;"],"description":[],"contents":[]},{"type":"book","isbn":"9512013002","title":"KONSUMISTINEN MANIFESTI","library_id":"(FI-HELMET)b1477982","library_url":"http://www.helmet.fi/record=b1477982~S9*eng","author":"RIIHIM\u00c4KI, AAPO","author_details":[],"extent":[],"description":[],"contents":[]},{"type":"book","isbn":"9517960417","title":"Maallistumisen loppu ja uusi ihminen","library_id":"(FI-HELMET)b1478007","library_url":"http://www.helmet.fi/record=b1478007~S9*eng","author":"Riihim\u00e4ki, Aapo","author_details":[],"extent":["155 s. ;"],"description":[],"contents":[]},{"type":"book","isbn":"9517962797","title":"Vapautuksen ekonomiaa","library_id":"(FI-HELMET)b1478088","library_url":"http://www.helmet.fi/record=b1478088~S9*eng","author":"Riihim\u00e4ki, Aapo","author_details":[],"extent":["134 s. ;"],"description":[],"contents":[]},{"type":"book","isbn":"9517964307","title":"Eros ja talous : kohti historian loppuselvityst\u00e4","library_id":"(FI-HELMET)b1765966","library_url":"http://www.helmet.fi/record=b1765966~S9*eng","author":"Riihim\u00e4ki, Aapo","author_details":[],"extent":["160 s. ;"],"description":[],"contents":[]},{"type":"book","isbn":"9789524922289","title":"Nietzschen arvoitus : mit\u00e4 Nietzsche todella tarkoitti?","library_id":"(FI-HELMET)b1889817","library_url":"http://www.helmet.fi/record=b1889817~S9*eng","author":"Riihim\u00e4ki, Aapo","author_details":[],"extent":["238 s. ;"],"description":[],"contents":[]}],"current_page":1,"per_page":30,"total_entries":6});
                });
                var trigger_spy = spyOn(this.collection, "trigger").andCallThrough();
                this.collection.fetch();

                expect(trigger_spy).toHaveBeenCalled();
                expect(this.collection.length).toBe(6);
                var work0 = this.collection.at(0);
                var work5 = this.collection.at(5);

                expect(work0.get("type")).toBe("book");
                expect(work0.get("title")).toBe("Antipääoma : apokalyptinen tutkielma");

                expect(work5.get("type")).toBe("book");
                expect(work5.get("title")).toBe("Nietzschen arvoitus : mitä Nietzsche todella tarkoitti?");
            });
            it("should be able to fetch all books with search by title", function() {
                this.collection = new window.WorkSearchTitleCollection(null, "tuhat loistavaa aurinkoa");
                var self = this;
                var ajax_spy = spyOn( $, 'ajax' ).andCallFake(function(parms) {
                    parms.success({"records":[{"type":"book","isbn":"9789511222552","title":"Tuhat loistavaa aurinkoa","library_id":"(FI-HELMET)b1837972","library_url":"http://www.helmet.fi/record=b1837972~S9*eng","author":"Hosseini, Khaled","author_details":[{"name":"Savikurki, Kristiina","role":"(k\u00e4\u00e4nt.)"}],"extent":["399 s. ;"],"description":[],"contents":[]},{"type":"sound recording","isbn":"9789511227748","title":"Tuhat loistavaa aurinkoa","library_id":"(FI-HELMET)b1845008","library_url":"http://www.helmet.fi/record=b1845008~S9*eng","author":"Hosseini, Khaled","author_details":[{"name":"Savikurki, Kristiina","role":"(k\u00e4\u00e4nt.)"},{"name":"P\u00e4\u00e4kk\u00f6nen, Antti","role":"(esitt.)"}],"extent":["12 CD-\u00e4\u00e4nilevy\u00e4 (13 h 30 min)"],"description":[],"contents":[]},{"type":"book","isbn":"9789511236009","title":"Tuhat loistavaa aurinkoa","library_id":"(FI-HELMET)b1896653","library_url":"http://www.helmet.fi/record=b1896653~S9*eng","author":"Hosseini, Khaled","author_details":[{"name":"Savikurki, Kristiina","role":"(k\u00e4\u00e4nt.)"}],"extent":["399 s. ;"],"description":[],"contents":[]}],"current_page":1,"per_page":30,"total_entries":3});
                });
                var trigger_spy = spyOn( this.collection, "trigger").andCallThrough();
                this.collection.fetch();
                expect(trigger_spy).toHaveBeenCalled();
                expect(this.collection.length).toBe(3);
                var work0 = this.collection.at(0);
                var work1 = this.collection.at(1);

                expect(work0.get("type")).toBe("book");
                expect(work0.get("title")).toBe("Tuhat loistavaa aurinkoa");

                expect(work1.get("type")).toBe("sound recording");
                expect(work1.get("title")).toBe("Tuhat loistavaa aurinkoa");
            });
        });
    });
});
