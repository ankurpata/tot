import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { connect } from 'react-redux';

import Iframe from 'react-iframe';

class DetailComponent extends Component {
    componentWillMount = () => {
        ReactGA.initialize('UA-109689023-1'); //Unique Google Analytics tracking number
        ReactGA.pageview(window.location.pathname);
        console.log(this.props.location.search);
    }
    render() {
        var sq= this.props.location.search;
        var url= sq.replace("?q=" , "");
        return (<div>
                    <link rel="shortcut icon" type="image/png"  href="<?php echo base_url(); ?>images/favicon23.png"/>
                    <meta name="robots" content="noindex" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                   <Iframe url={url}
                        position="absolute"
                        width="100%"
                        id="myId"
                        className="iframe-cmp"
                        height="100%"
                        styles={{height: "100%"}}
                        allowFullScreen/>
               </div>
                );
    }

}
const mapStateToProps = (state) => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
    }
}

export default connect(
        mapStateToProps,
        mapDispatchToProps
        )(DetailComponent);
