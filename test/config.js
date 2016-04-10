var fetchData = require('../src/utils/fetchData');

var hotelConfig = {
    initState: { list: ['hotel1', 'hotel2'], detail: '北京大酒店好' },
    stateName: 'hotelInfo',
    actionsName: 'hotelActions',
    items: [{
        name: 'fetchList',
        action: {
            url: '/mock/list.json'
        },
        reducer: function(state, action, args) {
            return Object.assign({}, state, {
                list: action.data.list
            });
        }
    },{
        name: 'fetchDetail',
        action: function* (args) {
            var con = yield fetchData({ url: '/mock/detail.json' });
            return con;
        },
        reducer: function(state, action, args) {
            return Object.assign(state, action);
            //return state.merge(action.data);
        }
    }]
}

var flightConfig = {
    initState: { list: ['hotel1', 'hotel2'], detail: '北京机票' },
    stateName: 'flightInfo',
    actionsName: 'flightActions',
    items: [{
        name: 'fetchList',
        action: {
            url: '/mock/list.json'
        },
        reducer: function(state, action, args) {
            return Object.assign({}, state, {
                list: action.data.list
            });
        }
    },{
        name: 'fetchDetail',
        action: function* (args) {
            var con = yield fetchData({ url: '/mock/detail.json' });
            return con;
        },
        reducer: function(state, action, args) {
            //return state.merge(action.data);
            return Object.assign(state, action.data);
        }
    }]
}

//module.exports = hotelConfig;
module.exports = {
    hotel: hotelConfig
};
