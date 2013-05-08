/*jslint
  browser: true, anon: true
*/
/*global
 describe, expect, it, beforeEach, spyOn, $, loadFixtures, jasmine, set
*/
describe("barcode_confirm", function() {
    "use strict";

    beforeEach(function() {
        loadFixtures("barcode_confirm.html");

        var workModel = new window.Work(),
            ajax_spy = spyOn($, 'ajax').andCallFake(function(parms) {
                parms.success({"title identifier": "Tuhat loistavaa"});
            });

        workModel.set({ barcode: 1234 });
        window.device = { platform: "iPhone" };
        this.confirmView = new window.BarcodeConfirmView({model: workModel});
        this.confirmView.fetchBookInfo();
    });

    it("should contain correct elements", function() {
        expect($('#barcode-confirm p')).toExist();
        expect($('#barcode-confirm .barcode-pin-confirm-form')).toExist();
    });

    it("should fetch book title with barcode", function() {
        expect(this.confirmView.model.get("title")).toBe("Tuhat loistavaa");
    });

    it("should render book title correct", function() {
        expect($('#barcode-confirm p').html()).toBe("Olet lainaamassa kirjaa Tuhat loistavaa");
    });
    
    it("should react correctly when submitting pincode", function() {
        var trigger_spy = spyOn(this.confirmView, 'trigger'),
            storage_spy = spyOn(window.localStorage, 'getItem').andCallFake(function(item)
                {
                    if (item === "user:pin") {
                        return "1234";
                    } else {
                        return "-1";
                    }

                });

        $('.pin-input').attr("value", "1234");
        $('.barcode-pin-confirm-form').submit();
        expect(trigger_spy).toHaveBeenCalledWith("pin:correct", 1234);
    });

});
