import React from 'react'

const Loader = ({show_loader}) => {
    return (
            <div className={(show_loader == true) ? "loader" : ""}></div>
            );
};

export default Loader;

