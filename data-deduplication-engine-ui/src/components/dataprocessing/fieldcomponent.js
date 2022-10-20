import React, { useEffect, useState } from "react";
import axios from "axios";
import statelogo from '../static/images/logo.png';
import { useActionData } from "react-router-dom";
import { read_csv_api, projet_data_check_api } from '../constants/endpoints'

export default function FieldComponent(props) {
    const [Columns, fetchColumns] = useState([])
    const [projectData, fetchProjetData] = useState([])
    const [isCompareData, setIsCompareData] = useState(false)
    const [childColumns, fetchChildColumns] = useState([])
    const { handleChange, rowIndex, } = props

    const url_id = window.location.pathname.split("/")
    const project_id = url_id[2]

    const getData = () => {
        fetch(read_csv_api + project_id).then((res) => res.json()).then((res) => {
            fetchColumns(res.columns)
            fetchChildColumns(res.child_columns)
            fetchProjetData(res.project)
        })
    }

    const getProjectDataCheck = () => {
        fetch(projet_data_check_api + project_id).then((res) => res.json()).then((res) => {
            if (res.is_link == "true") {
                setIsCompareData(true)
            }
        })
    }

    useEffect(() => {
        getData()
        getProjectDataCheck()
    }, [])

    return (
        <div className="well field-defination" id="field_0">
            {!isCompareData ? <React.Fragment>
                <div className="row">
                    <div className="col-sm-4">
                        <div className="form-group">
                            <label>Column in <strong>{projectData.project_name}</strong></label>
                            <div className="input-group new_field_fields">
                                <select className="form-control new_field" name="field" onChange={(e) => handleChange(e, rowIndex)}>
                                    <option>--select a column--</option>
                                    {Columns && Columns.length && Columns.map((opt, i) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}

                                </select>

                            </div>
                        </div>

                    </div>
                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Compare as </label>
                            <div className="input-group new_field_fields">
                                <select className="form-control new_field" name="type" onChange={(e) => handleChange(e, rowIndex)}>
                                    <option>--select a column--</option>
                                    <option value="Exact">Exact Match</option>
                                    <option value="String">String</option>

                                </select>

                            </div>
                        </div>
                    </div>

                    <div className="col-sm-3">
                        <div className="form-group">
                            <label>Missing Values </label>
                            <div className="input-group new_field_fields">
                                <select className="form-control new_field" name="has missing" onChange={(e) => handleChange(e, rowIndex)}>
                                    <option>--select a column--</option>
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>

                                </select>

                            </div>
                        </div>
                    </div>

                </div>
            </React.Fragment> :  <div className="row">
                    <div className="col-sm-4">
                        <div className="form-group">
                            <label>Column in <strong>{projectData.project_name}</strong></label>
                            <div className="input-group new_field_fields">
                                <select className="form-control new_field" name="field" onChange={(e) => handleChange(e, rowIndex)}>
                                    <option>--select a column--</option>
                                    {Columns && Columns.length && Columns.map((opt, i) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}

                                </select>

                            </div>
                        </div>

                    </div>
                    <div className="col-sm-3">
                    <div className="form-group">
                            <label>Select Same Column in <strong>{projectData.link_project}</strong></label>
                            <div className="input-group new_field_fields">
                                <select className="form-control new_field" name="field2" onChange={(e) => handleChange(e, rowIndex)}>
                                    <option>--select a column--</option>
                                    {Columns && Columns.length && Columns.map((opt, i) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}

                                </select>

                            </div>
                        </div>
                    </div>

                    <div className="col-sm-3">
                    <div className="form-group">
                            <label>Compare as </label>
                            <div className="input-group new_field_fields">
                                <select className="form-control new_field" name="type" onChange={(e) => handleChange(e, rowIndex)}>
                                    <option>--select a column--</option>
                                    <option value="Exact">Exact Match</option>
                                    <option value="String">String</option>

                                </select>

                            </div>
                        </div>
                    </div>

                </div>}
        </div>
    )

}