import React from 'react';
        import logoF from '../../images/4.png';
        const Footer = () => {
return (
<div>
    <footer className="footer-distributed">
        <div className="footer-left">

            <h3>
                <div className="footer-logo-div">
                    <img className="img-responsive footer-logo"  src={logoF} />
                </div>
                <p className="footer-company-about">
                    TaleofTravels is a single destination to search all the best travel blogs from across the sites.<br/>
                    TRAVEL | FOOD | FASHION
                </p>

            </h3>

            <p className="footer-company-name">TaleofTravels &copy; 2017</p>
        </div>

        <div className="footer-center">

            <div>
                <i className="fa fa-map-marker"></i>
                <p> Crafted with <span className="love-glyph"><i className="glyphicon glyphicon-heart"></i></span> in Gurgaon.</p>
            </div>
                
{/*
            <div>
                <i className="fa fa-envelope"></i>
                <p><a href="mailto:info@motorsingh.com">info@motorsingh.com</a></p>
            </div>
*/}
        </div>

        <div className="footer-right">
            <p className="footer-links">
                <a className= "disabled-tmp" href="../about/terms_and_conditions.html" target="_blank">Terms & Conditions</a>
                ·
                <a  className= "disabled-tmp" href="../about/privacy.html" target="_blank">Privacy</a>

            </p>
            <p className="footer-links">
                <a  href="http://taleoftravels.com/about/#about-us" target="_blank">About</a>
                ·
                <a  href="http://taleoftravels.com/about/#contact-us" target="_blank">Submit Blog</a>
                ·
                <a  href="http://taleoftravels.com/about/#more-about" target="_blank">More</a>
            </p>
            <div className="footer-icons">

                <a href="https://www.facebook.com/taleoftravels/" target="_blank"><i className="fa fa-facebook-square"></i></a>
                <a href="https://twitter.com/taleoftravels" target="_blank" ><i className="fa fa-twitter-square"></i></a>
                { /*<a href="https://in.pinterest.com/taleoftravels_/" target="_blank"><i className="fa fa-pinterest-square"></i></a> */}
                <a href="https://www.instagram.com/taleoftravels_/" target="_blank" ><i className="fa fa-instagram"></i></a>

            </div>

        </div>

    </footer>
</div>
        );
};
        export default Footer;

