import React, { useEffect, useState } from "react";
import Header from "../common/header";
import { data_matching_columns_api,data_analytics_matching_file_download } from '../constants/endpoints';
import { MultiSelect } from "react-multi-select-component";
import axios from "axios";


export default function MatchingEngineDefineColumns() {
    const [file1Columns, setFile1Columns] = useState([]);
    const [file2Columns, setFile2Columns] = useState([]);
    const [selectedFile1Columns, setSelectedFile1Columns] = useState([]);
    const [selectedFile2Columns, setSelectedFile2Columns] = useState([]);
    const [file1, setFile1] = useState("");
    const [file2, setFile2] = useState("");

    const getColumnsData = () => {
        fetch(data_matching_columns_api).then((res) => res.json()).then((res) => {
            let construtList = []
            let construtList2 = []
            res.file_1_columns.map(
                item => {
                    let construtDic = {}
                    construtDic["label"] = item
                    construtDic["value"] = item
                    construtList.push(construtDic)
                    return construtList
                }
            )
            res.file_2_columns.map(
                item => {
                    let construtDic = {}
                    construtDic["label"] = item
                    construtDic["value"] = item
                    construtList2.push(construtDic)
                    return construtList2
                }
            )
            setFile1Columns(construtList)
            setFile2Columns(construtList2)
            setFile1(res.file1)
            setFile2(res.file2)
        })
    }
    const FileDownload = require('js-file-download');

    const handleSubmit = () =>{
        let file1Columns = selectedFile1Columns.map(item=>item.value)
        let file2Columns = selectedFile2Columns.map(item=>item.value)
        console.log(file1Columns,file2Columns,file1,file2)
        let constuctPayload = {
            "file_1_columns":file1Columns,
            "file_2_columns":file2Columns,
            "file1": file1,
            "file2":file2
        }
        axios.post(
            data_analytics_matching_file_download,
            constuctPayload
        ).then(
            res =>{
                FileDownload(res.data, "datamatching.csv")
                window.location.pathname = '/data-matching-engine'

            }
        ).catch(err=>
            console.log(err))
    }
    useEffect(() => {
        getColumnsData()
    }, [])

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
                        Choose Columns
                    </p>

                </div>
                <div style={{width: "40%",display:"inline-block"}}>
      <MultiSelect
        options={file1Columns}
        value={selectedFile1Columns}
        onChange={setSelectedFile1Columns}
        labelledBy="Select"
      />
      </div> &nbsp;
      <div style={{width: "40%",display:"inline-block"}}>
      <MultiSelect
        options={file2Columns}
        value={selectedFile2Columns}
        onChange={setSelectedFile2Columns}
        labelledBy="Select"
      />
      </div> &nbsp;
      <div style={{width: "10%",display:"inline-block"}}>
                            <button className="btn btn-info" onClick={handleSubmit}>Process</button>
                        </div>
                    </div>
                    
        </div>
    )
}