import React, { useEffect, useState } from "react";
import axios from "axios";
import ProjectFileFieldComponent from "./projectFilesFieldComponent";
import { useNavigate } from "react-router-dom";
import { active_learning_link_api, project_file_active_learning_api, read_csv_file_api } from '../../constants/endpoints'
import ProjectFileTrainModel from "./projectTrainModel";
import Footer from "../../common/footer";
import Header from "../../common/header";
import { Snackbar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import 'font-awesome/css/font-awesome.min.css';

export default function ProjectFilesDefineColumns() {
    let [formRows, setFormRows] = useState({
        check_columns: [
            { "field": "", "type": "", "has missing": false }
        ]
    });
    const [activeData, setActiveData] = useState([])
    const [isPostedData, setIsPostedData] = useState(false)
    const [projectData, fetchProjectData] = useState([])
    const [nextButtonEnable, setNextButtonEnable] = React.useState(true)
    const [isSnack, setIsSnack] = React.useState(false)
    const [snackOpen, setSnackOpen] = React.useState(true)
    console.log(activeData, 'ls')


    const [open, setOpen] = React.useState(false)

    const handleNextSubmit = (e) => {
        const url_id = window.location.pathname.split("/")
        const project_id = url_id[3]
        e.preventDefault()
        let updateFormRows = { ...formRows, project: { "id": project_id } }
        console.log(updateFormRows)
        let fil = updateFormRows.check_columns.filter(r => r.field2)
        if (fil.length != 0) {
            axios.post(
                active_learning_link_api,
                updateFormRows,
                {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                }
            ).then(res =>
                setActiveData(res.data),
                setIsPostedData(true)
            ).catch(err => {
                console.log(err)
            }
            )
        }
        else {
            axios.post(
                project_file_active_learning_api,
                updateFormRows,
                {
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    },
                }
            )
                .then(res =>
                    setActiveData(res.data),
                    setIsPostedData(true)
                ).catch(err => {
                    console.log(err)
                }
                )
            console.log(activeData, 'aa')
        }

    }

    const increaseField = () => {
        const formRowsInfo = formRows.check_columns
        formRowsInfo.push({
            "field": "", "type": "", "has missing": false
        })
        setFormRows({ check_columns: [...formRowsInfo] })
    }

    const handleFormData = (event, rowIndex) => {
        const { name, value } = event.target
        if (name == 'field2') {
            let rows = [...formRows.check_columns]

            let updatedRowData = { ...rows[rowIndex], "field": { [name]: value } }
            rows[rowIndex] = updatedRowData
            setFormRows({ check_columns: [...rows] })
        }
        let rows = [...formRows.check_columns]

        let updatedRowData = { ...rows[rowIndex], [name]: value }
        rows[rowIndex] = updatedRowData
        setFormRows({ check_columns: [...rows] })
        if (formRows.check_columns[0]['field']!='' && formRows.check_columns[0]['type']!=''){
            setNextButtonEnable(false)
        }

    }

    const url_id = window.location.pathname.split("/")
    const project_id = url_id[3]

    const getData = () => {
        fetch(read_csv_file_api + project_id).then((res) => res.json()).then((res) => {
            fetchProjectData(res.project)
        })
    }
    const handleDeleteRow = (e) =>{
        var array = formRows.check_columns
        delete array[e.target.id]
        const filteredArray = array.filter(item=> item != 'undefined')
        setFormRows({check_columns: [...filteredArray]})
    }

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnack(false)
    }
   const action = (
        <React.Fragment>
            <IconButton
                size='large'
                aria-label='close'
                color='inherit'
                onClick={handleSnackClose}
            >
                <CloseIcon fontsize="large" />
            </IconButton>
        </React.Fragment>
    )

    useEffect(() => {
        getData()
    }, [])
    return (
        <div>
            {!isPostedData ? <React.Fragment><Header />

                <div className="container" id="main-container">

                    <div className="row">
                        <div className="col-md-12">
                            <ul className="nav nav-wizard">
                                <li className=" active ">1. choose columns</li>
                                <li className="">1. Train Model</li>
                            </ul>
                            <h3>Choose Columns</h3>
                        </div>
                        <div className="col-md-12">
                            <p><strong>Select the columns in your data that contain duplicates or information that helps identify duplicates.</strong> We recommend choosing more than one column for Data Quality Platform to compare.</p>
                            <div className="alert alert-info alert-dismissible">
                                <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>



                                <p><i className="fa fa-info-circle fa-fw"></i> Some columns help Data Quality Platform decide whether records belong together better than others. To pick the most helpful columns for Dedupe.io, think about what columns you would use to judge whether two rows are the same.</p>


                            </div>

                            <form role="form" method="post" onSubmit={handleNextSubmit}>
                                <div id="field_wrapper">
                                    {
                                        formRows.check_columns.map((elementInArray, index) => (
                                            <ProjectFileFieldComponent key={index} rowIndex={index} handleChange={handleFormData} handleDelete={handleDeleteRow} />
                                        ))
                                    }
                                </div>
                                <p>
                                    <button className="btn btn-info btn-sm" type="button" onClick={increaseField}>
                                        <i className="fa fa-plus-circle"> Add another column</i>
                                    </button>
                                </p>
                                <div className='clearfix'></div>
                                <button className="btn btn-info pull-right" id="next" disabled={nextButtonEnable}>
                                    Next »
                                </button>
                            </form>
                        </div>
                    </div>
                    <Footer />
                    </div></React.Fragment> :
                <div>
                    <ProjectFileTrainModel data={activeData} />
                </div>
            }
            {
                isSnack && (
                    <div>
                        <Snackbar 
                        open={snackOpen}
                        autoHideDuration={6000}
                        onClose={handleSnackClose}
                        message="Error Occured"
                        action={action}
                        
                        />
                    </div>
                )
            }
        </div>
    )
}