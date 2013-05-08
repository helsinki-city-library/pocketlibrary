/*jslint
  browser: true, anon: true, nomen: true
*/
/*global
  console, _, device
*/
(function() {
    "use strict";
    window.Orchestrator = function(transitions, initial_state) {
        this.transitions = transitions;
        this.transition_stack = [];
        this.current_state = "";
        this.listeners = [];
        this.initial_state = initial_state;
        if (initial_state) {
            this.transition("", initial_state);
        }
    };
    window.Orchestrator.prototype = {
        reset: function() {
            this.transition_stack = [];
        },

        on: function(listener) {
            this.listeners.push(listener);
        },

        trigger: function(from, to, going_back) {
            _.each(this.listeners, function(callback) {
                callback(from, to, going_back);
            });
        },

        transition: function(from, to, going_back) {
            var callbacks = [], self = this, key, cb, from_to, i,
                rexify = function(k) {
                    return {
                        regex: k === "*" ?
                                (/\w*/) :
                                new RegExp(k),
                        key: k
                    };
                },
                params;

            if (to === undefined) {
                to = from;
                from = "";
                if (this.transition_stack.length > 0) {
                    from = this.lastTransition()[1];
                }
            }

            if (this.transitions.hasOwnProperty(from + ":" + to)) {
                callbacks.push(this.transitions[from + ":" + to]);
            }

            for (key in this.transitions) {
                if (this.transitions.hasOwnProperty(key)) {
                    cb = this.transitions[key];
                    from_to = _.map(key.split(':'), rexify);

                    if (from_to[0].regex.test(from) && from_to[1].regex.test(to) &&
                            key !== from + ":" + to) {
                        callbacks.push(cb);
                    }
                }
            }
            // TODO; Nasty hack, sort won't work with HTC
            if (typeof device !== 'undefined' && device.platform !== 'android') {
                callbacks.sort(function(a, b) {
                    if (a === "*:*") { return 1; }
                    return 0;
                });
            }
            if (callbacks.length > 0) {
                params = [from, to];
                if (going_back !== undefined) {
                    params.push(going_back);
                }

                this.transition_stack.push([from, to]);
                for (i = 0; i < callbacks.length; i += 1) {
                    if (callbacks[i].apply(self, params) === false) {
                        break;
                    }
                }
                this.trigger.apply(this, params);

                this.current_state = to;
            }
        },

        lastTransition: function() {
            if (this.transition_stack.length > 0) {
                return this.transition_stack[this.transition_stack.length - 1];
            }
            return [];
        },

        isEmpty: function () {
            return this.transition_stack.length === 0;
        },

        back: function(count) {
            var n = this.transition_stack.length - (count || 1),
                last;

            if (n >= 0) {
                last = this.transition_stack.splice(n)[0];
            } else {
                throw "Not enough elements to pop";
            }

            this.transition(this.current_state, last[0], true);
            this.transition_stack.pop();

            return this.lastTransition();
        }
    };
}());
