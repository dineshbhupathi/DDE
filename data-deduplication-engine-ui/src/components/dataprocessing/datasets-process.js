import React, { useEffect, useState } from "react";
import axios from "axios";
import statelogo from '../static/images/dqp.JPG';
import { useNavigate } from "react-router-dom";
import { projects_api, file_download,delete_project_api,trained_data_api,active_learning_api } from '../constants/endpoints'
import { BsFillCloudDownloadFill,BsUpload,BsList,BsPencilSquare,BsFillTrashFill } from "react-icons/bs";
import Footer from "../common/footer";
import Header from "../common/header";
import LoadingSpinner from "../common/loadingSpinner";

export default function DatasetsProcess() {
    const [projectData, setProjectData] = useState([])
    const [compareProjectData, setCompareProjectData] = useState([])
    const [isLoading, setIsLoading]= useState(false)
    console.log(isLoading)
    const navigate = useNavigate();

    const getProjectData = () => {
        fetch(projects_api).then((res) => res.json()).then((res) => {
            setProjectData(res)
            let data = res.filter(
                (r) => r.data_check == 'compare_data'
            );
            setCompareProjectData(data)
        })
    }
    const FileDownload = require('js-file-download');
    const onClickDownload = (e) => {
        let payload = { "id": e.id }
        axios.post(
            file_download,
            payload
        ).then(res => {
            FileDownload(res.data, e.project_name + ".csv")
        }).catch(err => {
            console.log(err)
        })
    }

    const onClickDelete = (e) =>{
        axios.delete(
            delete_project_api+e.id       ).then(res=>{
                window.location.pathname = "/"
        })

    }

    const onClickEdit = (e)=>{
        let payload = {"id": e.id}
        setIsLoading(true)
        axios.post(
            trained_data_api,
            payload
        ).then(res=>{
            if (res.data.message=="exits"){
                let postData = {"check_columns":[{"field":"","type":"String","has missing":""}],"project":{"id":e.id}}
                axios.post(
                    active_learning_api,
                    postData
                )
                .then(res =>{
                    console.log('Success'+ res.data);
                    window.location.pathname = '/identify-duplicates'
                })
                .catch(err=>{    
                    console.log(err)
    
                })
            }
            else{
                navigate(`/define-fields/${e.id}`)
            }
        })
    }

    useEffect(() => {
        getProjectData()
    }, [])

    return (
        <div>
            {isLoading?<React.Fragment><LoadingSpinner/></React.Fragment>:
        <div>
            
            <Header />
            <div>
                 {
                    compareProjectData && compareProjectData.length>0 && compareProjectData.map((data) => (
                        <div className="container-fluid block">
                            <div className="alert alert-success space-between">
                                <p>
                                    <i className="fa fa-clock-o"></i><strong>{data.project_name}</strong> is now ready for matching &nbsp;<a href="/upload-data/"><i className="fa fa-arrow-circle-up"></i> upload another dataset</a>
                                </p>
                                <div className="close-button">
                                    X
                                </div>
                            </div>
                        </div>
                    )
                    )

                }
            </div>
            <div className="layout" id="main-container">
                <div>
                    <label className="functionality-title">Identify Duplicates</label>
                </div>  
                <div className="flex space-between">
                    <div><h3><BsList /> Projects</h3></div>
                    <div><a href="/upload-data/"><button className="btn btn-success">Create a project &nbsp; <BsUpload /></button></a></div>
                </div>
                <div className="mt-9">
                    <table className="dataset-process-table width-100">
                        <thead>
                            <tr>
                                <th>
                                    Project Name
                                </th>
                                <th>
                                    Description
                                </th>
                                <th>
                                    Last Updates
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                projectData && projectData.length && projectData.map((item) => (
                                    <tr key={item.id}>
                                        <td className="width-40"><a href={`/project-details-page/${item.id}`}>{item.project_name}</a></td>
                                        <td className="width-30">{item.description}</td>
                                        <td className="width-20">{item.updated_at}</td>
                                        {/* <td className="width-10" onClick={() => onClickEdit(item)}><button className="button-bor"><a className="btn btn-warning">Re-Train Dataset &nbsp;<BsPencilSquare /></a></button></td>
                                        <td className="width-10" onClick={() => onClickDownload(item)}><button className="btn btn-info"><a className="download-btn">Download</a>&nbsp;<BsFillCloudDownloadFill /></button></td>
                                        <td className="width-5" onClick={() => onClickDelete(item)}><button type="button" className="btn btn-danger delete-btn"><a className="download-btn"><BsFillTrashFill /></a></button></td> */}

                                    </tr>
                                ))
                            }
                        </tbody>     
                    </table>

                </div>

            </div>
            <Footer />

        </div>
}
        </div>
            

    )

}