import uvicorn
import os.path
from typing import List, Any, Union
from fastapi import *
from fastapi.middleware.cors import CORSMiddleware
# from app.databse import SessionLocal, engine
from app import models, database, schemas, crud, csv_processing, data_analytics
from starlette.responses import RedirectResponse
from sqlalchemy.orm import Session
from starlette.responses import FileResponse
# Rule Engine Dependencies
import rule_engine
import os
import csv
from unidecode import unidecode
import re
import datetime
import pandas as pd
import json
from fastapi import Response
import fuzzymatcher

# Anomalies Detection Dependencies
import sys
import random as rd
import numpy as np
from fastapi import FastAPI, Query
# importing pytorch libraries
import torch
from torch import nn
from torch import autograd
from torch.utils.data import DataLoader

models.Base.metadata.create_all(bind=database.engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
    allow_credentials=True

)


def get_db():
    try:
        db = database.SessionLocal()
        yield db
    finally:
        db.close()


@app.get('/')
def main():
    return RedirectResponse(url='/docs/')


@app.post('/v1/upload_csv')
async def upload(project_name: str = Form(...), description: str = Form(...), uploaded_file: UploadFile = File(...),
                 data_check: str = Form(...), link_project: str = Form(...), db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    if projects:
        last_project_id = projects[-1].id + 1
    else:
        last_project_id = 1
    if link_project != "0":
        csv_name = 'input_file_' + str(link_project) + "_" + str(last_project_id) + ".csv"
    else:
        csv_name = 'input_file_' + str(last_project_id) + ".csv"
    csv_path = 'csv_dir/'
    file_path = os.path.join(csv_path, csv_name)
    with open(file_path, mode='wb+') as f:
        f.write(uploaded_file.file.read())

    project = schemas.Project(
        project_name=project_name,
        description=description,
        file=csv_name,
        data_check=data_check,
        link_project=link_project
    )
    if link_project != "0":
        session = Session(bind=database.engine, expire_on_commit=False)
        pr = session.query(models.Project).get(link_project)
        if pr:
            pr.data_check = "dedupe_data"
            session.commit()
        session.close()

    return crud.create_project(db=db, project=project)


@app.get('/v1/projects', response_model=List[schemas.ProjectsList])
async def show_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    return projects


@app.get('/v1/read_csv/{project_id}')
async def read_csv(project_id, db: Session = Depends(get_db)):
    project = db.query(models.Project).get(project_id)

    if project.link_project != "0":
        linked_project_id = project.link_project + "_" + str(project_id)
        csv_value = csv_processing.get_data(linked_project_id)
        column_names = csv_processing.column_names(project.link_project)
        column_List = list(column_names.keys())
    else:
        csv_value = csv_processing.get_data(project_id)
        column_names = csv_processing.column_names(project_id)
        column_List = list(column_names.keys())

    child_project = db.query(models.Project).all()
    child_project_columns_lis = []
    for i in child_project:
        if str(i.id) == project_id and str(i.link_project) != "0":
            link_id = str(i.link_project) + "_" + str(i.id)
            child_columns = csv_processing.column_names(link_id)
            child_project_columns_lis.append(list(child_columns.keys()))

    # with open("json_dir/input.json")

    if child_project_columns_lis:
        return {'message': 'Data Reading Successful', 'columns': column_List,
                'child_columns': child_project_columns_lis[0], 'project': project}
    else:
        return {'message': 'Data Reading Successful', 'columns': column_List, 'project': project}


@app.get('/v1/compare_dataset_project/', response_model=List[schemas.ProjectsList])
async def show_dataset_project(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    lst_projects = []
    for i in projects:
        if i.data_check == 'compare_data':
            lst_projects.append(i)

    return lst_projects


@app.post('/v1/active-learning')
async def active_learning(
        payload: dict = Body(...)
):
    project = payload['project']
    field_values = payload['check_columns']
    active_learning_response = csv_processing.active_learning(field_values, project)
    return active_learning_response


@app.post('/v1/active-training')
async def csv_active_training(
        payload: dict = Body(...)
):
    project = payload.get('data')[-1]
    project_data = project.get('project')
    del payload['data'][-1]['project']
    data = payload
    training_response = csv_processing.active_training(data, project_data)
    return training_response


@app.post('/v1/file_download')
async def file_download(
        payload: dict = Body(...),
        db: Session = Depends(get_db)
):
    id = payload.get('id')
    project = db.query(models.Project).get(id)
    if project:
        if project.link_project != "0":
            file_name = 'data_matching_output_' + str(project.link_project) + '_' + str(id) + '.csv'
        else:
            file_name = 'output_file_project_' + str(id) + '.csv'
        file_path = os.path.join(os.getcwd(), "output", file_name)
    else:
        file_name = 'output_file_project_' + str(id) + '.csv'
        print(file_name)
        file_path = os.path.join(os.getcwd(), "output", file_name)

    return FileResponse(path=file_path, media_type="application/octet-stream", filename=file_name)


@app.get('/v1/project_data/{project_id}')
async def projectCheck(project_id, db: Session = Depends(get_db)):
    project = db.query(models.Project).get(project_id)
    res_dic = {}

    if project.link_project != "0":
        res_dic['is_link'] = "true"
    else:
        res_dic['is_link'] = "false"

    return res_dic


'''
    Linkage Fun Start
'''


@app.post('/v1/active_learning_link')
async def active_learning_link(
        payload: dict = Body(...)
):
    project = payload['project']
    field_values = payload['check_columns']

    clean_fields = []
    for i in field_values:
        if i.get('field2'):
            clean_dic = {}
            clean_dic['field'] = i['field2']
            clean_dic['type'] = i['type']
            clean_dic['has missing'] = i['has missing']
            del i['field2']
            clean_fields.append(i)
            # clean_fields.append(clean_dic)
    session = Session(bind=database.engine, expire_on_commit=False)
    project_id = project.get('id')
    pr = session.query(models.Project).get(project_id)
    clean_project_dic = {"project_1": pr.link_project, "project_2": project_id}
    active_learning_res = csv_processing.active_learning_link(clean_fields, clean_project_dic)
    return active_learning_res


@app.post('/v1/active_training_link')
async def active_training_link(
        payload: dict = Body(...)
):
    project = payload.get('data')[-1]
    project_id = project.get('project').get('id')
    session = Session(bind=database.engine, expire_on_commit=False)
    pr = session.query(models.Project).get(project_id)
    cleaned_project_dic = {"project_1": pr.link_project, "project_2": project_id}
    del payload['data'][-1]['project']
    data = payload
    res = csv_processing.active_training_link(data, cleaned_project_dic)
    return res


@app.get('/v1/project/{project_id}')
async def show_project(project_id: int, db: Session = Depends(get_db)):
    # with Session(database.engine) as session:
    #     project = session.get(models.Project, project_id)
    #     if not project:
    #         raise HTTPException(status_code=404, detail="project not fount")
    #     return {"response": project}
    project = db.query(models.Project).get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="project not found")
    return {"response": project}


@app.delete("/v1/delete_project/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    # with Session(database.engine) as session:
    #     project = session.get(models.Project, project_id)
    #     print(project)
    #     if not project:
    #         raise HTTPException(status_code=404, detail="project not found")
    #     session.delete(project)
    #     session.commit()
    #     return {"ok": True}
    project = db.query(models.Project).get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}


@app.post('/v1/data_reporting')
async def data_report(project_name: str = Form(...), uploaded_file: UploadFile = File(...),
                      db: Session = Depends(get_db)):
    projects = db.query(models.DataReportProject).all()
    if projects:
        last_project_id = projects[-1].id + 1
    else:
        last_project_id = 1
    csv_name = 'data_reporting_file' + str(last_project_id) + ".csv"
    csv_path = 'csv_dir/'
    file_path = os.path.join(csv_path, csv_name)
    with open(file_path, mode='wb+') as f:
        f.write(uploaded_file.file.read())

    project = schemas.DataReportingProject(
        project_name=project_name,

    )
    data_reporting = data_analytics.data_analysis(file_path, last_project_id)
    return crud.create_data_reporting_project(db=db, project=project)


@app.post('/v1/data_analytics_report')
async def data_analytics_file(
        payload: dict = Body(...)):
    id = payload.get('id')
    file_name = 'data_analytics_project_' + str(id) + '.html'
    file_path = os.path.join(os.getcwd(), "output", file_name)
    return FileResponse(path=file_path, filename=file_name)


@app.get('/v1/data_analytics_projects', response_model=List[schemas.DataReportingProjectList])
async def show_projects(db: Session = Depends(get_db)):
    projects = db.query(models.DataReportProject).all()
    return projects


@app.delete("/v1/delete_data_analysis_project/{project_id}")
async def delete_data_analysis_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.DataReportProject).get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="project not found")
    db.delete(project)
    db.commit()
    return {"ok": True}


