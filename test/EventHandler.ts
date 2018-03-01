import "jest";
import {EventHandler, sGisEvent} from "../source/EventHandler";

describe('EventHandler', function () {
    let object: EventHandler;
    let f = function() {};

    beforeEach(function () {
        class c extends EventHandler {}
        object = new c();
    });

    describe('methods', function () {
        describe('.addListener()', function() {
            it('should add the listener', function () {
                object.addListener('hello', f);

                expect(object.hasListeners('hello')).toBe(true);
            });

            it('should distinguish event types and namespaces', function () {
                object.addListener('event.namespace', f);
                expect(object.hasListeners('event')).toBe(true);
                expect(object.hasListeners('namespace')).toBe(false);

                object.addListener('event1 .namespace1 .namespace2', f);
                expect(object.hasListeners('event1')).toBe(true);
                expect(object.hasListeners('namespace1')).toBe(false);

                let keys = Object.keys((<any>object)._eventHandlers);
                expect(keys.length).toBe(2);
            });

            it('should set the handler for different events if several event names are provided', function() {
                object.addListener('event event1', f);

                expect(object.hasListeners('event')).toBe(true);
                expect(object.hasListeners('event1')).toBe(true);
            });

            it('should get event names and namespaces in any order', function() {
                object.addListener('event.ns event1 .ns2 event2', f);

                expect(object.hasListeners('event')).toBe(true);
                expect(object.hasListeners('event1')).toBe(true);
                expect(object.hasListeners('event2')).toBe(true);
                expect(object.hasListeners('ns')).toBe(false);
                expect(object.hasListeners('ns2')).toBe(false);
            });
        });

        describe('.on()', function() {
            it('should be alias for .addListener', function() {
                let arg;
                object.addListener = function() {
                    arg = Array.prototype.slice.apply(arguments);
                };
                
                let req = ['event', () => {}];
                object.on.apply(object, req);
                expect(arg).toEqual(req);
            });
        });

        describe('.once()', function() {
            it('should set one time listener for the event', function() {
                let fired = false;
                let handler = function() { fired = true; };

                object.once('event', handler);
                expect(object.hasListener('event', handler)).toBe(true);

                object.fire('event');
                expect(fired).toBe(true);
                expect(object.hasListeners('event')).toBe(false);
            });

            it('should not remove other listeners', function() {
                let f1 = function() {};
                let f2 = function() {};
                let f3 = function() {};

                object.once('event', f);
                object.on('event', f1);
                object.once('event', f2);
                object.on('event', f3);

                object.fire('event');
                expect(object.hasListener('event', f)).toBe(false);
                expect(object.hasListener('event', f1)).toBe(true);
                expect(object.hasListener('event', f2)).toBe(false);
                expect(object.hasListener('event', f3)).toBe(true);
            });

            it('should set the namespaces for the listener', function() {
                object.once('event.ns .ns1', f);
                expect(object.hasListeners('.ns')).toBe(true);
                expect(object.hasListeners('.ns1')).toBe(true);
            });
        });

        describe('.removeListener()', function() {
            it('should remove the listener from the object', function () {
                object.on('event', f);
                object.removeListener('event', f);
                expect(object.hasListeners('event')).toBe(false);
            });

            it('should not remove the other listeners', function() {
                let handler = function() {};
                object.on('event', f);
                object.on('event', handler);
                object.removeListener('event', f);
                expect(object.hasListener('event', f)).toBe(false);
                expect(object.hasListener('event', handler)).toBe(true);
            });

            it('should remove the listener only if it is in the given namespace if the namespace is specified', function() {
                object.on('event.ns', f);
                object.removeListener('event.ns1', f);
                expect(object.hasListener('event', f)).toBe(true);
                object.removeListener('event.ns', f);
                expect(object.hasListener('event', f)).toBe(false);

                object.on('event.ns', f);
                object.removeListener('event', f);
                expect(object.hasListener('event', f)).toBe(false);
            });

            it('should remove the listener if it is in one of the given namespaces', function() {
                object.on('event.ns', f);
                object.removeListener('event.ns1 .ns', f);
                expect(object.hasListener('event', f)).toBe(false);
            });

            it('should remove all the handlers of the specified type in the namespace if the handler is not specified', function() {
                let f1 = function() {};
                object.on('event.ns', f);
                object.on('event.ns', f1);
                object.removeListener('event.ns');
                expect(object.hasListeners('event')).toBe(false);
            });

            it('should remove all the handlers of all the specified namespaces if the handler is not specified', function() {
                let f1 = function() {};
                let f2 = function() {};
                let f3 = function() {};

                object.on('event.ns', f);
                object.on('event.ns', f1);
                object.on('event.ns1', f2);
                object.on('event.ns1', f3);

                object.removeListener('event.ns .ns1');
                expect(object.hasListeners('event')).toBe(false);
            });

            it('should remove all listeners from the given namespace if no type and handler are specified', function() {
                let f1 = function() {};
                let f2 = function() {};
                let f3 = function() {};

                object.on('event.ns', f);
                object.on('event.ns', f1);
                object.on('event.ns1', f2);
                object.on('event.ns1', f3);

                object.removeListener('.ns');
                expect(object.hasListeners('event')).toBe(true);
                expect(object.hasListeners('event.ns')).toBe(false);
            });
        });

        describe('.off()', function() {
            it('should be alias for .removeListener', function() {
                let arg;
                object.removeListener = function() {
                    arg = Array.prototype.slice.apply(arguments);
                };

                let req = ['event', () => {}];
                object.off.apply(object, req);
                expect(arg).toEqual(req);
            });
        });

        describe('.hasListener()', function() {
            it('should return true if the handler is attached to the object', function() {
                object.on('event', f);
                expect(object.hasListener('event', f)).toBe(true);

                let handler = function() {};
                object.on('event1', handler);
                expect(object.hasListener('event', f)).toBe(true);
                expect(object.hasListener('event1', handler)).toBe(true);
            });

            it('should return false if there is no such listener', function() {
                expect(object.hasListener('event', f)).toBe(false);
                object.on('event', f);
                expect(object.hasListener('event1', f)).toBe(false);
                expect(object.hasListener('event', function() {})).toBe(false);
            });
        });

        describe('.hasListeners()', function() {
            it('should return true if there is at least one handler for the given type of event', function() {
                object.on('event', f);
                expect(object.hasListeners('event')).toBe(true);
                object.on('event', function() {});
                expect(object.hasListeners('event')).toBe(true);
            });

            it('should return false if there are no handlers for the given type of the event', function() {
                expect(object.hasListeners('event')).toBe(false);
                object.on('event', f);
                expect(object.hasListeners('event1')).toBe(false);
            });

            it('should return true if at least one of the given types of event has handler', function() {
                object.on('event', f);
                expect(object.hasListeners('event1 event')).toBe(true);
            });

            it('should return true if there are listeners in the given namespace', function() {
                object.on('event.ns', f);
                expect(object.hasListeners('.ns')).toBe(true);
                expect(object.hasListeners('.ns1')).toBe(false);
            });

            it('should return true if there are listeners of the given type in the given namespace', function() {
                object.on('event.ns', f);
                expect(object.hasListeners('event.ns')).toBe(true);
                expect(object.hasListeners('event1.ns')).toBe(false);
                expect(object.hasListeners('event.ns1')).toBe(false);

                object.on('event1.ns', f);
                object.on('event2.ns', function() {});
                object.on('event3.ns1', function() {});
                object.on('event3.ns2', function() {});

                expect(object.hasListeners('.ns')).toBe(true);
                expect(object.hasListeners('.ns1')).toBe(true);
                expect(object.hasListeners('.ns2')).toBe(true);
                expect(object.hasListeners('event1')).toBe(true);
                expect(object.hasListeners('event2')).toBe(true);
                expect(object.hasListeners('event3')).toBe(true);
                expect(object.hasListeners('event3.ns1')).toBe(true);
                expect(object.hasListeners('event1.ns1')).toBe(false);
                expect(object.hasListeners('event3.ns')).toBe(false);
            });

            it('should return true if there are listeners in at least one of the given namespaces', function() {
                object.on('event.ns', f);
                expect(object.hasListeners('.ns1 .ns')).toBe(true);
                expect(object.hasListeners('event.ns1 .ns')).toBe(true);
            });
        });

        describe('.fire()', function() {
            let fired1: boolean;
            let fired2: boolean;
            let f1: () => void;
            let f2: () => void;

            beforeEach(function() {
                fired1 = false;
                fired2 = false;
                f1 = function() { fired1 = true; };
                f2 = function() { fired2 = true; };
            });

            it('should call the event handler', function() {
                object.on('event', f1);
                object.fire('event');

                expect(fired1).toBe(true);
                expect(fired2).toBe(false);
            });

            it('should call all handlers for the given event', function() {
                object.on('event', f1);
                object.on('event', f2);

                object.fire('event');
                expect(fired1).toBe(true);
                expect(fired2).toBe(true);
            });

            it('should not call handlers of hte different events', function() {
                object.on('event', f1);
                object.on('event1', f2);

                object.fire('event1');
                expect(fired1).toBe(false);
                expect(fired2).toBe(true);
            });

            it('should call handlers in the order they were added', function() {
                let rightOrder = false;
                let f3 = function() {
                    if (fired1 && !fired2) rightOrder = true;
                };

                object.on('event', f1);
                object.on('event', f3);
                object.on('vent', f2);

                object.fire('event');
                expect(rightOrder).toBe(true);
            });

            it('should call the same handler for each time it was added', function() {
                let counter = 0;
                let f3 = function() { counter++; };

                object.on('event', f3);
                object.on('event', f1);
                object.on('event', f3);
                object.on('event', f3);
                object.fire('event');

                expect(counter).toBe(3);
            });

            it('should call the handle in the source object context', function() {
                let correct = false;
                let f3 = function(this: Object) {
                    correct = this === object;
                };
                object.on('event', f3);
                object.fire('event');

                expect(correct).toBe(true);
            });
        });

        describe('.prohibitEvent() and .allowEvent()', function() {
            it('should prohibit and allow triggering an event', function() {
                let fired = false;
                let handler = function() { fired = true; };

                object.on('event', handler);
                object.prohibitEvent('event');
                object.fire('event');
                expect(fired).toBe(false);

                let event = new sGisEvent('type');
                object.forwardEvent(event);
                expect(fired).toBe(false);

                object.allowEvent('event');
                object.fire('event');
                expect(fired).toBe(true);
            });

            it('should not affect any other events', function() {
                let fired = false;
                let handler = function() { fired = true; };

                object.on('event', handler);
                object.on('event1', f);
                object.prohibitEvent('event1');
                object.fire('event');

                expect(fired).toBe(true);
            });

            it('should stack the prohibitions and unstack when allowing', function() {
                let fired = false;
                let handler = function() { fired = true; };

                object.on('event', handler);
                object.prohibitEvent('event');
                object.prohibitEvent('event');
                expect(fired).toBe(false);

                let event = new sGisEvent('type');
                object.forwardEvent(event);
                expect(fired).toBe(false);

                object.allowEvent('event');
                object.fire('event');
                expect(fired).toBe(false);

                object.allowEvent('event');
                object.fire('event');
                expect(fired).toBe(true);
            });
        });

        describe('.removeAllListeners()', function() {
            it('should remove all event listeners', function() {
                object.on('event', f);
                object.on('event1', function() {});

                object.removeAllListeners();
                expect(object.hasListeners('event')).toBe(false);
                expect(object.hasListeners('event1')).toBe(false);
            });
        });
    });

    it('should not crate any enumerable properties if connected properly', function() {
        object.on('event', f);

        let counter = 0;
        for (let i in object) {
            counter++;
        }

        expect(counter).toBe(0);
    });
});
