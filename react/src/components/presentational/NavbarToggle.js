import React from 'react';

import logo from '../../images/4.png';
import logoR from '../../images/logo.svg';
import { Navbar , Nav, NavItem} from 'react-bootstrap';
import TagsInputBar from '../containers/TagsInputBar';


   var onSelect = (link) => {
        console.log(link, 'link');
        window.open(link);
    }
const NavbarToggle = () => {
return (
        <Navbar inverse collapseOnSelect>
            <Navbar.Header>
                <Navbar.Brand>
                    <a href="http://www.taleoftravels.com/">   
                       <img className ="img-responsive" src={logo}  /> 
                    </a>
                </Navbar.Brand>
                <Navbar.Toggle />
            </Navbar.Header>
            <div className="search-bar-div">
                <TagsInputBar creatable="true"/>
            </div>
            <Navbar.Collapse>
                <Nav pullRight>
                    <NavItem  onClick={() => onSelect('http://taleoftravels.com/about/#about-us')} eventKey={1} >About </NavItem>
                    <NavItem  onClick={() => onSelect('http://taleoftravels.com/about/#contact-us')} eventKey={3} >Submit</NavItem>
                    <NavItem  onClick={() => onSelect('http://taleoftravels.com/about/#more-about')} eventKey={2} >More</NavItem>
                </Nav>
            </Navbar.Collapse>

        </Navbar>
        );
};
      
export default NavbarToggle;