######################################
# Rule Engine Functionality Started
######################################

def get_data_rule_engine():
    dt = str(datetime.datetime.now())
    dt = "_".join(dt.split()).replace(":", "-")
    dt = dt[:-16]
    csv_name = 'input_file_' + dt + '.csv'
    csv_path = 'csv_dir/'
    data_path = os.path.join(csv_path, csv_name)
    df = pd.read_csv(data_path)
    formated_df = df.to_dict(orient='records')
    return formated_df


def get_column_name():
    dt = str(datetime.datetime.now())
    dt = "_".join(dt.split()).replace(":", "-")
    dt = dt[:-16]
    csv_name = 'input_file_' + dt + '.csv'
    csv_path = 'csv_dir/'
    data_path = os.path.join(csv_path, csv_name)
    df = pd.read_csv(data_path, sep=',', encoding='utf-8')
    columns = []
    columns_datatype = []

    for column in df.columns:
        columns.append(column)
        columns_datatype.append(df[column].dtype.name)

    comb_lis = zip(columns, columns_datatype)
    new_dict = dict(comb_lis)
    return new_dict


def rule_engine_execution(value):
    try:
        print("Entering try Block")
        formated_df = get_data_rule_engine()
        rule = rule_engine.Rule(value)
        rule_execution = rule.filter(formated_df)
        return rule_execution

    except Exception as e:
        print("Entering Exception Block")
        return e


