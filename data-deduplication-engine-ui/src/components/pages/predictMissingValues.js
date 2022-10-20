
import { BsFillArrowRightSquareFill } from "react-icons/bs";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { data_missing_values_upload_api,data_missing_values_download_api } from '../constants/endpoints'
import { BsUpload, BsList, BsFillTrashFill } from "react-icons/bs";
import Footer from "../common/footer";
import Header from "../common/header";


export default function MissingValues() {
    const [file, setFile] = useState(null)
    const [isShowProcess, setIsShowProcess] = useState(false)

    useEffect(() => {
        // document.getElementById("process-button").disabled = true;
    });

    // post
    const FileDownload = require('js-file-download');


    const processFiles = () => {
        const payload = { "uploaded_file1": file }
        console.log(payload)
        axios.post(
            data_missing_values_upload_api,
            payload,
            {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            }

        ).then(res => {
            console.log(res)
            let downloadPayload = {"file": res.data.files[0]}
            axios.post(
                data_missing_values_download_api,
                downloadPayload

            ).then(res => {
                FileDownload(res.data, "missingvalues.csv")
                window.location.pathname = '/predict-missing-values'
            }).catch(err => {
                console.log(err)
            })
        }).catch(err => {
            console.log(err)
        })
    }


    const checkFile = (e)=>{
        // console.log("did checkFile")
        // if (document.getElementById("file").files.length === 0) {
        //     document.getElementById("process-button").disabled = true;
        //   }
        //   else{
        //     document.getElementById("process-button").disabled = false;
        //   }
        if (e.target.name == "file") {
            setFile(e.target.files[0])
            setIsShowProcess(true)
        }
    }
    return (
        <div>
            <Header/>
            <div className="layout" id="main-container">
                <div>
                    <label className="functionality-title">Predict missing values</label>
                </div>  
                <div className="alert alert-info alert-dismissible mt-3">
                                <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
                                <p>
                                <i className="fa fa-info-circle fa-fw">
                                </i> 
                                Select a .csv or excel file and can predict the missing values in a column 
                                </p>

                </div>
                <div className="choose-file-container space-between">
                <div className="flex">
                    <span className="required">*</span>
                    <input type="file" name="file" id="file" className="ml-3" placeholder="Please select a file" onChange={(e) => checkFile(e)} />
                    
                </div>
                    
                    <div>
                        <button className="btn btn-info" disabled={!isShowProcess} onClick={processFiles}>Process</button>
                    </div>
                </div>
                
            </div>
            <Footer/>
        </div>
    );
}