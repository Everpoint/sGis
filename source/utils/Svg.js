'use strict';

(function() {

    sGis.utils.svg = {
        ns: 'http://www.w3.org/2000/svg',

        base: function(properties) {
            var svg = document.createElementNS(this.ns, 'svg');
            setAttributes(svg, properties);
            svg.style.pointerEvents = 'none';

            return svg;
        },

        path: function(properties) {
            if (properties.fillImage) {
                var defs = document.createElementNS(this.ns, 'defs');
                var pattern = document.createElementNS(this.ns, 'pattern');
                var id = utils.getGuid();
                pattern.setAttribute('id', id);
                pattern.setAttribute('patternUnits', 'userSpaceOnUse');
                pattern.setAttribute('x', properties.x);
                pattern.setAttribute('y', properties.y);
                pattern.setAttribute('width', properties.fillImage.width);
                pattern.setAttribute('height', properties.fillImage.height);

                var image = document.createElementNS(this.ns, 'image');
                image.setAttributeNS("http://www.w3.org/1999/xlink", 'xlink:href', properties.fillImage.src);
                image.setAttribute('width', properties.fillImage.width);
                image.setAttribute('height', properties.fillImage.height);

                pattern.appendChild(image);
                defs.appendChild(pattern);
            }

            var path = document.createElementNS(this.ns, 'path');
            var svgAttributes = setAttributes(path, properties);
            var svg = this.base(svgAttributes);

            if (properties.fillImage) {
                svg.setAttribute('xmlns', this.ns);
                svg.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");

                path.setAttribute('fill', 'url(#' + id + ')');
                svg.appendChild(defs);
                //svg.appendChild(image);
            }

            svg.appendChild(path);

            return svg;
        },

        circle: function(properties) {
            var circle = document.createElementNS(this.ns, 'circle');
            var svgAttributes = setAttributes(circle, properties);
            var svg = this.base(svgAttributes);

            svg.appendChild(circle);

            return svg;
        }
    };

    var svgAttributes = ['width', 'height', 'viewBox'];
    function setAttributes(element, attributes) {
        var isSvg = element instanceof SVGSVGElement;
        var notSet = {};
        for (var i in attributes) {
            if (attributes.hasOwnProperty(i) && i !== 'fillImage' && attributes[i] !== undefined) {
                if (!isSvg && svgAttributes.indexOf(i) !== -1) {
                    notSet[i] = attributes[i];
                    continue;
                }

                if (i === 'stroke' || i === 'fill') {
                    var color = new sGis.utils.Color(attributes[i]);
                    if (color.a < 255 || color.format === 'rgba') {
                        element.setAttribute(i, color.toString('rgb'));
                        if (color.a < 255) element.setAttribute(i + '-opacity', color.a / 255);
                        continue;
                    }
                }
                element.setAttribute(i, attributes[i]);
            }
        }

        return notSet;
    }

})();