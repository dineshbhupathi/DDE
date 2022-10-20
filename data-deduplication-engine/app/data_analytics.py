import pandas
import os.path
from pandas_profiling import ProfileReport


def data_analysis(file_path,project_id):
    print(file_path)
    df = pandas.read_csv(file_path, encoding='latin1')
    profile = ProfileReport(df, title='Data Analysis Report')
    output_file_path = os.path.join('output', f'data_analytics_project_{str(project_id)}.html')
    profile.to_file(output_file_path)
