import React, { Component } from 'react';
import Header from '../presentational/Header';
import Loader from '../presentational/Loader';
import Footer from '../presentational/Footer';
import SimilarLinks from '../presentational/SimilarLinks';
import GuideBarContainer from './GuideBarContainer';
import SliderBarContainer from './SliderBarContainer';
import BodyContainer from './BodyContainer';
import fetch from 'isomorphic-fetch';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';
import {searchCars, getParamsFromUrl} from '../../actions/';
var sw = require('stopword');

class MainComponent extends Component {
    componentWillMount = () => {
        ReactGA.initialize('UA-109689023-1'); //Unique Google Analytics tracking number
        ReactGA.pageview(window.location.pathname);

        var url =  window.location.pathname;
        var arr = url.split("/");
        var b = {};
        b = arr[1].split("-");
        b = sw.removeStopwords(b);
        b = sw.removeStopwords(b, ['package', 'getaways','net','com' , 'dot',  'getaway','eat','weekend', 'what',  'itinerary' ,'packages', 'pack','fun', 'tales','sand','visit','tour','pack', 'term', 'tips', 'common' , 'parties','bag','long','cheap', 'popular','add','things', 'to', 'do' ,  'year', 'blog', 'blogs',  'trip', 'posts', 'com',   'even', 'places','budget' , 
                                'top','girl', 'girls', 'celebrate', 'celebration' , 'best', 'tale', 'under', 'tavel', 'travel', 'tourist', 'destination' 
                                ,'famous', 'list', 'new']);
            
        var items = [];
        for (var i = 0; i < b.length; i++) {
            b[i] = b[i].replace(/[0-9]/g, "");
            if (b[i] === 'newcars' || (!b[i]) || b[i] === '#') {
                continue;
            }
            var item = {};
            item['label'] = b[i];
            item['id'] = b[i];
            item['type'] = '';
            items.push(item);
        }
        if (items.length) {
            
            this.props.getParamsFromUrl(items);
        }
    }
    componentDidUpdate = () => {
        if(this.props.scrollToTop ){ 
            document.body.scrollTop = 0;
            window.scrollTo(0, 0);
        }
    }
    render() {
        return (<div>
            <Header searchTerm = 'asdfa'>
            </Header>
            <GuideBarContainer />
          {  /*
            <SliderBarContainer />
            */
          }
            <Loader show_loader = {this.props.show_loader}/>
            <BodyContainer />
            <SimilarLinks similarLinks = {this.props.similarLinksData}/>
            <Footer />
        </div>
                );
    }

}
const mapStateToProps = (state) => {
    return {
        hasErrored: state.hasErrored.hasErrored,
        similarLinksData: state.similarLinksData.similarLinksData,
        scrollToTop: state.listingReducer.scrollToTop,
        show_loader: state.loaderReducer.show_loader
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getParamsFromUrl: (value) => {
            dispatch(getParamsFromUrl(value))
        }
    }
}

export default connect(
        mapStateToProps,
        mapDispatchToProps
        )(MainComponent);
