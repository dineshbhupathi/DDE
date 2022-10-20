from .database import Base
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func,ForeignKey
from datetime import datetime


class Project(Base):
    __tablename__ = "Project"

    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(256), nullable=True)
    description = Column(Text)
    file = Column(Text)
    data_check = Column(String(50))
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
    link_project = Column(String(250), nullable=True)


class ProjectFiles(Base):
    __tablename__ = "ProjectFiles"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(256), nullable=True)
    project = Column(Integer, ForeignKey("Project.id"))
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())


class DataReportProject(Base):
    __tablename__ = "DataReportProject"
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())
