import React, { useEffect, useState } from "react";
import '../css/spinner.css';
import statelogo from '../static/images/logo.png';
import Header from "./header";

export default function LoadingSpinner() {
    return (
        <div>
            <Header />
            
            <div className="layout" id="main-container">
            <div className='row'>
                <div>
                <div className="col-md-12">

                {/* <ul className='nav nav-wizard'>
                                    <li className=''>1. Choose columns</li>
                                    <li className='active'>2. Train model</li>
                                   
                                </ul> */}

                                <div className="spinner-container">
                                <div  className="loader">Loading...</div>
                                    <div><p>Loading... <br></br>please wait until we process your request</p></div>
                                </div>
                </div>
                </div>
            </div>
            </div>
        </div>

    )
}