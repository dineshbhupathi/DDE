import duplicates from '../static/images/Duplicates.png';
import analysis from '../static/images/Analysis.png';
import anomaly from '../static/images/Anomaly.png';
import matching from '../static/images/Matching.png';
import missing from '../static/images/Missing.png';
import rulesEngine from '../static/images/RulesEngine.png';
import React from 'react';
import Header from '../common/header';
import { BsFillArrowRightSquareFill } from "react-icons/bs";
import Footer from '../common/footer';

export default function LandingPage() {
    return (
        <div>
            <Header />

            <div className="cards-container">
                <div className="card-local text-center">
                    <a className="card-content" href="/identify-duplicates">
                        <div>
                            <div className="card-image-box">
                                <img src={duplicates} className='card-image'/>
                            </div>
                            <h2 className="card-title">Identify duplicates</h2>
                            <p className="card-text">Learns the best way to find similar rows in your data. Using cutting-edge research in machine learning it quickly and accurately identifies matches in your Excel spreadsheet or database—saving you time and cost.</p>
                        </div>
                    </a>
                </div>

                <div className="card-local text-center">
                    <a className="card-content" href="/data-analysis">
                        <div>
                            <div className="card-image-box">
                                <img src={analysis} className='card-image'/>
                            </div>
                            <h2 className="card-title">Data Analytics</h2>
                            <p className="card-text">Analyses the data quickly and provides you with a report with data analysis on all parameters, corelation etc.</p>
                        </div>
                    </a>
                </div>


                <div className="card-local text-center">
                    <a className="card-content" href="/data-matching-engine">
                        <div>
                            <div className="card-image-box">
                                <img src={matching} className='card-image'/>
                            </div>
                            <h2 className="card-title">Data Matching</h2>
                            <p className="card-text">Match or Reconcile your data using Artificial Intelligence and Machine Learning Techniques.</p>
                        </div>
                    </a>
                </div>

                <div className="card-local text-center">
                    <a className="card-content" href="/detect-anomalies">
                        <div>
                            <div className="card-image-box">
                                <img src={anomaly} className='card-image'/>
                            </div>
                            <h2 className="card-title">Anomaly Detection</h2>
                            <p className="card-text">Find anomalies in your data quickly and easily.</p>
                        </div>
                    </a>
                </div>

                <div className="card-local text-center">
                    <a className="card-content" href="/dynamic-rule-engine">
                        <div>
                            <div className="card-image-box">
                                <img src={rulesEngine} className='card-image'/>
                            </div>
                            <h2 className="card-title">Dynamic Rules Engine</h2>
                            <p className="card-text">Process and transform your data with your own dynamic rules on the fly!</p>
                        </div>
                    </a>
                </div>

                <div className="card-local text-center">
                    <a className="card-content" href="/predict-missing-values">
                        <div>
                            <div className="card-image-box">
                                <img src={missing} className='card-image'/>
                            </div>
                            <h2 className="card-title">Missing Values</h2>
                            <p className="card-text">Identify and predict missing values.</p>
                        </div>
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    );
}