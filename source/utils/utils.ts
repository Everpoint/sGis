/**
 * Throws an exception with given message. If you need to handle all errors in one place, redefined this method to your needed handler.
 * @param error
 */
export const error = function(error: string | Error): never {
    if (isString(error)) {
        throw new Error(error as string);
    } else {
        throw error;
    }
};

export const warn = function(error: string): void {
    // eslint-disable-next-line no-console
    console.warn(error);
};

/**
 * Calls the 'func' callback in 'interval' ms after a series of subsequent function calls.
 * @param func - callback function
 * @param interval - interval in ms
 */
export const debounce = function(func: Function, interval: number): () => void{
    let timer: number | null = null;
    return function() {
        if (timer) clearTimeout(timer);
        let args = arguments;
        timer = window.setTimeout(function (this: any) {
            timer = null;
            func.apply(this, args);
        }, interval);
    }
};

/**
 * Throttle function calls
 * @param func - callback function
 * @param interval - interval
 */
export const throttle = function(func: Function, interval: number): () => void {
    let isThrottled = false;
    let savedArgs: IArguments | null;
    let savedThis: any;

    function wrapper(this: any) {
        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        func.apply(this, arguments);

        isThrottled = true;

        setTimeout(function() {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, interval);
    }

    return wrapper;
};

/**
 * Returns true if n is a finite number, otherwise false
 * @param n
 */
export const isNumber = function(n: any): boolean {
    return typeof n === 'number' && isFinite(n);
};

/**
 * Returns true if n is an integer number, otherwise false
 * @param n
 */
export const isInteger = function(n: any): boolean {
    return isNumber(n) && Math.round(n) === n;
};

/**
 * Returns true if s is a string, otherwise false
 * @param s
 */
export const isString = function(s: any): boolean {
    return typeof s === 'string';
};

/**
 * Returns a random GUID
 */
export const getGuid = function(): string {
    //noinspection SpellCheckingInspection
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        let r = Math.random() * 16 | 0;
        let v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
};

/**
 * Returns true if at least one element of arr1 also exists in arr2
 * @param arr1
 * @param arr2
 */
export const arrayIntersect = function(arr1: any[], arr2: any[]): boolean {
    for (let i = 0; i < arr1.length; i++) {
        if (arr2.indexOf(arr1[i]) !== -1) {
            return true;
        }
    }
    return false;
};

/**
 * Makes a deep copy af the array
 * @param arr
 */
export const copyArray = function<T>(arr: T[]): T[] {
    let copy: T[] = [];
    for (let i = 0, l = arr.length; i < l; i++) {
        if (Array.isArray(arr[i])) {
            copy[i] = <any>copyArray(<any>arr[i]);
        } else {
            copy[i] = arr[i];
        }
    }
    return copy;
};

/**
 * Makes a deep copy of an object
 * @param obj
 * TODO: this will not copy the inner arrays properly
 */
export const copyObject = function(obj: any): any {
    if (!(obj instanceof Function) && obj instanceof Object) {
        let copy = Array.isArray(obj) ? [] : {} as any;
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            copy[keys[i]] = copyObject(obj[keys[i]]);
        }
        return copy;
    } else {
        return obj;
    }
};

/**
 * Creates a new <style> node and adds it to the document head section.
 * @param desc
 */
export const setCssClasses = function(desc: {[key: string]: string}): void {
    let classes = Object.keys(desc).map(key => {return getCssText(key, desc[key]);});
    setStyleNode(classes.join('\n'));
};

const getCssText = function(className: string, styles: string): string {
    return '.' + className + '{' + styles + '}';
};

/**
 * Creates a new <style> node with the given code and adds it to the document head.
 * @param text
 */
export const setStyleNode = function(text: string): void {
    let node = document.createElement('style');
    node.type = 'text/css';
    if ((<any>node).styleSheet) {
        (<any>node).styleSheet.cssText = text;
    } else {
        node.appendChild(document.createTextNode(text));
    }

    document.head.appendChild(node);
};

/**
 * Contains the name of the current browser.
 */
export const browser: string = (function() {
    let ua= navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem= ua.match(/\bOPR\/(\d+)/);
        if (tem != null) return 'Opera ' + tem[1];
    }
    M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
})();

/**
 * Contains 'true' if the current browser is Internet Explorer of any version.
 */
export const isIE: boolean = browser.search('IE') !== -1;

/**
 * Contains 'true' if the current browser is run on a touch device.
 */
export const isTouch: boolean = 'ontouchstart' in document.documentElement;


/* Simple polyfil for tests */
if (typeof window.requestAnimationFrame === 'undefined') {
    window.requestAnimationFrame = (callback): number => {
        setTimeout(callback, 1000/30);
        return 0;
    }
}