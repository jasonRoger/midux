import { PropTypes } from 'react'

export default PropTypes.shape({
    subscribe: PropTypes.func.isRequired,
    getState: PropTypes.func.isRequired,
    getStateActions: PropTypes.func.isRequired,
    getContext: PropTypes.func.isRequired,
    getContextActions: PropTypes.func.isRequired
});
