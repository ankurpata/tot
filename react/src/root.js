import React from 'react';
import ReactDOM, { render } from 'react-dom';
import PropTypes from 'prop-types'
import { Provider } from 'react-redux';
import App from './components/App';
import DetailComponent from './components/containers/DetailComponent';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './store/configureStore';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
    <Switch>
        <Route exact path="/detail" component={DetailComponent} />
        <Route exact path="*" component={App} />
    </Switch>
    </Router>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.object.isRequired
}

export default Root