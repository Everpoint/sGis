import "jest";
import {init as sGisInit} from "../../../source/init";
import {FeatureLayer} from "../../../source/FeatureLayer";
import {requestAnimationFrame} from "../../../source/utils/utils";

describe('painters.DomPainter', () => {

    'use strict';

    let map, painter, container;

    function getContainer() {
        const containerCss = 'width: 200px; height: 200px;';
        let container = document.createElement('div');
        container.style.cssText = containerCss;
        return container;
    }

    beforeEach(() => {
        container = getContainer();
        document.body.appendChild(container);
        let init = sGisInit(<any>{wrapper: container});
        [map, painter] = [init.map, init.painter];
    });

    afterEach(() => {
        document.body.innerHTML = '';
        container = null;
    });

    describe('.wrapper', () => {
        it('should add map dom structure to the container', (done) => {
            expect(container.children.length).not.toBe(0);
            done();
        });

        it('should remove map from the container if wrapper = null is assigned', (done) => {
            painter.wrapper = null;
            expect(container.children.length).toBe(0);
            done();
        });

        it('should add dom structure to the new container after assignment', (done) => {
            let newContainer = getContainer();
            expect(newContainer.children.length).toBe(0);

            painter.wrapper = newContainer;
            expect(container.children.length).toBe(0);
            expect(newContainer.children.length).not.toBe(0);
            done();
        });

        it('should request all layers repaint after new container is assigned', (done) => {
            let layers = [new FeatureLayer(), new FeatureLayer()];
            map.layers = layers;

            requestAnimationFrame(() => {
                let spies = layers.map(layer => spyOn(layer, 'getFeatures'));

                let newContainer = getContainer();
                document.body.appendChild(newContainer);
                painter.wrapper = newContainer;

                requestAnimationFrame(() => {
                    spies.forEach(spy => expect(spy).toHaveBeenCalled());
                    done();
                });
            });
        });
    });


});