import React from 'react';
import Header from '../common/header';
import { BsFillArrowRightSquareFill } from "react-icons/bs";
import Footer from '../common/footer';
import { ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import { upload_rules_engine_api, rules_filtered_api } from '../constants/endpoints'

export default function RulesEngine() {
    const [selectedFiles, setSelectedFiles] = React.useState([])
    const [progress, setProgress] = React.useState()
    const [rules, setRules] = React.useState(null)
    const [isUploadShow, setIsUploadShow] = React.useState(false)
    const [isProcessShow, setIsProcessShow] = React.useState(false)

    const FileDownload = require('js-file-download');

    const submitHandler = e => {
        e.preventDefault() //prevent the form from submitting
        let formData = new FormData()

        formData.append("uploaded_file", selectedFiles)
        axios.post(upload_rules_engine_api, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: data => {
                //Set the progress value to show the progress bar
                setProgress(Math.round((100 * data.loaded) / data.total))
            },
        })
    }

    const checkFile = (e) => {
        if (e.target.name == "file") {
            setSelectedFiles(e.target.files[0])
            setIsUploadShow(true)
        }
    }

    const onChangeRules = (e) => {
        console.log(e.target.value)
        if (e.target.name == "rules") {
            setRules(e.target.value)
            setIsProcessShow(true)
        }

    } 
    const handleprocessSubmit = () => {
        let payload = { "value": rules }
        axios.post(
            rules_filtered_api,
            payload
        ).then(res => {
            console.log(res)
            FileDownload(res.data, "rules_ouptut.csv")
            window.location.pathname = '/dynamic-rule-engine'
        })
    }
    return (
        <div>
            <Header />
            <div className="layout" id="main-container">
                <div>
                    <label className="functionality-title">Dynamic rules engine</label>
                </div>
                <div className="alert alert-info alert-dismissible mt-3">
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>
                    <p>
                        <i className="fa fa-info-circle fa-fw">
                        </i>
                        Upload a file and give the rules according to which you want the file to be processed.
                    </p>

                </div>
                <div className='flex width-100'>
                    <div className='width-70'>
                        <input type="file" name="file" id="rules-upload" placeholder="Upload a file" onChange={(e) => checkFile(e)} />
                        <label class="col-sm-2 control-label pull-right"><a id="next-step" class="btn btn-info pull-right" onClick={submitHandler} disabled={!isUploadShow}>Upload</a></label>
                        &nbsp;
                        {progress && <ProgressBar now={progress} label={`${progress}%`} />}

                        <div className='mt-3'>
                            <textarea name="rules" id="textarea" placeholder="Write the processing rules..." className='width-100 p-3 mr-3' onChange={(e) => onChangeRules(e)} >
                            </textarea>
                        </div>
                        <div className='buttons-section mt-3'>
                            <button type="button" className="btn btn-info mr-3" onClick={handleprocessSubmit} disabled={!isProcessShow}>Process</button>
                            {/* <button type="button" className="btn btn-success">Download</button> */}
                        </div>
                    </div>
                    <div className='result-table width-30'>
                        <table className="width-80 pull-right">
                            <thead>
                                <tr>
                                    <th>Sr.No</th>
                                    <th>Column Name</th>
                                    <th>Data Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Sample Column</td>
                                    <td>Int</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}