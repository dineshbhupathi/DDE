import os
import csv
import re
import logging
import optparse

import dedupe
from unidecode import unidecode


def preProcess(column):
    """
    Do a little bit of data cleaning with the help of Unidecode and Regex.
    Things like casing, extra spaces, quotes and new lines can be ignored.
    """

    column = unidecode(column)
    column = re.sub('\n', ' ', column)
    column = re.sub('-', '', column)
    column = re.sub('/', ' ', column)
    column = re.sub("'", '', column)
    column = re.sub(",", '', column)
    column = re.sub(":", ' ', column)
    column = re.sub('  +', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()
    if not column:
        column = None
    return column


def readData(project_id):
    """
    Read in our data from a CSV file and create a dictionary of records,
    where the key is a unique record ID.
    """
    csv_name = 'input_file_' + str(project_id) + '.csv'
    csv_path = 'csv_dir/'
    data_path = os.path.join(csv_path, csv_name)
    data_d = {}

    with open(data_path) as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            clean_row = dict([(k, preProcess(v)) for (k, v) in row.items()])
            if clean_row['Id']:
                clean_row['Id'] = clean_row['Id'][1:]
            data_d[str(data_path) + str(i)] = dict(clean_row)

    return data_d


def project_csv_file(project_id):
    csv_name = 'input_file_' + str(project_id) + '.csv'
    csv_path = 'csv_dir/'
    data_path = os.path.join(csv_path, csv_name)
    return data_path
