import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { data_analytics_projects_api,data_analytics_report_api } from '../constants/endpoints'
import { BsUpload, BsList, BsFillTrashFill } from "react-icons/bs";
import Footer from "../common/footer";
import Header from "../common/header";

export default function DataAnalysis() {
    const [projectData, setProjectData] = useState([])
    const navigate = useNavigate();

    const getProjectData = () => {
        fetch(data_analytics_projects_api).then((res) => res.json()).then((res) => {
            setProjectData(res)
        })
    }
    const FileDownload = require('js-file-download');

    const onClickOpen = (e) => {
        let payload = { "id": e.id }
        console.log(payload)
        axios.post(
            data_analytics_report_api,
            payload
        ).then(res => {
            console.log(res.data)
            FileDownload(res.data, e.project_name + ".html")
        })

    }

    useEffect(() => {
        getProjectData()
    }, [])

    return (
        <div>
            <Header />
            <div className="layout" id="main-container">
                <div>
                    <label className="functionality-title">Data Analytics</label>
                </div>  
                <div className="flex space-between">
                    <div><h3><BsList /> Projects</h3></div>
                    <div><a href="/upload-data-analysis/"><button className="btn btn-success">Upload &nbsp; <BsUpload /></button></a></div>
                </div>
             <div>
        </div>
        <div className="mt-9">
            <table className="dataset-process-table width-100">
                <thead>
                    <tr>
                        <th>
                            Id
                        </th>
                        <th>
                            File Name
                        </th>
                        
                    </tr>
                </thead>
                <tbody>
                    {
                        projectData && projectData.length && projectData.map((item) => (
                            <tr key={item.id}>
                                <td className="width-2">{item.id}</td>
                                <td className="width-100">{item.project_name}</td>
                                <td className="width-5" onClick={() => onClickOpen(item)}><button type="button" className="btn btn-danger delete-btn"><a className="download-btn" type="_blank">Report</a></button></td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

        </div>

    </div>
    <Footer />
</div>


    )

}