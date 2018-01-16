import React, {Component} from 'react';
import showMoreIcn from '../../images/show-more.svg';
import mobilecheck from "../../helpers/helper.js";


class Listing extends Component {
    constructor(props) {
        super(props);
//        console.log(this.props.item, 'this.props.item');
    }
    ucWords = (str) =>  {
        return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
           return $1.toUpperCase();
       }); 
    }

    listClick = (e) => {
        console.log(e.currentTarget.dataset.url);
//        window.open( (this.props.item.url.indexOf("makemytrip.com") > -1 ? "" : "/detail?q=")  + e.currentTarget.dataset.url);
        window.open( (this.props.item.url.indexOf("makemytrip.com") > -1 ? "" : "")  + e.currentTarget.dataset.url);
        //TODO: on click open link in different tab
    }
    getFormatPrice = (val) => {
        if (val >= 10000000)
            val = (val / 10000000).toFixed(2) + 'Cr';
        else if (val >= 100000)
            val = (val / 100000).toFixed(2) + 'L';
        else if (val >= 1000)
            val = (val / 1000).toFixed(2) + 'K';
        return val;
    }
    getIndianFormat = (x) => {
        x = x.toString();
        var lastThree = x.substring(x.length - 3);
        var otherNumbers = x.substring(0, x.length - 3);
        if (otherNumbers !== '')
            lastThree = ',' + lastThree;
        var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
        return res;
    }
    getTopColors = () =>{
//        console.log( this.props.item.maxColor, ' this.props.item.maxColor');
//        return this.props.item.maxColor.split(",").slice(0, 3);
        return this.props.item.maxColor.replace(/^,/, '');
    }
 
    render(){
        {var src = this.props.item.url;}
        {src = src.replace("https://", "")}
        {src = src.replace("http://", "")}
        {var decLimit = mobilecheck() ? 220 : 300 }
        return (
        <div className="col-md-4 col-sm-4 hero-feature" >
            <div className="thumbnail">
                <div className="car-image-wrap"  data-url={this.props.item.url}  onClick={this.listClick}>
                    <img className="lazyload car-image" 
                         src={this.props.item.img_url}
                         data-src={this.props.item.img_url}       
                         alt={this.props.item.title} />
                    <span className="car-image-fav" data-id={'item.id'}>
                        <i className="glyphicon glyphicon-bookmark"></i>
                    </span>    
                    <span className="category-img">
                        <span className ="category-text">{this.ucWords(this.props.item.category)} </span>
                    </span>   
                    <span className="car-image-logo">
                    </span>    
                </div>
            
                <div className="caption">
                    <h3 title={this.ucWords(this.props.item.title)} data-url={this.props.item.url}  onClick={this.listClick} className= "car-title">{this.ucWords(this.props.item.title)}  </h3>
                    <p className="description">{(this.props.item.description.length > decLimit) ? this.props.item.description.substring(0, decLimit) + '...' : this.props.item.description} </p>
                    <p className="car-price">
                       <span data-url={this.props.item.url} onClick={this.listClick}  className="source-url"> { this.ucWords(this.props.item.domain)} </span>
                       <span data-url={this.props.item.url} onClick={this.listClick} className="city-span city-span-btn btn btn-success" >{this.ucWords(this.props.item.city? this.props.item.city: 'All' )}</span>
                    </p>
                    <p>
                        <a href={ (this.props.item.url.indexOf("makemytrip.com") > -1 ? "" : "") + this.props.item.url} target = "_blank" className="btn btn-outline-primary get-details">View More</a> 
                    </p>
                   
                </div>
                <div className="hideMe">
                     {""}
                </div>
            </div>
        </div>
        );
    }
}

export default Listing;

