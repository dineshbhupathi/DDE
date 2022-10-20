import os
import pandas as pd
import csv
from unidecode import unidecode
import re

def preProcess(column):
    """
    Do a little bit of data cleaning with the help of Unidecode and Regex.
    Things like casing, extra spaces, quotes and new lines can be ignored.
    """
    column = unidecode(column)
    column = re.sub('  +', ' ', column)
    column = re.sub('\n', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()
    # If data is missing, indicate that by setting the value to `None`
    if not column:
        column = None
    return column


def get_projet_file_data(project_id):
    csv_name = 'project_file_' + str(project_id) + '.csv'
    csv_path = 'csv_dir/'
    data_path = os.path.join(csv_path, csv_name)
    data_d = {}

    with open(data_path, 'r', encoding='cp1252') as f:
        # Read the first 3 bytes
        leading_bytes = f.read(3)

        if (leading_bytes != 'ï»¿'):
            f.seek(0)  # Not a BOM, reset stream to beginning of file
        else:
            pass  # skip BOM
        reader = csv.DictReader(f, delimiter=',')
        headers = reader.fieldnames
        for row in reader:
            clean_row = [(k, preProcess(v)) for (k, v) in row.items()]
            row_id = int(row['Id'])
            data_d[row_id] = dict(clean_row)
    return data_d
