import Provider from './Provider';
import createStore from './createStore';
import fetchData from './utils/fetchData';
import { assign } from './utils/tools';

var utils = {
    fetchData: fetchData,
    assign: function() {
        return assign.apply(null, arguments).data;
    }
};

export {
    createStore,
    Provider,
    utils
}
