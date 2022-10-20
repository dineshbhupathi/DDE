import React from 'react';
import Header from '../common/header';
import { BsFillArrowRightSquareFill } from "react-icons/bs";
import Footer from '../common/footer';

export default function DetectAnomalies() {
    return (
        <div>
            <Header/>
            <div className="layout" id="main-container">
                <div>
                    <label className="functionality-title">Detect anomalies</label>
                </div>  
            </div>
            <div>
                <div className="">
                    <input type="button" className="btn btn-success">Detect</input>
                </div>
            </div>
            <Footer/>
        </div>
    );
}