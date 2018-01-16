import React from 'react';
import PropTypes from 'prop-types';
import { AsyncCreatable } from 'react-select';
import {searchCars, updateTags} from '../../actions/';
import { connect } from 'react-redux';
var sw = require('stopword');


class TagsInputBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {pageNo: 0}
        this.props.searchCars(this.props.tagsValue);
    }
    getUnique = (arr) => {
        var arrResult = {};
        for (var i = 0; i<  arr.length; i++) {
            var item = arr[i];
            arrResult[ item.id ] = item;
        }
        var i = 0;
        var nonDuplicatedArray = [];
        for (var item in arrResult) {
            nonDuplicatedArray[i++] = arrResult[item];
        }
        return nonDuplicatedArray;
    }
    onChange = (value) => {
        var ret = [];
        console.log(value, '****auto-suggeseted value***')
        if (value.length > 0) {
            var newAdded = value.splice(-1, 1)[0];
            if(newAdded.type){
                ret.push(newAdded);
            }else{
                var tmp = newAdded.label.split(' ');
                tmp = sw.removeStopwords(tmp);
                tmp = sw.removeStopwords(tmp,['visit' ,'year','blog', 'trip', 'posts', 'com',   'even', 'places','budget' , 
                                                'top', 'best', 'tale', 'under', 'tavel', 'travel', 'tourist', 'destination' 
                                                ,'famous', 'list', 'new']);
                for (var i = 0; i < tmp.length; i++) {
                    if (tmp[i]) {
                        let tmpVal = {};
                        tmpVal.id = tmp[i];
                        tmpVal.label = tmp[i];
                        ret.push(tmpVal);
                    }
                }
            }
        }
        this.props.updateTags(this.getUnique(value.concat(ret)));
        console.log('onchange is fired', ret);
    }

    componentDidUpdate = () => {
        this.props.searchCars(this.props.tagsValue, this.props.pageNo);
    }
    getUsers = (input) => {
        if (!input) {
            return Promise.resolve({options: []});
        }
        return fetch(`/api/fetchSuggestions?q=${input}`)
                .then((response) => response.json())
                .then((json) => {
                    return {options: json.items};
                });
    }

    render() {
        return (
                <div className="section">
                    <h3 className="section-heading">{this.props.label}</h3>
                    <AsyncCreatable multi={true} 
                                    value={this.props.tagsValue}
                                    onChange={this.onChange} 
                                    valueKey="id" 
                                    labelKey="label" 
                                    placeholder="&#128269; Search"
                                    loadOptions={this.getUsers} 
                                    promptTextCreator={(name) => name + ' '}
                                    backspaceRemoves={true} />
                </div>
                );
    }
}

TagsInputBar.propTypes = {
    label: PropTypes.string,
};
const mapStateToProps = (state) => {
    return {
        tagsValue: state.tagReducer.tagsValue,
        pageNo: state.tagReducer.pageNo
    }
};

const mapDispatchToProps = dispatch => {
    return {
        updateTags: (value) => {
            dispatch(updateTags(value));
        },
        searchCars: (value, pageNo) => {
            dispatch(searchCars(value, pageNo));
        }
    }
};

export default connect(
        mapStateToProps,
        mapDispatchToProps
        )(TagsInputBar);