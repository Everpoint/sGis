import {Contour, Coordinates} from "../../baseTypes";
import {squareDistance} from "../../utils/math";
import {pointToLineProjection} from "../../geotools";

export type SnappingData = {
    points: Coordinates[],
    lines: Contour[]
}

export interface SnappingMethodParams {
    /** Base point for snapping. */
    position: Coordinates;
    /** The set of relevant point and contours in the vicinity. */
    data: SnappingData;
    /** Maximum distance the snapping point can be from the base point in the coordinates of the base point. */
    snappingDistance: number;
    /** Contour that is being currently edited (if applicable). */
    activeContour: Contour;
    /** Index of the point in the active contour that is being currently edited (if applicable). */
    activeIndex: number;
    /** Where the active contour is enclosed (if it is a polygon contour). */
    isEnclosed?: boolean;
}

/**
 * Snapping method is an implementation of a certain algorithm to find a snapping point provided necessary data.
 */
export type SnappingMethod = (params: SnappingMethodParams) => Coordinates | null;

/**
 * Snaps to the given base point.
 */
export const emptySnapping: SnappingMethod = ({position}): Coordinates | null => {
    return position;
};

/**
 * Snaps to the closest point among given relevant points and contour vertexes.
 */
export const vertexSnapping: SnappingMethod = ({position, data, snappingDistance}): Coordinates | null => {
    let minSqDist = snappingDistance * snappingDistance;
    let snappingPoint = null;
    data.points.forEach(point => {
        const currSqDist = squareDistance(position, point);
        if (currSqDist < minSqDist) {
            snappingPoint = point;
            minSqDist = currSqDist;
        }
    });

    return snappingPoint;
};

/**
 * Snaps to the closest point on any edge given in data.lines parameter.
 */
export const lineSnapping: SnappingMethod = ({position, data, snappingDistance}): Coordinates | null => {
    let snappingPoint = null;
    let currDistanceSq = snappingDistance * snappingDistance;
    data.lines.forEach(contour => {
        for (let i = 1; i < contour.length; i++) {
            const projectedPoint = pointToLineProjection(position, [contour[i-1], contour[i]]);

            let minX = Math.min(contour[i-1][0], contour[i][0]);
            let maxX = Math.max(contour[i-1][0], contour[i][0]);
            let minY = Math.min(contour[i-1][1], contour[i][1]);
            let maxY = Math.max(contour[i-1][1], contour[i][1]);
            if (projectedPoint[0] < minX || projectedPoint[0] > maxX || projectedPoint[1] < minY || projectedPoint[1] > maxY) continue;

            const distanceSq = squareDistance(projectedPoint, position);
            if (distanceSq < currDistanceSq) {
                currDistanceSq = distanceSq;
                snappingPoint = projectedPoint;
            }
        }
    });

    return snappingPoint;
};

/**
 * Snaps to a closest middle point on the lines given in data.lines parameter.
 */
export const midPointSnapping: SnappingMethod = ({position, data, snappingDistance}): Coordinates | null => {
    let snappingPoint = null;
    let currDistanceSq = snappingDistance * snappingDistance;
    data.lines.forEach(contour => {
        for (let i = 1; i < contour.length; i++) {
            const midX = (contour[i-1][0] + contour[i][0]) / 2;
            const midY = (contour[i-1][1] + contour[i][1]) / 2;

            const distanceSq = squareDistance([midX, midY], position);
            if (distanceSq < currDistanceSq) {
                currDistanceSq = distanceSq;
                snappingPoint = [midX, midY];
            }
        }
    });

    return snappingPoint;
};

/**
 * In case a contour is being edited, this method takes two edges in the active contour adjusted to the active point
 * (that is point being edited), and then tries to find such a snapping point so that one of the edges (or both of them)
 * are either vertical or horizontal.
 */
export const axisSnapping: SnappingMethod = ({position, data, snappingDistance, activeContour, activeIndex = -1, isEnclosed = false}): Coordinates | null => {
    if (!activeContour || activeIndex < 0 || activeContour.length < 2) return null;

    const lines = [];

    const lastIndex = activeContour.length - 1;
    if (activeIndex === 0 && isEnclosed) {
        lines.push([activeContour[0], activeContour[lastIndex]]);
    }
    if (activeIndex !== 0) {
        lines.push([activeContour[activeIndex], activeContour[activeIndex - 1]]);
    }
    if (activeIndex !== lastIndex) {
        lines.push([activeContour[activeIndex], activeContour[activeIndex + 1]]);
    }
    if (activeIndex === lastIndex && isEnclosed) {
        lines.push([activeContour[lastIndex], activeContour[0]]);
    }

    const basePoints = [];
    for (let i = 0; i < lines.length; i++) {
        for (let axis = 0; axis < 2; axis++) {
            let projection = [lines[i][axis][0], lines[i][(axis + 1)%2][1]];
            if (Math.abs(projection[0] - position[0]) < snappingDistance && Math.abs(projection[1] - position[1]) < snappingDistance) {
                basePoints[(axis+1)%2] = lines[i][1][(axis+1)%2];
                break;
            }
        }
    }

    if (basePoints.length > 0) {
        return [basePoints[0] === undefined ? position[0] : basePoints[0], basePoints[1] === undefined ? position[1] : basePoints[1]];
    }

    return null;
};

/**
 * In case a contour is being edited, this method takes two edges in the active contour adjusted to the active point
 * (that is point being edited), and then tries to find such a snapping point so that one of the edges (or both of them)
 * is orthogonal to its neighbours or each other.
 */
export const orthogonalSnapping: SnappingMethod = ({position, data, snappingDistance, activeContour, activeIndex = -1, isEnclosed = false}): Coordinates | null => {
    if (!activeContour || activeIndex < 0 || activeContour.length < 3) return null;

    const lines = [];

    const contourLength = activeContour.length;
    if (isEnclosed) {
        lines.push([activeContour[(activeIndex + 1) % contourLength], activeContour[(activeIndex + 2) % contourLength]]);
        lines.push([activeContour[(contourLength + activeIndex - 1) % contourLength], activeContour[(contourLength + activeIndex - 2) % contourLength]]);
    } else {
        if (activeIndex >= 2) lines.push([activeContour[activeIndex-1], activeContour[activeIndex-2]]);
        if (activeIndex <= contourLength - 3) lines.push([activeContour[activeIndex + 1], activeContour[activeIndex + 2]]);
    }

    let basePoint = position;
    for (let i = 0; i < lines.length; i++) {
        let projection = pointToLineProjection(basePoint, lines[i]);
        let dx = projection[0] - lines[i][0][0];
        let dy = projection[1] - lines[i][0][1];

        if (Math.abs(dx) < snappingDistance && Math.abs(dy) < snappingDistance) {
            basePoint = [basePoint[0] - dx, basePoint[1] - dy];
            let direction = i === 0 ? 1 : -1;
            let nextPoint = isEnclosed ? activeContour[(contourLength + activeIndex + direction) % contourLength] : activeContour[activeIndex + direction];
            let prevPoint = isEnclosed ? activeContour[(contourLength + activeIndex - direction) % contourLength] : activeContour[activeIndex - direction];
            if (nextPoint && prevPoint) {
                projection = pointToLineProjection(prevPoint, [activeContour[activeIndex], nextPoint]);
                if (Math.abs(projection[0] - basePoint[0]) < snappingDistance && Math.abs(projection[1] - basePoint[1]) < snappingDistance) {
                    basePoint = projection;
                }
            }
        }
    }

    if (basePoint[0] === position[0] && basePoint[1] === position[1]) return null;

    return basePoint;
};