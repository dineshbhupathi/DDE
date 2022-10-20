from sqlalchemy.orm import Session
from . import models, schemas


def create_project(db: Session, project: schemas.Project):
    db_project = models.Project(
        project_name=project.project_name,
        description=project.description,
        file=project.file,
        data_check=project.data_check,
        link_project=project.link_project

    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def create_data_reporting_project(db: Session, project: schemas.DataReportingProject):
    db_project = models.DataReportProject(
        project_name=project.project_name

    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def create_project_files(db: Session, project_file: schemas.ProjectFiles):
    db_project = models.ProjectFiles(
        file_name=project_file.file_name,
        project=project_file.project

    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project
