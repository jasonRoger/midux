import checkType from './utils/checkType';
import createActionReducer from './createActionReducer';
import Immutable from 'immutable';
//状态树存储对象，其属性名为configs.stateName, 属性值来为configs.reducer的返回值
//如果存在配置文件的嵌套，则为每一个配置文件生成的state添加一个isChangedByMidux属性，用于标识每次
//dispatch的时候该state是否发生变化，便于后续判断是否需要更新组件
var stateStore = {};
//存储react context
var contextStore = {};
//存储state reducers
var stateReducers = {};
//存储context reducers
var contextReducers = {};
//存储state action props
var stateActions = {};
//存储context action props
var contextActions = {};
//subscribe 事件回调函数列表
var callbacks = [];
/**
* 获取state
* @param {undefined} 无
* @returns {obj} stateStore
*/
function getState() {
    return stateStore;
}
/**
* 获取props
* @param {undefined} 无
* @returns {obj} stateActions
*/
function getStateActions() {
    return stateActions;
}
/**
* 获取react context
* @param {undefined} 无
* @returns {obj} propsStore
*/
function getContext() {
    return contextStore;
}
/**
* 获取props
* @param {undefined} 无
* @returns {obj} propsStore
*/
function getContextActions() {
    return contextActions;
}
/**
* 公用遍历对象方法
* @param {obj} obj 需要遍历的对象
* @param {function} callback 需要遍历的对象
* @param {boolean} asImmutable
* @returns {obj} newObj
*/
function map(obj, callback, asImmutable) {
    var newObj = {};
    if(asImmutable) return obj.map(callback);
    for(var o in obj) {
        newObj[o] = callback(obj[o], o);
    }
    return newObj;
}
/**
* 公用遍历对象方法
* @param {obj} obj 需要遍历的对象
* @param {function} callback 需要遍历的对象
* @param {boolean} asImmutable
* @returns {obj} newObj
*/
function forEach(obj, callback, asImmutable) {
    if(asImmutable) return obj.forEach(callback);
    for(var o in obj) {
        if(callback(obj[o], o) === false) return;
    }
}
/**
* 判断对象是否有isChangedByMidux属性
* @param {obj} obj 需要遍历的对象
* @param {boolean} asImmutable
* @returns {boolean}
*/
function hasChangeFlag(obj, asImmutable) {
    return asImmutable ? obj.has('isChangedByMidux') : 'isChangedByMidux' in obj;
}
/**
* 设置isChangedByMidux属性的值
* @param {obj} obj 需要遍历的对象
* @param {boolean} value 需要设置的值
* @param {boolean} asImmutable
* @returns obj
*/
function setChangeFlag(obj, value, asImmutable) {
    if(asImmutable) {
        obj = obj.merge({ isChangedByMidux: value });
    } else {
        obj.isChangedByMidux = value;
    }
    return obj;
}
/**
* 为state的每一个非配置文件节点(也就是说该节点不是由配置文件的最后一层生成的)添加isChangedByMidux
* @param {obj} state
* @param {boolean} notSetAllFalse 是否需要将所有的isChangedByMidux设置为false
* @param {boolean} asImmutable
* @returns {obj} new state
*/
function addChangeFlag(state, notSetAllFalse, asImmutable) {
    function _isChangedVerify(state) {
        var isChanged = false;
        if(hasChangeFlag(state, asImmutable)){
            isChanged = asImmutable ? state.get('isChangedByMidux') : state['isChangedByMidux'];
        } else {
            forEach(state, (item, index) => {
                if(_isChangedVerify(item)) {
                    isChanged = true;
                }
            }, asImmutable);
        }
        return isChanged;
    }
    function _setFalseFlag(state) {
        if(hasChangeFlag(state, asImmutable)) {
            state = setChangeFlag(state, false, asImmutable);
            return state;
        } else {
            return map(state, (item, key) => {
                var newState = _setFalseFlag(item);
                state = setChangeFlag(item, false, asImmutable);
                return newState;
            }, asImmutable);
        }
    }
    function _addChangeFlag(state) {
        return map(state, (item, key) => {
            if(hasChangeFlag(item, asImmutable)) {
                return item;
            } else {
                var newState = null;
                if(_isChangedVerify(item)) {
                    newState = _addChangeFlag(item);
                    newState = setChangeFlag(newState, true, asImmutable);
                } else {
                    newState = _setFalseFlag(item);
                    newState = setChangeFlag(newState, false, asImmutable);
                }
                return newState;
            }
        }, asImmutable);
    }
    return notSetAllFalse ? _addChangeFlag(state) : _setFalseFlag(state);
}
/**
* dispatch任务，执行注册回调函数
* @param {obj} action
* @param {obj} args component调用action时传入的参数
* @param {string} type action的type
* @returns {boolean} asContext 是否是context
* @returns {boolean} asImmutable 是否是Immutable
*/
var initFlag = true;
function dispatch(action, args, type, asContext, asImmutable) {
    stateStore = initFlag || !asContext ? createState(stateReducers, action, args, type, asImmutable) : stateStore;
    contextStore = initFlag || asContext ? createState(contextReducers, action, args, type, asImmutable) : contextStore;
    stateStore = addChangeFlag(stateStore, initFlag || !asContext, asImmutable);
    contextStore = addChangeFlag(contextStore, initFlag || asContext, asImmutable);
    initFlag = false;
    for(var i = 0, len = callbacks.length; i < len; i++) {
        callbacks[i](stateStore, contextStore);
    }
}
/**
* 注册state变化监听回调函数
* @param {Function} 回调函数.
* @returns {Function} 用于取消该事件监听
* callback() 触发时将回传3个参数
* @stateTree 整个stae
* @changeState 改变的那个子state
* @isChangedByMidux 原值与新值是否相等，可以用于判断是否需要更新组件
* @asContext 是否为react context
*/
function subscribe(callback) {
    var isSubscribed = true;
    if(typeof callback !== 'function') throw new Error('subscribe的参数必须为函数');
    if(callbacks.indexOf(callback) == -1) callbacks.push(callback);
    return function() {
        if(!isSubscribed) return ;
        var currIndex = callbacks.indexOf(callback);
        currIndex > -1 && callbacks.splice(currIndex, 1);
        isSubscribed = false;
    }
}
/**
* 根据reducers生成state或者context
* @param {obj} reducers
* @returns {obj} state或者context
*/
function createState(reducers, action, args, type, asImmutable) {
    return map(reducers, (item, key) => {
        return typeof item === 'object' ? createState(item, action, args, type, asImmutable) : item(action, args, type);
    }, asImmutable);
}
/**
* 更具配置文件生成state(context)和actions
* @param {obj} stateConfigs state配置文件
* @param {obj} contextConfigs context配置文件
* @param {boolean} asImmutable, state和context作为immutable
* @returns {obj} store对象
*/
function createStore(stateConfigs, contextConfigs, asImmutable) {
    if(!stateConfigs) throw new Error('createStore方法的stateConfigs参数必须传入');
    if(!checkType.isObject(stateConfigs)) throw new Error('createStore方法的stateConfigs参数必须为Object');
    if(contextConfigs && !checkType.isObject(contextConfigs)) {
        throw new Error('createStore方法的contextConfigs参数如果传入则必须为Object');
    }
    function _createStore(configs, pReducers, pActions, asContext, asImmutable) {
        if(!checkType.isObject(configs)) throw new Error('配置文件必须为Object');
        if(checkType.isLastNodeConfig(configs)) {
            var store = null;
            configs.asContext = asContext;
            configs.asImmutable = asImmutable;
            store = createActionReducer(configs, dispatch);
            pReducers[configs['stateName']] = store.reducers;
            pActions[configs['actionsName']] = store.actions;
        } else {
            for(var o in configs) {
                pReducers[o] = {};
                pActions[o] = {};
                _createStore(configs[o], pReducers[o], pActions[o], asContext, asImmutable);
            }
        }
    }
    //生成state
    _createStore(stateConfigs, stateReducers, stateActions, false, asImmutable);
    //生成context
    contextConfigs && _createStore(contextConfigs, contextReducers, contextActions, true, asImmutable);
    //转化为immutable
    if(asImmutable) {
        stateReducers = Immutable.fromJS(stateReducers);
        contextReducers = Immutable.fromJS(contextReducers);
    }
    //初始化数据
    var type = Math.random().toString(36).substr(2, 12) + new Date().getTime();
    dispatch(null, null, type, false, asImmutable);
    //返回store对象
    return {
        subscribe,
        getState,
        getStateActions,
        getContext,
        getContextActions
    }
}

export default createStore;
