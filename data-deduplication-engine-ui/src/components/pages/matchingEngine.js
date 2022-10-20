import React, { useEffect, useState } from "react";
import Header from '../common/header';
import Footer from '../common/footer';
import { data_analytics_matching_files } from '../constants/endpoints';
import axios from "axios";

export default function MatchingEngine() {

    useEffect(() => {
    });
    const [firstFile, setFirstFile] = useState(null);
    const [secondFile, setSecondFile] = useState(null);
    const [isShowProcess, setIsShowProcess] = useState(false)
    // const FileDownload = require('js-file-download');


    const processFiles = () => {
        const payload = { "uploaded_file1": firstFile, "uploaded_file2": secondFile }
        console.log(payload)
        axios.post(
            data_analytics_matching_files,
            payload,
            {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            }

        ).then(res => {
            console.log(res)
            window.location.pathname='/data-matching-engine-define-columns'
            // let downloadPayload = {"file1": res.data.files[0],"file2":res.data.files[1]}
            // axios.post(
            //     data_analytics_matching_file_download,
            //     downloadPayload

            // ).then(res => {
            //     console.log(res.data)
            //     FileDownload(res.data, "datamatching.csv")
            //     // window.location.pathname = '/data-matching-engine'
            // }).catch(err => {
            //     console.log(err)
            // })
        }).catch(err => {
            console.log(err)
        })
    }

    const checkFile = (e) => {
        console.log(e)
        if (e.target.name === "first_file") {
            setFirstFile(e.target.files[0])
        }
        if (e.target.name === "second_file") {
            setSecondFile(e.target.files[0])
            setIsShowProcess(true)
        }
        

        if (document.getElementById("firstFile").files.length === 0 || document.getElementById("secondFile").files.length === 0) {
            document.getElementById("process-button").disabled = true;
            setFirstFile(document.getElementById("firstFile").files[0]);
            setSecondFile(document.getElementById("secondFile").files[0]);
        }
        else {
            document.getElementById("process-button").disabled = false;
        }
    }
    return (
        <div>
            <Header />
            <div className="layout" id="main-container">
                <div>
                    <label className="functionality-title">Data Matching Engine</label>
                </div>
                <div className="alert alert-info alert-dismissible mt-3">
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
                    <p>
                        <i className="fa fa-info-circle fa-fw">
                        </i>
                        Select two files
                    </p>

                </div>
                <div className="choose-file-container">
                    <div className="space-between">
                        <p>Please select the First File</p>
                        <div className='flex'>
                            <span className="required">*</span>
                            <input type="file" name="first_file" id="firstFile" className="ml-3" placeholder="Select the first file" onChange={(e) => checkFile(e)} />
                        </div>

                    </div>
                    <div className="mt-3 space-between">
                        <p>Please select the Second File</p>
                        <div className='flex'>
                            <span className="required">*</span>
                            <input type="file" name="second_file" id="secondFile" className="ml-3" placeholder="Select the second file" onChange={(e) => checkFile(e)} />
                        </div>

                    </div>

                    <div className='flex space-between mt-3'>
                        <button className="btn btn-success hidden">Download</button>
                        <div>&nbsp;</div>
                        <div className="flex-end">
                            <button className="btn btn-info" disabled={!isShowProcess} onClick={processFiles}>Process</button>
                        </div>

                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}