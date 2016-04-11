import checkType from './checkType';
/**
*实现对象的复制
*/
export function assign() {
    var isEqual = true;
    function _assign() {
        /*
    　　*target被扩展的对象
    　　*length参数的数量
    　　*deep是否深度操作
    　　*/
    　　var options, name, src, copy, copyIsArray, clone,
    　　　　target = arguments[0] || {},
    　　　　i = 1,
    　　　　length = arguments.length,
    　　　　deep = false;
    　　if ( typeof target === "boolean" ) {
    　　　　deep = target;
    　　　　target = arguments[1] || {};
    　　　　i = 2;
    　　}
    　　// target既不是对象也不是函数则把target设置为空对象。
    　　if ( typeof target !== "object" && !checkType.isPlainFunction(target) ) {
    　　　　target = {};
    　　}
    　　if ( length === i ) {
    　　　　target = {};
    　　　　--i;
    　　}

    　　// 开始遍历需要被扩展到target上的参数

    　　for ( ; i < length; i++ ) {
    　　　　if ( (options = arguments[ i ]) != null ) {
    　　　　　　for ( name in options ) {
    　　　　　　　　src = target[ name ];
    　　　　　　　　copy = options[ name ];
                 //prevent deep-loop
    　　　　　　　　if ( target === copy ) {
    　　　　　　　　　　continue;
    　　　　　　　　}
    　　　　　　　　if ( deep && copy && ( checkType.isObject(copy) || (copyIsArray = checkType.isArray(copy)) ) ) {
    　　　　　　　　　　if ( copyIsArray ) {
    　　　　　　　　　　　　copyIsArray = false;
    　　　　　　　　　　　　clone = src && checkType.isArray(src) ? src : [];
    　　　　　　　　　　} else {
    　　　　　　　　　　　　clone = src && checkType.isObject(src) ? src : {};
    　　　　　　　　　　}
    　　　　　　　　　　// 递归调用extend方法，继续进行深度遍历
    　　　　　　　　　　target[ name ] = _assign( deep, clone, copy );

    　　　　　　　　} else if ( copy !== undefined ) {
                    if(target[name] !== copy) isEqual = false;
    　　　　　　　　　　target[ name ] = copy;
                 } else {
                     if(target[name] !== copy) isEqual = false;
                 }
    　　　　　　}
    　　　　}
    　　}
    　　// 原对象被改变，因此如果不想改变原对象，target可传入{}
    　　return target;
    }
    var data = _assign.apply(null, arguments);
    return {
        isEqual: isEqual,
        data: data
    }
}