@app.post('/v2/upload_rules_csv/')
async def upload(uploaded_file: UploadFile = File(...)):
    # save csv to local dir
    dt = str(datetime.datetime.now())
    dt = "_".join(dt.split()).replace(":", "-")
    dt = dt[:-16]
    csv_name = 'input_file_' + dt + '.csv'
    csv_path = 'csv_dir/'
    file_path = os.path.join(csv_path, csv_name)

    with open(file_path, mode='wb+') as f:
        f.write(uploaded_file.file.read())
        return {'message': 'Input File Successfully Uploaded'}


# @app.get('/v2/get_data_format/')
# async def get_formatted_data():
#     data= get_data_rule_engine()
#     #Serializing json
#     #columns_name_json= json.dumps(data)
#     #Dumping Input CSV to JSON
#     with open('json_dir/data.json','w') as outfile:
#         json.dump(data, outfile)
#     return {'message': 'Data Formated Successfully'}

@app.get('/v2/column_name_n_datatype')
async def get_column_name_n_datatype():
    column_names = get_column_name()

    # Serializing json
    column_names_json = json.dumps(column_names)

    return {'message': 'Column Names with Dtype Retrved', 'Columns': column_names_json}


@app.post('/v2/filtered_data/')
async def get_filtered_data(payload: dict = Body(...)):
    # writer = pd.ExcelWriter('output/rules_output.csv')
    try:
        value = payload.get('value')
        filter_df = rule_engine_execution(value)
        lst = list(filter_df)
        output_df = pd.DataFrame.from_records(lst)
        # create excel writer object
        # write dataframe to excel
        output_df.to_csv('output/rules_output.csv')
        # writer.save()

        # return {'message': 'Rule Engine Execution Successfully'}
        file_name = 'rules_output.csv'
        file_path = os.path.join(os.getcwd(), "output", file_name)
        return FileResponse(path=file_path, media_type="application/octet-stream", filename=file_name)

    except Exception as e:
        return e


@app.post("/v1/trained_data")
async def is_trained_data(payload: dict = Body(...)
                          ):
    project_id = payload.get("id")
    file = os.getcwd()
    file_name = 'csv_learned_settings_' + str(project_id)
    file_path = os.path.join(file, "model_dir", file_name)
    if os.path.exists(file_path):
        return {"message": "exits"}
    else:
        return {"message": "doesn't exits"}


@app.post("/v1/existing_training/")
async def add_existing_training(
        payload: dict = Body(...)
):
    res = csv_processing.existing_project_training(payload)
    return {"res": res}


@app.post('/v1/upload_file')
async def upload(file_name: str = Form(...), project: int = Form(...), uploaded_file: UploadFile = File(...),
                 db: Session = Depends(get_db)):
    projects = db.query(models.ProjectFiles).all()
    if projects:
        last_project_id = projects[-1].id + 1
    else:
        last_project_id = 1
    csv_name = 'project_file_' + str(project) + "_" + str(last_project_id) + ".csv"
    csv_path = 'csv_dir/'
    file_path = os.path.join(csv_path, csv_name)
    with open(file_path, mode='wb+') as f:
        f.write(uploaded_file.file.read())

    project_file = schemas.ProjectFiles(
        file_name=file_name,
        project=project
    )
    return crud.create_project_files(db=db, project_file=project_file)


@app.get('/v1/project_files/', response_model=List[schemas.ProjectsFilesList])
async def show_project_files(db: Session = Depends(get_db)):
    projects = db.query(models.ProjectFiles).all()
    return projects


@app.get('/v1/project/{project_id}', response_model=List[schemas.ProjectsList])
async def show_projects(project_id, db: Session = Depends(get_db)):
    projects = db.query(models.Project).get(project_id)
    return projects


@app.delete("/v1/delete_project_file/{file_id}")
async def delete_project_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(models.ProjectFiles).get(file_id)
    if not file:
        raise HTTPException(status_code=404, detail="file not found")
    db.delete(file)
    db.commit()
    return {"ok": True}


if __name__ == '__main__':
    uvicorn.run('main:app', server_header=False)
