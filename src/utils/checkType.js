import Immutable from 'immutable';
/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}
/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */
function isObject(val) {
  return Object == val.constructor;
}
/**
 * Check for Array.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */
function isArray(val) {
  return Array == val.constructor;
}
/**
 * Check if `obj` is a normal function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isPlainFunction(obj) {
  return Function == obj.constructor;
}
/**
 * Check if `obj` is a last node config.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isLastNodeConfig(obj) {
    if(!isObject(obj)) throw new Error('配置文件必须是一个对象');
    var checkProperty = ['initState', 'stateName', 'actionsName', 'items'];
    for(var i = 0, len = checkProperty.length; i < len; i++) {
        if(!(checkProperty[i] in obj))  return false;
    }
    return true;
}
/**
 * Check for immutable.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */
function isImmutable(val) {
  return Immutable.Iterable.isIterable(val);
}

export default {
    isPromise: isPromise,
    isGenerator: isGenerator,
    isGeneratorFunction: isGeneratorFunction,
    isObject: isObject,
    isArray: isArray,
    isPlainFunction: isPlainFunction,
    isLastNodeConfig: isLastNodeConfig,
    isImmutable: isImmutable
}
