import { Component, Children, PropTypes } from 'react';
import storeShape from './storeShape';

export default class Provider extends Component {
    constructor(props, context) {
        var store = props.store;
        super(props, context);
        this.store = store;
        this.stateActions = store.getStateActions();
        this.contextActions = store.getContextActions();
        this.unsubscribe = store.subscribe(this.handleChange.bind(this));
        this.state = {
            stateStore: store.getState(),
            contextStore: store.getContext()
        };
    }
    getChildContext() {
        return { context: this.state.contextStore, actions: this.contextActions };
    }
    handleChange(stateStore, contextStore) {
        if(!this.unsubscribe) return;
        this.setState({
            stateStore: stateStore,
            contextStore: contextStore
        });
    }
    render() {
        return this.props.children({ state: this.state.stateStore, actions: this.stateActions });
    }
}

Provider.propTypes = {
    store: storeShape.isRequired,
    children: PropTypes.func.isRequired
}
Provider.childContextTypes = {
    context: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
