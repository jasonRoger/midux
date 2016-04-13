import config from './config';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import Immutable from 'immutable';
import { createStore, Provider } from '../src/index';

var store = createStore(config, config);

store.subscribe((state, context) => {
    console.log('state', state);
    console.log('context', context);
});

import ajax from '../src/utils/ajax';

ajax({
    url: '/mock/detail.json',
    success: function(data) {
        console.log('ajax', data);
    },
    error: function(err) {
        console.log(err)
    }
});

class App extends Component {
    render() {
        var state = this.props.state;
        var stateActions = this.props.actions;
        var context = this.context.context;
        var contextActions = this.context.actions;
        console.log(state)
        //<h1 onClick={stateActions.hotel.hotelActions.fetchDetail}>{state.getIn(['hotel', 'hotelInfo', 'detail'])}</h1>
        //<h1 onClick={contextActions.hotel.hotelActions.fetchDetail}>{context.getIn(['hotel', 'hotelInfo', 'detail'])}</h1>
        return (
            <div>
                <h1 onClick={stateActions.hotel.hotelActions.fetchDetail}>{state.hotel.hotelInfo.detail}</h1>
                <h1 onClick={contextActions.hotel.hotelActions.fetchDetail}>{context.hotel.hotelInfo.detail}</h1>
            </div>
        );
    }
}
App.contextTypes = {
    context: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired
}

class Root extends Component {
    render() {
        return (
          <Provider store={store}>
            { (props) => <App { ...props }/> }
          </Provider>
        );
    }
}

ReactDom.render(<Root />, document.getElementById('app'));
