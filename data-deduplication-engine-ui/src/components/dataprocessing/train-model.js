import React, { useEffect, useState } from "react";
import axios from "axios";
import statelogo from '../static/images/logo.png';
import LoadingSpinner from '../common/loadingSpinner';
import { read_csv_api, projet_data_check_api, active_training_api, active_training_link_api } from '../constants/endpoints'
import '../css/bootstrap-nav-wizard.css';
import '../css/bootstrap.simplex.min.css';
import '../css/custom.css';
import '../css/dataTables.bootstrap.css';
import '../css/select2.min.css';
import Footer from "../common/footer";
import Header from "../common/header";
import DefaultError from "../ErrorPages/Error";
// import Snackbar from '@mui/material';
// import MuiAllert from '@mui/material';

// const Alert= React.forwardRef(function Alert(props, ref) {
//     return <MuiAllert elevation={6} ref={ref} variant="filled" {...props} />;
// });
export default function TrainModel(props) {
    const [isOpenError, setIsOpenError] = useState(false)
    const { data } = props

    const [selectedTrainedData, setSelectedTrained] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [columns, setColumns] = useState([])
    const [finalSelectedData, setFinalSelectedData] = useState([])
    const [yesData, setYesData] = useState(0);
    const [noData, setNoData] = useState(0);
    const [isLoading, setIsLoading] = useState(false)
    const [disableButton, setDisableButton] = useState(false)
    const [projectData, fetchProjectData] = useState([])
    const [isCompareData, setIsCompareData] = useState(false)
    const [isShowButton, setIsShowButton] = useState(false)
    // const [fieldRos, setFieldRows]= useState([])
    const [selectedTrainingRow, setSelectedTrainingRow] = useState([])
    const getTrainModelInfo = () => {
        if (data.length > 0) {
            const fieldColumns = data[0].columns
            setColumns(fieldColumns)
            // const trainingRows = data.filter((intem, index)=>index !==0)
            // setFieldRows(trainingRows)
            getSelectedRows(selectedIndex)
        }
    }
    const getSelectedRows = (index, type = 'y') => {
        const trainingRows = data.filter((item, index) => index !== 0)
        setSelectedTrainingRow(trainingRows[index])
        const totalSelectedRows = [...selectedTrainedData]
        const selectedRowsDefault = totalSelectedRows[index + 1].map(item => ({ ...item, user_input: type }))
        totalSelectedRows[index + 1] = [...selectedRowsDefault]
        setSelectedTrained(totalSelectedRows)
        setFinalSelectedData(totalSelectedRows)
        setSelectedTrainingRow(trainingRows[index + 1])

    }
    console.log(finalSelectedData, 'final')

    const onClickAction = (type = 'y') => {
        console.log(yesData, noData)
        if (yesData >= 9 & noData >= 9) {
            setIsShowButton(true)
        }
        if (type === "y") {
            if (yesData !== 0) {
                console.log(yesData)
                let updateYesCount = yesData + 1
                setYesData(updateYesCount)
            }
            else {
                let yescount = 0
                setYesData(yescount += 1)
            }
        }
        if (type === "n") {
            if (noData !== 0) {
                console.log(noData)
                let updateNoCount = noData + 1
                setNoData(updateNoCount)
            }
            else {
                let nocount = 0
                setNoData(nocount += 1)
            }
        }

        const totalTrainingRows = data.filter((item, index) => index !== 0)
        console.log(selectedIndex + 1, totalTrainingRows.length, 'ttttt')
        if (selectedIndex + 1 === totalTrainingRows.length) {
            setDisableButton(true)
        }
        if (selectedIndex <= totalTrainingRows.length - 1) {
            getSelectedRows(selectedIndex, type)
            const newSelectedIndex = selectedIndex + 1
            setSelectedIndex(newSelectedIndex)
        }
    }

    //
    //
    //
    console.log(selectedIndex)
    const handleSubmit = (event) => {
        event.preventDefault();
        const url_id = window.location.pathname.split('/')
        const project_id = url_id[2]
        let projectData = { "project": { "id": project_id } }
        const excludedCoumnsData = finalSelectedData.filter((item, index) => index !== 0)

        const result = excludedCoumnsData.map(innterItem => {
            const innerItems = innterItem.filter(el => el.user_input === "y" || el.user_input === "n")
            return innerItems
        }).filter(elItem => elItem.length > 0)
        result.unshift(data[0])

        result.push(projectData)
        console.log(result, 'ss')
        let processData = { "data": result }
        console.log(processData)
        setIsLoading(false)
        if (!isCompareData) {
            axios.post(
                active_training_api,
                processData
            )
                .then(res => {
                    setIsLoading(true)
                    console.log('Success' + res.data);
                    window.location.pathname = '/'
                })
                .catch(err => {
                    setIsOpenError(true)
                    setIsLoading(true)

                    console.log(err)

                })
        }
        else {
            axios.post(
                active_training_link_api,
                processData
            )
                .then(res => {
                    setIsLoading(true)
                    console.log('Success' + res.data);
                    window.location.pathname = '/identify-duplicates'
                })
                .catch(err => {
                    setIsOpenError(true)
                    setIsLoading(true)

                    console.log(err);

                })
        }
    };

    const getDataLoaded = () => {
        if (data.length !== 0) {
            setIsLoading(true)
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsOpenError(false);
    };
    console.log(isOpenError, 'error')

    const url_id = window.location.pathname.split("/")
    const project_id = url_id[2]
    const getData = () => {
        fetch(read_csv_api + project_id)
            .then((res) => res.json())
            .then((res) => {
                fetchProjectData(res.project)
            })
    }

    const getProjectDataCheck = () => {
        fetch(projet_data_check_api + project_id)
            .then((res) => res.json())
            .then((res) => {
                console.log(res)
                if (res.is_link == "true") {
                    setIsCompareData(true)
                }

            })
    }
    useEffect(() => {
        getData()
        getProjectDataCheck()
    }, [])
    useEffect(() => {
        setSelectedTrained(data)
        setTimeout(() => {
            getTrainModelInfo()

        }, 500)
        getDataLoaded()

    }, [data])
    //
    //
    //
    return (
        <div>
            {!isLoading ? <React.Fragment><LoadingSpinner /></React.Fragment> : <div>
                <Header />
                <div className="layout" id="main-container">
                    <div className='row'>
                        {!disableButton ? <React.Fragment>
                            <div>
                                <div className="col-md-12">
                                    <p>
                                        <i className='fa fa-fw fa-folder-open'></i> {projectData.project_name} &mdash; {projectData.project_name}
                                        {/* <span className='pull-right'>
                                    <a><i className="fa fa-gears"></i>settings</a>
                                </span> */}
                                    </p>
                                    <ul className='nav nav-wizard'>
                                        <li className=''>1. Choose columns</li>
                                        <li className='active'>2. Train model</li>
                                        {/** 
                                     * 
                                    */}
                                    </ul>
                                    <h3>Train Model</h3>

                                </div>
                                <div>


                                    <div className="col-md-12">
                                        <p>
                                            Below are 2 similar records <strong>Recoord A</strong> and <strong>Record B</strong>
                                        </p>
                                    </div>
                                    <div className="matching-table-container col-md-12">
                                        <table className="matching-table">
                                            <thead className='table-headers'>
                                                <tr>
                                                    <th>
                                                        Column Name
                                                    </th>
                                                    <th>
                                                        Record A
                                                    </th>
                                                    <th>
                                                        Record B
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="matching-table-body">
                                                {
                                                    columns.length > 0 && columns.map(column => {
                                                        return <tr>
                                                            <td>{column.field}</td>
                                                            {selectedTrainingRow.map(item => {
                                                                return <td>{item[column.field]}</td>
                                                            })}
                                                        </tr>
                                                    })
                                                }
                                            </tbody>

                                        </table>
                                        <table className="match-confirmation-table">
                                            <tr>
                                                <td>Yes</td>
                                                <td className="number-of-yes(s)">{yesData}/10</td>
                                            </tr>
                                            <tr>
                                                <td>No</td>
                                                <td className="number-of-no(s)">{noData}/10</td>
                                            </tr>

                                        </table>
                                    </div>


                                </div>
                                <div className="col-md-12 mt-3">
                                    <p className="">
                                        Do these two records refer to the same thing?
                                    </p>
                                    <div className="">
                                        <button type="button" onClick={() => onClickAction("y")} className="btn btn-success mr-3">Yes</button>
                                        <button type="button" onClick={() => onClickAction("n")} className="btn btn-primary mr-3">No</button>
                                        {/** */}
                                        <button type="button" className="btn btn-info pull-right" disabled={!isShowButton} onClick={handleSubmit}>Next</button>
                                        {/* <div className="col-md-12 mt-3">
                                            <div className="next-button-container">
                                                
                                            </div>
                                        </div> */}
                                    </div>
                                    {isOpenError && (
                                        <div>
                                            <DefaultError />
                                        </div>
                                    )}
                                </div>
                            </div></React.Fragment> :
                            <div>
                                <div className="col-md-12">
                                    <p>
                                        <i className='fa fa-fw fa-folder-open'></i> test &mdash; test
                                        {/* <span className='pull-right'>
                            <a><i className='fa fa-gears'></i>settings</a>
                        </span> */}
                                    </p>
                                    <ul className='nav nav-wizard'>
                                        <li className=''>1. Choose Columns</li>
                                        <li className='active'>2. Train Model</li>
                                        {/**
                         * 
                         */ }
                                    </ul>
                                    <h3>Train Model</h3>
                                </div>
                                <div className="matching-table-container col-md-12">
                                    <table className="matching-table">
                                        <thead className="table-headers">
                                            <tr>
                                                <th>
                                                    Column Name
                                                </th>
                                                <th>
                                                    Record A
                                                </th>
                                                <th>
                                                    Record B
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="matching-table-body">
                                            <tr>
                                                <td>---</td>
                                                <td>---</td>
                                                <td>---</td>
                                            </tr>
                                        </tbody></table>
                                    <table className="match-confirmation-table">
                                        <tr>
                                            <td>Yes</td>
                                            <td className="number-of-yes(s)">{yesData / 10}</td>
                                        </tr>
                                        <tr>
                                            <td>No</td>
                                            <td className="number-of-no(s)">{noData}/10</td>
                                        </tr>
                                    </table>


                                </div>

                                <div className="col-md-12 mt-3">
                                    <p>You've provided enough training to proceed to the next step</p>
                                    <div className="next-button-container">
                                        <button type="button" className="btn btn-success" onClick={handleSubmit}>Next</button>
                                    </div>
                                </div>
                                {/* <Snackbar open={isOpenError} autoHideDuration={1500} onClose={handleClose}>
                <Alert severity="error" sx={{ width:'100%'}}>
                    Error Occured
                </Alert>
                </Snackbar> */}
                            </div>
                        }
                    </div>
                </div>
            </div>
            }
            <Footer />
        </div>
    )
}
