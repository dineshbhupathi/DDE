import React, { useEffect, useState } from "react";
import axios from "axios";

import Footer from "../common/footer";
import Header from "../common/header";
import LoadingSpinner from "../common/loadingSpinner";
import { BsFillCloudDownloadFill, BsUpload, BsList, BsPencilSquare, BsFillTrashFill } from "react-icons/bs";
import { projects_api, get_project_files_api, file_download, delete_project_api, trained_data_api, active_learning_api, existing_project_training_data_api, delete_project_file_api, project_file_download_api } from '../constants/endpoints'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { upload_project_file_api } from '../constants/endpoints'
import DefaultError from "../ErrorPages/Error";
import Moment from 'moment';


export default function ProjectDetailsPage() {
    const [projectData, setProjectData] = useState([])
    const [projectName, setProjectName] = useState(null)
    const [projectFilesData, setProjectFilesData] = useState([])
    const [showDialogForm, setShowDialogForm] = useState(false)
    const [showDialogSuccess, setShowDialogSuccess] = useState(false)
    const [open, setOpen] = useState(true)
    const [payload, setPayload] = useState({ "link_project": '' })
    const [isChecked, setIsChecked] = useState(true)
    const [isLinkChecked, setIsLinkChecked] = useState(false)
    const [isError, setIsError] = useState(false)
    const theme = useTheme();
    const [loading, setLoading] = useState(false)
    const [isButtonDisable, setIsButtonDisable] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const url_id = window.location.pathname.split("/")
    const project_id = url_id[2]
    const getProjectData = () => {
        fetch(projects_api).then((res) => res.json()).then((res) => {
            console.log(res)
            let project = res.map(pr => {
                if (pr.id == project_id) {
                    return pr
                }

            })
            project.map(item => {
                if (item) {
                    console.log(item)
                    setProjectName(item.project_name)
                    setProjectData([item])
                }
            }
            )
        })
    }

    const getProjectFilesData = () => {
        fetch(get_project_files_api).then((res) => res.json()).then((res) => {
            let files = []
            res.map(item => {
                console.log(item, 'gilr')

                if (item.project === parseInt(project_id)) {
                    files.push(item)
                }
            })
            setProjectFilesData(files)
        })
    }
    useEffect(() => {

        getProjectData()
        getProjectFilesData()
    }, [])
    const handleClose = () => {
        setShowDialogForm(false)
    }
    const dialogClick = () => {
        setShowDialogForm(true)
    }
    const handleFileChange = (e) => {
        setIsButtonDisable(false)
        setPayload({ "file_name": e.target.files[0].name, "project": project_id, "uploaded_file": e.target.files[0] })
    }
    const handleSubmit = () => {
        setIsButtonDisable(true)
        setLoading(true)
        document.getElementById("upload_file_form").reset();
        if (isLinkChecked) {
            axios.post(
                upload_project_file_api,
                payload,
                {
                    headers: {
                        "Content-type": "multipart/form-data",
                    },
                }
            ).then(res => {
                console.log(res)
                window.location.pathname = `/define-fields/${res.data.id}`
            }).catch(err => {
                setIsError(true)
            })
        }
        else {
            axios.post(
                upload_project_file_api,
                payload,
                {
                    headers: {
                        "Content-type": "multipart/form-data",
                    },
                }
            ).then(res => {

                if (isChecked) {
                    let payload = { "project_id": project_id, "project_setting_file": project_id, "is_project_file": res.data.id }
                    axios.post(
                        existing_project_training_data_api,
                        payload
                    ).then(res => {
                        setShowDialogForm(false)
                        setShowDialogSuccess(true)
                        console.log(res)
                    }).catch(err => {
                        setErrorMessage('Error... Caused by training file')
                        setIsError(true)
                        setShowDialogForm(false)
                    })

                }
                else {
                    window.location.pathname = `/define-fields/file/${res.data.id}`
                    setShowDialogForm(false)

                }
            }).catch(err => {
                console.log(err)
                setIsError(true)
                setShowDialogForm(false)

            })
        }
    }
    const FileDownload = require('js-file-download');
    const onClickDownload = (e) => {
        let downloadPayload = {}
        if (e.project) {
            downloadPayload["id"] = e.project.toString() + "_" + e.id.toString()
        }
        else {
            downloadPayload["id"] = e.id
        }
        axios.post(
            file_download,
            downloadPayload
        ).then(res => {

            if (e.project_name) {
                FileDownload(res.data, e.project_name + ".csv")
            }
            else {
                FileDownload(res.data, e.file_name + ".csv")
            }
        }).catch(err => {
            console.log(err)
        })
    }

    const onClickDelete = (e) => {
        if (e.project) {
            axios.delete(
                delete_project_file_api + e.id).then(res => {
                    window.location.pathname = `/project-details-page/${project_id}`
                })
        }
        else {
            axios.delete(
                delete_project_api + e.id).then(res => {
                    window.location.pathname = `/project-details-page/${project_id}`
                })
        }

    }
    const handleCloseSuccess = () => {
        setShowDialogSuccess(false)
    }
    const onClickDashboard = () => {
        window.location.pathname = `/project-details-page/${project_id}`
    }
    const handleChange = (e) => {
        payload["link_project"] = e.target.value

    }
    const onClickEdit = (e) => {
        let payload = { "id": e.id }
        axios.post(
            trained_data_api,
            payload
        ).then(res => {
            if (res.data.message == "exits") {
                let postData = { "check_columns": [{ "field": "", "type": "String", "has missing": "" }], "project": { "id": e.id } }
                axios.post(
                    active_learning_api,
                    postData
                )
                    .then(res => {
                        console.log('Success' + res.data);
                        window.location.pathname = '/identify-duplicates'
                    })
                    .catch(err => {
                        console.log(err)

                    })
            }
            else {
                window.location.pathname = `/define-fields/${e.id}`
            }
        })
    }
    const onClickEditFile = (e) => {
        window.location.pathname = `/define-fields/file/${e.id}`
    }
    const onClickDownloadFile = (e) => {
        let payload = { "id": e.id }
        axios.post(
            project_file_download_api,
            payload
        ).then(res => {
            FileDownload(res.data, e.file_name + ".csv")
        }).catch(err => {
            console.log(err)
        })
    }
    return (
        <div>
            <Header />
            <div className="layout" id="main-container">
                <div className="flex space-between">
                    <div><h3><BsList /> {projectName}</h3></div>
                    <div><button className="btn btn-success" onClick={dialogClick}>Upload a file &nbsp; <BsUpload /></button></div>
                </div>
                <div className="mt-9">
                    {/* <table className="dataset-process-table width-100">
                        <thead>

                        </thead>
                        <tbody>
                            {
                                projectData && projectData.length > 0 && projectData.map((item) => (
                                    <tr key={item.id}>
                                        <td className="width-40">{item.project_name}</td>
                                        <td className="width-30">{item.description}</td>
                                        <td className="width-20">{item.updated_at}</td>
                                        <td className="width-10"><button className="button-bor" onClick={() => onClickEdit(item)}><a className="btn btn-warning">Re-Train Dataset &nbsp;<BsPencilSquare /></a></button></td>
                                        <td className="width-10"><button className="btn btn-info"  onClick={() => onClickDownload(item)}><a className="download-btn">Download</a>&nbsp;<BsFillCloudDownloadFill /></button></td>
                                        <td className="width-5"><button type="button" className="btn btn-danger delete-btn" onClick={() => onClickDelete(item)}><a className="download-btn"><BsFillTrashFill /></a></button></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table> */}
                    {
                        showDialogForm && (
                            <div>
                                <Dialog fullScreen={fullScreen} open={open} onClose={handleClose}>
                                    <DialogContent>
                                        <h4>
                                            Upload File
                                        </h4>
                                        <form id="upload_file_form"> <input
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                            <div className="radio">
                                                <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />

                                                &nbsp; Want to use existing training

                                            </div>
                                            <div className="radio">
                                                <input type="checkbox" checked={isLinkChecked} onChange={(e) => setIsLinkChecked(e.target.checked)} />
                                                &nbsp; Record Linkage
                                                {isLinkChecked && (
                                                    <select id="project-list" className="form-control" name='link_project' style={{ width: "100%" }} onChange={(e) => handleChange(e)}>
                                                        <option>--select a project to be linked--</option>

                                                        {
                                                            projectData.length > 0 && projectData.map((opt, i) => (
                                                                <option key={opt.id} value={opt.id}>
                                                                    {opt.project_name}

                                                                </option>
                                                            ))
                                                        }
                                                    </select>)}
                                            </div>
                                        </form>
                                        {/* <div className="radio">
                                            <input type="checkbox" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />

                                            &nbsp; merge file

                                        </div> */}
                                    </DialogContent>
                                    <DialogActions>
                                        {/* <button className="btn btn-info" onClick={handleClose}>Cancel</button> */}
                                        <button className="btn btn-info" onClick={handleSubmit} disabled={isButtonDisable}>
                                            {loading && (
                                                <i
                                                    className="fa fa-refresh fa-spin"
                                                    style={{ marginRight: "5px" }}
                                                />
                                            )}
                                            {loading && <span>Loading...</span>}
                                            {!loading && <span>Submit</span>}
                                        </button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        )
                    }
                    {
                        projectData.length > 0 && (

                            <div className="mt-9">
                                {/* <div><h3><BsList /> projectName</h3></div> */}


                                <table className="dataset-process-table width-100">
                                    <thead>
                                        <tr>
                                            <th>
                                                File Name
                                            </th>

                                            <th>
                                                Last Updates
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            projectData && projectData.length > 0 && projectData.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="width-40">{item.project_name}</td>
                                                    {/* <td className="width-30">{item.description}</td> */}
                                                    <td className="width-20">{Moment(item.updated_at).format('YYYY-MM-DD')}</td>
                                                    <td className="width-10"><button className="button-bor" onClick={() => onClickEdit(item)}><a className="btn btn-warning">Re-Train Dataset &nbsp;<BsPencilSquare /></a></button></td>
                                                    <td className="width-10"><button className="btn btn-info" onClick={() => onClickDownload(item)}><a className="download-btn">Download</a>&nbsp;<BsFillCloudDownloadFill /></button></td>
                                                    <td className="width-5"><button type="button" className="btn btn-danger delete-btn" onClick={() => onClickDelete(item)}><a className="download-btn"><BsFillTrashFill /></a></button></td>
                                                </tr>
                                            ))
                                        }
                                        {
                                            projectFilesData && projectFilesData.length > 0 && projectFilesData.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="width-40">{item.file_name}</td>
                                                    <td className="width-30">{item.updated_at}</td>
                                                    <td className="width-10"><button className="button-bor" onClick={() => onClickEditFile(item)}><a className="btn btn-warning">Re-Train Dataset &nbsp;<BsPencilSquare /></a></button></td>
                                                    <td className="width-10"><button className="btn btn-info" onClick={() => onClickDownloadFile(item)}><a className="download-btn">Download</a>&nbsp;<BsFillCloudDownloadFill /></button></td>
                                                    <td className="width-5"><button type="button" className="btn btn-danger delete-btn" onClick={() => onClickDelete(item)}><a className="download-btn"><BsFillTrashFill /></a></button></td>

                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table></div>
                        )
                    }
                </div>
                {/* dialog box */}
                {
                    showDialogSuccess && (
                        <Dialog
                            open={open}
                            onClose={handleCloseSuccess}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                                Success
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    File Successfully trained
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>

                                <Button onClick={onClickDashboard} autoFocus>
                                    Ok
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )
                }
                {
                    isError && (
                        <div>
                            <DefaultError data={errorMessage} />
                        </div>
                    )
                }
            </div>
            <Footer />
        </div>
    )
}