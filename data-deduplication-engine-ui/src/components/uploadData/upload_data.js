import * as React from 'react';
import axios from "axios";


import spreadsheet from '../static/images/spreadsheet_format.jpg';
import statelogo from '../static/images/logo.png';
import { project_api, projects_api, existing_project_training_data_api } from '../constants/endpoints';
import Footer from "../common/footer";
import Header from '../common/header';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

class UploadData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project_name: null,
            description: null,
            uploaded_file: null,
            data_check: "dedupe_data",
            link_project: "0",
            projectData: [],
            errorMessage: '',
            showButton: false,
            isChecked: false,
            project_setting_file: null,
            showDialog: false,
            open: true


        };

    }

    componentDidMount() {
        fetch(projects_api).then((response) => response.json()).then(projectList => {
            console.log(projectList, 'lis')
            this.setState({

                "projectData": projectList
            })
        });
    }
    handleInput = (e) => {
        console.log(e.target.value)
        this.setState({
            [e.target.name]: e.target.value,
        })

    }

    handleFilePreview = (e) => {
        this.state.uploaded_file = e.target.files[0];
        if (this.state.uploaded_file) {
            this.setState({ "showButton": true })
        }
        console.log(this.state, 'sldkj')
    }
    handleHideTabs = (e) => {
        if (e.target.id === 'create-project-tab') {
            document.getElementById("collapse-one").classList.remove("hidden")
            document.getElementById("collapse-one").classList.add("block")
            document.getElementById("collapse-two").classList.remove("block")
            document.getElementById("collapse-two").classList.add("hidden")

            document.getElementById("collapse-two-tab").classList.remove("active")
            document.getElementById("collapse-one-tab").classList.add("active")
        }
        if (e.target.id === "existing-project-tab") {
            document.getElementById("collapse-one").classList.remove("block")
            document.getElementById("collapse-one").classList.add("hidden")
            document.getElementById("collapse-two").classList.remove("hidden")
            document.getElementById("collapse-two").classList.add("block")

            document.getElementById("collapse-one-tab").classList.remove("active")
            document.getElementById("collapse-two-tab").classList.add("active")
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const postData = { ...this.state }
        console.log(postData)
        delete postData['projectData']
        delete postData['errorMessage']
        delete postData['showButton']

        axios.post(
            project_api,
            postData,
            {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            }

        ).then(res => {
            if (this.state.project_setting_file) {
                let payload = { "project_id": res.data.id, "project_setting_file": this.state.project_setting_file }
                axios.post(
                    existing_project_training_data_api,
                    payload
                ).then(res => {
                    this.setState({
                        showDialog: true
                    })
                })
            }
            else {
                if (res.data.data_check === 'dedupe_data') {
                    window.location.pathname = `/define-fields/${res.data.id}`
                }
                else {
                    window.location.pathname = '/identify-duplicates'
                }
            }
        }).catch(err => {
            this.setState({ errorMessage: err.message });
            console.log(err)
        })
    };
    onClickDashboard = () => {
        window.location.pathname = '/identify-duplicates'
    }

    handleClose = () => {
        this.setState({
            showDialog: false
        }
        )
    }
    render() {
        return (
            <div>
                <Header />


                <div className="container" id="main-container">

                    <div className="row">

                        <div className="row">
                            <div className="col-md-12">
                                <div>
                                    <label className="functionality-title">Identify Duplicates</label>
                                </div>
                                <h3>Upload data</h3>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-7">
                                <div className=''>
                                    <form role="form" className='form-horizontal' onSubmit={this.handleSubmit}>
                                        <input type="hidden" name="csrf_token" value="IjIwMDA1YTExMDBhYTk4N2U1NDQzNjM5ZDk2ODEwNmMxMjc2NWU3MTUi.Yy24-w.pGOyTx00NLNxBfF_BedS7lCzWGs" />


                                        <input type="hidden" name="group_id" value="145cb31e-5522-4b06-bd59-f34167de827a" />


                                        <div id="link-project" className="form-group">
                                            <label className="col-sm-2 control-label">
                                                Project<span className='required'>*</span>
                                            </label>
                                            <div className="col-sm-10">
                                                <ul className="nav nav-tabs" role="tablist">
                                                    <li role="presentation" className="active" id='collapse-one-tab'>
                                                        <a role="tab" data-toggle="tab" id="create-project-tab" href="#collapse-one" aria-controls="collapse-one" onClick={this.handleHideTabs}>
                                                            <i className="fa fa-fw fa-pencil-square-o"></i> Create a new project
                                                        </a>
                                                    </li>
                                                    <li role="presentation" id='collapse-two-tab'>
                                                        <a role="tab" data-toggle="tab" id="existing-project-tab" href="#collapse-two" aria-controls="collapse-two" onClick={this.handleHideTabs}>
                                                            <i className="fa fa-fw fa-plus-square-o"></i> Add to an existing project
                                                        </a>
                                                    </li>
                                                </ul>

                                                <div className="tab-content">
                                                    <div id="collapse-one" className="tab-pane active" role="tabpanel">
                                                        <p>Create a <strong>new project</strong> with your uploaded file as the primary dataset.</p>
                                                        <br />
                                                        <div className="row form-group">
                                                            <div className="col-sm-12">
                                                                <label htmlFor="new_project_name">Project name</label>
                                                                <input type="text" id="project_name" name="project_name" className="form-control" placeholder="My new project" onChange={this.handleInput} />
                                                            </div>
                                                        </div>
                                                        <div className="row form-group">
                                                            <div className="col-sm-12">
                                                                <label htmlFor="new_project_description">Project description</label>
                                                                <textarea type="text" id="description" name="description" className="form-control" onChange={this.handleInput} placeholder="Briefly describe what you are trying to de-duplicate"></textarea>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="col-sm-12">
                                                                Does this dataset have duplicate rows?<span className='required'>*</span>
                                                                <div className="radio">
                                                                    <label>
                                                                        <input type="radio" name="data_check" id="precanonical_false" value="dedupe_data" checked={this.state.data_check === "dedupe_data"} onChange={this.handleInput} />
                                                                        Yes, let's de-duplicate it!
                                                                    </label>
                                                                </div>
                                                                <div className="radio">
                                                                    <label>
                                                                        <input type="radio" name="data_check" id="precanonical_true" value="compare_data" checked={this.state.data_check === "compare_data"} onChange={this.handleInput} />
                                                                        No duplicates, I want to compare it to another dataset
                                                                    </label>
                                                                </div>
                                                                <div className="radio">
                                                                    <input type="checkbox" checked={this.state.isChecked} onChange={(e) => this.setState({ isChecked: e.target.checked })} />

                                                                    &nbsp; Want to use existing training

                                                                </div>
                                                                {
                                                                    this.state.isChecked && (
                                                                        <select id="project-list" className="form-control" name='project_setting_file' style={{ width: "100%" }} onChange={this.handleInput}>
                                                                            <option>--select a project to be linked--</option>

                                                                            {
                                                                                this.state.projectData.length > 0 && this.state.projectData.map((opt, i) => (
                                                                                    <option key={opt.id} value={opt.id}>
                                                                                        {opt.project_name}

                                                                                    </option>
                                                                                ))
                                                                            }
                                                                        </select>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div id="collapse-two" className="tab-pane active hidden" role="tabpanel">
                                                        <p>Upload your file to an <strong>existing project</strong> that has already been deduped.</p>
                                                        <br />
                                                        <select id="project-list" className="form-control" name='link_project' style={{ width: "100%" }} onChange={this.handleInput}>
                                                            <option>--select a project to be linked</option>

                                                            {
                                                                this.state.projectData.length > 0 && this.state.projectData.map((opt, i) => (
                                                                    <option key={opt.id} value={opt.id}>
                                                                        {opt.project_name}

                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                        <br /><br />

                                                    </div>

                                                </div>
                                            </div>
                                            <input type="hidden" id="project-list_id" name="project_id" value="d7aeac63-31a0-4710-bc5e-d927f0acf0de" />
                                        </div>
                                        <div className="col-sm-10 pull-right" id="wait_for_upload">
                                            <p><small className="help-block">A file uploader will appear once you name your dataset and specify the project you'd like to add it to.</small></p>
                                        </div>
                                        <br />

                                        <div className="form-group" id="upload_form_group">
                                            <label className="col-sm-2 control-label">Upload file<span className='required'>*</span></label>
                                            <div className="col-sm-10">
                                                <input type="file" id="id_input_file" name="uploaded_file" onChange={this.handleFilePreview} multiple />
                                                <p className="help-block">
                                                    Only <strong>.csv</strong> files

                                                </p>
                                            </div>
                                            <label className="col-sm-2 control-label pull-right">

                                                <a id="next-step" className="btn btn-info" onClick={this.handleSubmit} disabled={!this.state.showButton}>
                                                    Next &raquo;
                                                </a>
                                            </label>
                                        </div>

                                        <div className='form-group'>

                                            <div>
                                                {this.state.errorMessage &&
                                                    <h3 className="error"> {this.state.errorMessage} </h3>}
                                            </div>

                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="col-sm-5">
                                <p>
                                    <strong>How to format your data</strong>
                                    <br />
                                    <br />

                                    <img src={spreadsheet} id="format-example" className='img-responsive img-thumbnail' />

                                </p>
                                <p>
                                    The file must contain one row for every record, with the first row indicating the name of each column.
                                    first Column should be <strong style={{ color: "#de092c" }}>"Id</strong> contains unique number please ensure.

                                </p>

                                <br />
                            </div>
                        </div>
                        {
                            this.state.showDialog && (
                                <Dialog
                                    open={this.state.open}
                                    onClose={this.handleClose}
                                    aria-labelledby="alert-dialog-title"
                                    aria-describedby="alert-dialog-description"
                                >
                                    <DialogTitle id="alert-dialog-title">
                                        Success
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText id="alert-dialog-description">
                                            File is now available at dashboard for download.please click ok
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>

                                        <Button onClick={this.onClickDashboard} autoFocus>
                                            Ok
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            )
                        }
                    </div>
                    <Footer />
                </div>

            </div>
        )
    }
}

export default UploadData;