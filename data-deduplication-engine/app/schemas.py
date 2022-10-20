from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime,date


class Project(BaseModel):
    project_name: str
    description: str
    file: str
    data_check: str
    link_project: str

    class Config:
        orm_mode = True


class ProjectsList(BaseModel):
    id: int
    project_name: str
    description: str
    file: str
    data_check: str
    link_project: str
    created_at: date
    updated_at: date

    class Config:
        orm_mode = True


class DataReportingProject(BaseModel):
    project_name: str

    class Config:
        orm_mode = True


class DataReportingProjectList(BaseModel):
    id: int
    project_name: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class ProjectFiles(BaseModel):
    file_name: str
    project: int

    class Config:
        orm_mode = True


class ProjectsFilesList(BaseModel):
    id: int
    file_name: str
    project: int
    created_at: date
    updated_at: date

    class Config:
        orm_mode = True