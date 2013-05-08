/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine, set, spyOn
*/
describe("work view", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("work.html");

        var workModel = new window.Work(),
            deferred = new $.Deferred(),
            self = this,
            ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                if (parms.url === workModel.extraUrl("(FI-HELMET)b1700421")) {
                    parms.success({"type":"book","isbn":"9197489409","title":"Anna : Amerikan mummu","library_id":"(FI-HELMET)b1700421","library_url":"http://haku.helmet.fi/iii/encore/record/C__Rb1700421__Orightresult?lang=fin","author":"Korhonen, Nina","publisher":"Journal","year":"2004","author_details":[{"name":"O'Neill, Aisling","role":null}],"extent":["[102] s. :"],"description":[],"contents":[],"holdings":[{"location":"It\u00e4keskus adu","shelf":"756.1","status":"ON SHELF"},{"location":"Kallio adu","shelf":"756.1","status":"ON SHELF"},{"location":"Pasila adu","shelf":"756.1","status":"DUE","date":"2012-03-27"},{"location":"Tikkurila adu","shelf":"75.792 KOR","status":"ON SHELF"},{"location":"T\u00f6\u00f6l\u00f6 adu","shelf":"756.1","status":"ON SHELF"}]});
                } else if (parms.url ===  workModel.pictureUrl("9197489409")) {
                    var object = {'getResponseHeader' : function(key) { 
                            if(key === "Location") {
                                return "http://data.kirjavalitys.fi/data/gfx/def_pic.gif";
                            } else { return false; }
                        }
                    };
                    
                    parms.success("", 200, object);
                } else { // Renew loan mockup
                    parms.success({due_date: "1.1.2013"});
                }
                return deferred;
        });

        workModel.set({ barcode: 4321,
            title: "Tuhat aurinkoa",
            type: "book",
            library_id: "(FI-HELMET)b1700421",
            publication_year: 2012,
            publisher: "Kustantaja",
            author: "Tekijä"
            });

        this.work = new window.WorkView({model: workModel});
        this.work.render();
        deferred.resolve();
    });

    it("should contain work info and work actions", function() {
        expect($('#work .work_info')).toExist();
        expect($('#work .work_actions')).toExist();
    });

    it("should contain correct work info", function() {
        expect($('#work .work-title').html()).toBe("Tuhat aurinkoa");
        expect($('#work .work-author').html()).toBe("Tekijä");
        expect($('#work .work-publisher').html()).toBe("Kustantaja,");
        expect($('#work .work-year').html()).toBe("2012");
        expect($('#work .work-picture img').attr('src')).toBe("http://data.kirjavalitys.fi/data/gfx/def_pic.gif");
    });

    it("should contain corret info on work actions", function() {
        expect($('#work .holdings-header').html()).toBe("4 kappaletta hyllyssä:");
    });

    it("should react correctly when clicking renew loan", function() {
        var trigger_spy = spyOn(window.CurrentUser, 'trigger').andCallThrough(),
            confirm_spy = spyOn(window, "confirm").andCallFake(function() {
                return true;
            });
        
        this.work.$el.find(".work_actions a.renew-loan").click();
        
        expect(confirm_spy).toHaveBeenCalled();
        expect(trigger_spy).toHaveBeenCalled();
        
    });

    it("It should reset view when calling resetView", function() {
        this.work.resetView();
        expect($('#work .work_info').html()).toBe("");
        expect($('#work .work_actions').html()).toBe("");
    });
});
