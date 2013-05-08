/*jslint
  browser: true, anon: true
*/
/*global
  describe, expect, it, beforeEach, spyOn, $
*/

(function() {
    "use strict";
    describe("orchestrator", function() {
        beforeEach(function() {
            this.callback = function(from, to) { return false; };
            this.orchestrator = new window.Orchestrator({
                "view_1:view_2": this.callback,
                "*:view_3": this.callback,
                "*:view_2": this.callback,
                "view_2:*": this.callback,
                "*:*": this.callback
            });
        });

        it("should contain the transitions it was instantiated", function() {
            expect(this.orchestrator.transitions).toBeDefined();
        });
        it("should call the appropriate method when making explicit transition call", function() {
            var s = spyOn(this.orchestrator.transitions, 'view_1:view_2').andCallThrough();
            this.orchestrator.transition("view_1", "view_2");
            expect(s).toHaveBeenCalledWith("view_1", "view_2");
        });
        it("should call the appropriate method when using wildcard in from", function() {
            var s = spyOn(this.orchestrator.transitions, '*:view_3').andCallThrough();
            this.orchestrator.transition("view_1", "view_3");
            expect(s).toHaveBeenCalledWith("view_1", "view_3");

            this.orchestrator.transition("view_8", "view_3");
            expect(s).toHaveBeenCalledWith("view_8", "view_3");
        });
        
        it("should call the appropriate method when using wildcard in to", function() {
            var s = spyOn(this.orchestrator.transitions, 'view_2:*').andCallThrough();
            this.orchestrator.transition("view_2", "view_6");
            expect(s).toHaveBeenCalledWith("view_2", "view_6");
            this.orchestrator.transition("view_2", "view_7");
            expect(s).toHaveBeenCalledWith("view_2", "view_7");
        });

        it("should call the appropriate method when using both from and to as wildcards", function() {
            var s = spyOn(this.orchestrator.transitions, '*:*').andCallThrough();
            this.orchestrator.transition("foo", "bar");
            expect(s).toHaveBeenCalledWith("foo", "bar");
            this.orchestrator.transition("feedbaf", "baz");
            expect(s).toHaveBeenCalledWith("feedbaf", "baz");
        });

        it("should call only the first appropriate transition method", function() {
            var generic_spy = spyOn(this.orchestrator.transitions, '*:*').andCallThrough(),
                left_spy = spyOn(this.orchestrator.transitions, '*:view_2').andCallThrough();

            this.orchestrator.transition("view_4", "view_2");
            expect(left_spy).toHaveBeenCalledWith("view_4", "view_2");
            expect(generic_spy).wasNotCalled();
        });

        it("should remember the previous transition", function() {
            this.orchestrator.transition("view_1", "view_2");

            expect(this.orchestrator.lastTransition()).toEqual(["view_1", "view_2"]);
        });

        it("should be possible to go back using a method", function() {
            var s = spyOn(this.orchestrator, 'transition').andCallThrough();

            this.orchestrator.transition("view_1", "view_2");
            this.orchestrator.transition("view_2", "view_4");
            this.orchestrator.transition("view_4", "view_5");
            this.orchestrator.back();

            expect(s).toHaveBeenCalledWith("view_5", "view_4", true);
            expect(this.orchestrator.lastTransition()).toEqual(["view_2", "view_4"]);
            s.reset();

            this.orchestrator.back();
            expect(s).toHaveBeenCalledWith("view_4", "view_2", true);
            expect(this.orchestrator.lastTransition()).toEqual(["view_1", "view_2"]);
            s.reset();

            this.orchestrator.back();
            expect(s).toHaveBeenCalledWith("view_2", "view_1", true);
            expect(this.orchestrator.lastTransition()).toEqual([]);

        });

        it("should be possible to go back multiple steps", function() {
            var s = spyOn(this.orchestrator, 'transition').andCallThrough();
            this.orchestrator.transition("view_1", "view_2");
            this.orchestrator.transition("view_2", "view_4");
            this.orchestrator.transition("view_4", "view_5");
            this.orchestrator.back(3);

            expect(s).toHaveBeenCalledWith("view_5", "view_1", true);
            expect(this.orchestrator.lastTransition()).toEqual([]);

        });

        it("should be possible to get multiple callbacks from one transition", function() {
            var ast_called = false,
                gen_called = false,
                from_called = false,
                super_called = false,
                orchestrator = new window.Orchestrator({
                    "state_1:*": function() {
                        gen_called = true;
                    },
                    "*:state_2": function() {
                        from_called = true;
                        return false;
                    },
                    "*:*": function() {
                        super_called = true;
                    },
                    "state_1:state_2": function() {
                        ast_called = true;
                    }
                });

            orchestrator.transition("state_1", "state_2");
            expect(ast_called).toBeTruthy();
            expect(gen_called).toBeTruthy();
            expect(from_called).toBeTruthy();
            expect(super_called).toBeFalsy();
        });

        it("should not call callbacks multiple times", function() {
            var orchestrator = new window.Orchestrator({
                    "view_1:view_2": function() { }
                }),
                s = spyOn(orchestrator.transitions, 'view_1:view_2').andCallThrough();

            orchestrator.transition("view_1", "view_2");

            expect(s).toHaveBeenCalled();
            expect(s.callCount).toBe(1);
        });

        it("should perform transitions from empty state", function() {
            var s = spyOn(this.orchestrator.transitions, '*:view_3').andCallThrough();
            this.orchestrator.transition("", "view_3");

            expect(s).toHaveBeenCalledWith("", "view_3");
        });

        it("should also emit events when performing transitions", function() {
            var s = spyOn(this.orchestrator, 'trigger');
            
            this.orchestrator.transition("view_1", "view_2");
            expect(s).toHaveBeenCalledWith("view_1", "view_2");
            s.reset();

            this.orchestrator.back();
            expect(s).toHaveBeenCalledWith("view_2", "view_1", true);
        });

        it("should be possible to use regular expressions on transition specs", function() {
            var from_called = false,
                to_called = false,
                orchestrator = new window.Orchestrator({
                    "state_1:*": function() {
                        from_called = true;
                    },
                    "[^state_1]:state_2": function() {
                        to_called = true;
                    }
                });

            orchestrator.transition("state_1", "state_2");
            expect(from_called).toBeTruthy();
            expect(to_called).toBeFalsy();
        });
    });
}());
