import co from './utils/co';
import checkType from './utils/checkType';
import { assign } from './utils/tools';
import fetchData from './utils/fetchData';
import Immutable from 'immutable';
/**
* 检查reducer的返回值是否为reducer
* @checkReducerResult
*/
function checkReducerResult(result, stateName, asImmutable) {
    if(asImmutable) {
        if (!result || !checkType.isImmutable(result)) {
          throw new Error(
            `stateName为${stateName}的配置文件对应的reducer返回值必须为Immutable`
          );
        }
    } else {
        if (!result || typeof result === 'boolean') {
          throw new Error(
            `stateName为${stateName}的配置文件对应的reducer必须有返回值且不得为null, boolean`
          );
        }
    }
}
/**
* 检查reducer的返回值是否为reducer
* @checkReducerResult
*/
function checkInitState(initState, stateName, asImmutable) {
    if(asImmutable) {
        if(!checkType.isImmutable(initState)) {
            if(!checkType.isObject(initState)) {
                throw new Error(`stateName为${stateName}的配置文件对应的initState必须为Object或者Immutable`);
            }
            initState = Immutable.fromJS(initState);
        }
    } else {
        if(!initState || !checkType.isObject(initState)) {
             throw new Error(`stateName为${stateName}的配置文件对应的initState必须为Object`);
        }
        initState = assign(true, {}, initState).data;
    }
    return initState;
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
/*
* 根据配置文件生成action reducer
* @param {Object} configs 配置文件
* @param {Funtion} triggerCallbacks state改变是执行的回调函数
* @returns {undefined} 无返回值
*/
function createActionReducer(configs, dispatch) {
    var items = configs.items,
        asContext = configs.asContext,
        currState = configs.initState,
        stateName = configs.stateName,
        asImmutable = configs.asImmutable,
        reducerStore = {},
        initFlag = true,
        actions = {};
    //检查initState的合法性
    currState = checkInitState(currState, stateName, asImmutable);
    //如果存在配置文件的嵌套，则为每一个配置文件生成的state添加一个isChangedByMidux属性，用于标识每次
    //dispatch的时候该state是否发生变化，便于后续判断是否需要更新组件
    //currState.isChangedByMidux = true;
    function reducers(action, args, type) {
        var reducer = reducerStore[type];
        if(reducer) {
            if(asImmutable) {
                var newState = reducer(currState, action, args);
                checkReducerResult(newState, stateName, asImmutable);
                currState = setChangeFlag(newState, !Immutable.is(currState, newState), asImmutable);
            } else {
                var copyState = assign({}, currState).data;
                var newState = reducer(copyState, action, args);
                checkReducerResult(newState, stateName, asImmutable);
                var resultState = assign(currState, newState);
                currState = setChangeFlag(newState, !resultState.isEqual, asImmutable);
                copyState = newState = resultState = null;
            }
        } else {
            currState = setChangeFlag(currState, initFlag, asImmutable);
        }
        initFlag = false;
        return currState;
    }
    for(var i = 0, len = items.length; i < len; i++) {
        (function() {
            var item = items[i],
                type = Math.random().toString(36).substr(2, 12) + new Date().getTime() + i;
            if(!checkType.isPlainFunction(item.reducer)) {
                throw new Error(`stateName为${stateName}的配置文件对应的reducer必须为Function`);
            }
            reducerStore[type] = item.reducer;
            actions[item.name] = function(args) {
                //如果item.action没传或者可以转化为false则直接触发dispatch
                if(!item.action) {
                    dispatch({ status: true, errmsg: '', data: args }, args, type, asContext, asImmutable);
                    return ;
                }
                //如果item.action是object则发送fetch请求
                if(checkType.isObject(item.action)) {
                    //修正url和data
                    if(!item.action.url) throw new Error(`stateName为${stateName}的配置文件对应的action配置如果为对象，则必须有url属性`);
                    item.action.data = checkType.isObject(args) ? args : {};
            		fetchData(item.action)
                    .then(function(res) {
                        dispatch({ status: true, errmsg: '', data: res }, args, type, asContext, asImmutable);
                    })
                    .catch(function(err) {
                        dispatch({ status: false, errmsg: err.errmsg, data: res }, args, type, asContext, asImmutable);
                    });
                    return ;
                }
                //如果item.action是Gernerator则自动执行
                if(checkType.isGeneratorFunction(item.action)) {
                    co(item.action, args)
                    .then(function(res) {
                        dispatch({ status: true, errmsg: '', data: res }, args, type, asContext, asImmutable);
                    })
                    .catch(function(err) {
                        dispatch({ status: true, errmsg: err.errmsg, data: err }, args, type, asContext, asImmutable);
                    });
                    return ;
                }
                //如果item.action是function则自动执行
                if(checkType.isPlainFunction(item.action)) {
                    dispatch({ status: true, errmsg: '', data: item.action(args) }, args, type, asContext, asImmutable);
                    return ;
                }
                //出入的action非法则抛出异常
                throw new Error(`stateName为${stateName}的配置文件对应的action配置可以不传，传则必须是false, Generator, function, 或者包含url等属性的对象`);
            }
        })(i);
    }
    return {
        actions,
        reducers
    }
}

export default createActionReducer;
