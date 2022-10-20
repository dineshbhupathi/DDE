import * as React from 'react';
import axios from "axios";
import { data_analytics_upload_api } from '../constants/endpoints';
import Footer from "../common/footer";
import Header from '../common/header';
import LoadingSpinner from '../common//loadingSpinner';

class UploadDataAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project_name: null,
            uploaded_file: null,
            projectData: [],
            isLoading: false,
            showButton: false
            
        };

        
    }

    handleInput = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        })
    }

    handleFilePreview = (e) => {
        this.state.uploaded_file = e.target.files[0];
        console.log(e.target.files[0].name)
        this.state.project_name = e.target.files[0].name
        if (this.state.uploaded_file) {
            this.setState({"showButton": true})
        }
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
        this.setState({isLoading: true})
        event.preventDefault();
        const postData = { ...this.state }
        delete postData['projectData']
        delete postData['isLoading']
        delete postData['showButton']
        console.log(postData,'sdklfjlf')

        axios.post(
            data_analytics_upload_api,
            postData,
            {
                headers: {
                    "Content-type": "multipart/form-data",
                },
            }

        ).then(res => {
                window.location.pathname = '/data-analysis'
        }).catch(err => {
            this.setState({errorMessage: err.message});
            console.log(err)
        })
    };
    render() {
        return (
            <div>
            {this.state.isLoading ?<React.Fragment><LoadingSpinner/></React.Fragment>: <div>  <Header />


                <div className="container" id="main-container">
          
          <div className="row">
              
  <div className="row">
    <div className="col-md-12">
        <div>
            <label className="functionality-title">Data Analytics</label>
        </div>  

        <h3>New project - Upload data</h3>
    </div>
  </div>
  <div className="row">
    <div className="col-md-7">
      <div className=''>
          <form role="form" className='form-horizontal' onSubmit={this.handleSubmit}>  
              <div className="form-group" id="upload_form_group">
                  <label className="col-sm-2 control-label">Upload file<span className='required'>*</span></label>
                  <div className="col-sm-10">
                      <input type="file" id="id_input_file" name="uploaded_file" onChange={this.handleFilePreview} multiple />
                      <p className="help-block">
                          Only <strong>.csv</strong> files                         
                                                  
                      </p>
                  </div>
              </div>
  
              <div className='form-group'>
                  <label className="col-sm-2 control-label">
                 
                      <a id="next-step" className="btn btn-info" onClick={this.handleSubmit}  disabled={!this.state.showButton}>
                          Next &raquo;
                      </a>
                      </label>
                      <div>
                      { this.state.errorMessage &&
  <h3 className="error"> { this.state.errorMessage } </h3> }
                      </div>
                  
              </div>
          </form>
      </div>
    </div>
  </div>
  
    </div>
    <Footer />
</div>
</div>
    }
</div>
        )
    }
}

export default UploadDataAnalysis;