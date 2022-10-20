import csv
import os
import re

import pandas as pd
import dedupe
from unidecode import unidecode
from .csv_console_label import console_label, active_train
from .record_linkage import readData, project_csv_file
from .utils import *

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


def get_data(project_id):
    csv_name = 'input_file_' + str(project_id) + '.csv'
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


def column_names(project_id):
    csv_name = 'input_file_' + str(project_id) + '.csv'
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


def active_learning(payload, project):
    project_id = project.get('id')
    data_d = get_data(project_id)
    cwd = os.getcwd()
    settings_file = 'project_learned_settings_' + str(project_id)
    settings_path = os.path.join(cwd, 'model_dir', settings_file)
    training_file = 'csv_training_' + str(project_id) + '.json'
    training_path = os.path.join(cwd, 'model_dir', training_file)
    csv_name = 'input_file_' + str(project_id) + '.csv'
    csv_path = 'csv_dir/'
    input_file = os.path.join(csv_path, csv_name)
    if os.path.exists(settings_path):
        print('reading from', settings_path)
        with open(settings_path, 'rb') as f:
            deduper = dedupe.StaticDedupe(f)
    else:
        payload = payload
        deduper = dedupe.Dedupe(payload)
        # deduper.prepare_training(data_d)
        # if os.path.exists(training_path):
        #     print('reading labeled examples from ', training_path)
        #     with open(training_path, 'rb') as f:
        #         print(training_path)
        #         deduper.prepare_training(data_d, f)
        # else:
        deduper.prepare_training(data_d)
        res = console_label(deduper, payload)
        return res
    clustered_dupes = deduper.partition(data_d, 0.5)

    cluster_membership = {}
    for cluster_id, (records, scores) in enumerate(clustered_dupes):
        for record_id, score in zip(records, scores):
            cluster_membership[record_id] = {
                "Cluster ID": cluster_id,
                "confidence_score": score
            }
    output_file_path = f'output/output_file_project_{str(project_id)}.csv'
    with open(output_file_path, 'w') as f_output, open(input_file, encoding='cp1252') as f_input:
        # Read the first 3 bytes
        leading_bytes = f_input.read(3)

        if (leading_bytes != 'ï»¿'):
            f_input.seek(0)  # Not a BOM, reset stream to beginning of file
        else:
            pass  # skip BOM
        reader = csv.DictReader(f_input)
        fieldnames = ['Cluster ID', 'confidence_score'] + reader.fieldnames

        writer = csv.DictWriter(f_output, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            row_id = int(row['Id'])
            row.update(cluster_membership[row_id])
            writer.writerow(row)

    return {"message": "done"}


def active_training(data, project_data):
    project_id = project_data.get('id')
    model_dir = 'model_dir/'
    field_values = data.get('data')[0].get('columns')
    cleaned_data = data.get('data')[1:]
    csv_name = 'input_file_' + str(project_id) + '.csv'
    csv_path = 'csv_dir/'
    input_file = os.path.join(csv_path, csv_name)
    training_file = 'csv_training_' + str(project_id) + '.json'
    training_parameter_file = 'project_learned_settings_' + str(project_id)

    data_d = get_data(project_id)
    deduper = dedupe.Dedupe(field_values)
    deduper.prepare_training(data_d)
    # print(cleaned_data,'cl')
    active_train(deduper, cleaned_data)
    deduper.train()

    model_path = os.path.join(model_dir, training_file)
    model_parameter_path = os.path.join(model_dir, training_parameter_file)
    with open(model_path, 'w') as tf:
        deduper.write_training(tf)

    with open(model_parameter_path, 'wb') as sf:
        deduper.write_settings(sf)
    clustered_dupes = deduper.partition(data_d, 0.5)

    cluster_membership = {}
    for cluster_id, (records, scores) in enumerate(clustered_dupes):
        for record_id, score in zip(records, scores):
            cluster_membership[record_id] = {
                "Cluster ID": cluster_id,
                "confidence_score": score
            }
    output_file_path = f'output/output_file_project_{str(project_id)}.csv'
    with open(output_file_path, 'w') as f_output, open(input_file, encoding='cp1252') as f_input:
        # Read the first 3 bytes
        leading_bytes = f_input.read(3)

        if (leading_bytes != 'ï»¿'):
            f_input.seek(0)  # Not a BOM, reset stream to beginning of file
        else:
            pass  # skip BOM
        reader = csv.DictReader(f_input)
        fieldnames = ['Cluster ID', 'confidence_score'] + reader.fieldnames

        writer = csv.DictWriter(f_output, fieldnames=fieldnames)
        writer.writeheader()

        for row in reader:
            row_id = int(row['Id'])
            row.update(cluster_membership[row_id])
            writer.writerow(row)


'''
    Record Linkage Functionality
'''


def active_learning_link(payload, project):
    project_1_id = project.get('project_1')
    project_2_id = project_1_id + "_" + project.get('project_2')

    data_1 = readData(project_1_id)
    data_2 = readData(project_2_id)

    field_values = payload

    linker = dedupe.RecordLink(field_values)

    linker.prepare_training(data_1, data_2, sample_size=15000)

    console_response = console_label(linker, field_values)
    return console_response


def active_training_link(data, project_data):
    cleaned_data = data.get('data')[1:]
    project_1_id = project_data.get('project_1')
    project_2_id = project_1_id + '_' + project_data.get('project_2')
    field_values = data.get('data')[0].get('columns')
    output_file = f'output/data_matching_output_{str(project_2_id)}.csv'

    data_1 = readData(project_1_id)
    data_2 = readData(project_2_id)

    linker = dedupe.RecordLink(field_values)

    linker.prepare_training(data_1, data_2, sample_size=15000)
    active_train(linker, cleaned_data)
    linker.train()
    linked_records = linker.join(data_1, data_2, 0.0)
    cluster_membership = {}
    for cluster_id, (cluster, score) in enumerate(linked_records):
        for record_id in cluster:
            cluster_membership[record_id] = {
                "Cluster ID": cluster_id,
                "Link Score": score
            }

    left_file = project_csv_file(project_1_id)
    right_file = project_csv_file(project_2_id)

    with open(output_file, 'w') as f:

        header_unwritten = True

        for fileno, filename in enumerate((left_file, right_file)):
            with open(filename) as f_input:
                reader = csv.DictReader(f_input)
                if header_unwritten:
                    fieldnames = ([
                                      'Cluster ID', 'Link Score', 'source file'
                                  ] + reader.fieldnames)

                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()

                    header_unwritten = False

                for row_id, row in enumerate(reader):
                    record_id = filename + str(row_id)
                    cluter_details = cluster_membership.get(record_id, {})
                    row['source file'] = fileno
                    row.update(cluter_details)

                    writer.writerow(row)


'''
    Using Existing Training
'''


def existing_project_training(payload):
    project_id = payload.get('project_id')
    project_id_setting = payload.get('project_setting_file')
    is_file = payload.get("is_file")
    cwd = os.getcwd()
    settings_file = 'project_learned_settings_' + str(project_id_setting)
    settings_path = os.path.join(cwd, 'model_dir', settings_file)

    if is_file:
        data_d = get_projet_file_data(is_file)
        training_file = 'csv_training_' + str(is_file) + '.json'
        training_path = os.path.join(cwd, 'model_dir', training_file)
        csv_name = 'project_file_' + str(is_file) + '.csv'
        training_parameter_file = 'project_learned_settings_' + str(is_file)
        training_parameter_path = os.path.join(cwd, 'model_dir', training_parameter_file)
        output_file_path = f'output/output_file_project_{str(is_file)}.csv'

    else:
        data_d = get_data(project_id)
        settings_file = 'project_learned_settings_' + str(project_id_setting)
        settings_path = os.path.join(cwd, 'model_dir', settings_file)
        training_file = 'csv_training_' + str(project_id) + '.json'
        training_path = os.path.join(cwd, 'model_dir', training_file)
        csv_name = 'input_file_' + str(project_id) + '.csv'
        training_parameter_file = 'project_learned_settings_' + str(project_id)
        training_parameter_path = os.path.join(cwd, 'model_dir', training_parameter_file)
        print(training_parameter_path)
        output_file_path = f'output/output_file_project_{str(project_id)}.csv'

    csv_path = 'csv_dir/'
    input_file = os.path.join(csv_path, csv_name)
    if os.path.exists(settings_path):
        print('reading from', settings_path)
        with open(settings_path, 'rb') as f:
            deduper = dedupe.StaticDedupe(f)

        with open(settings_path, 'rb') as f:
            with open(training_parameter_path, 'wb') as output:
                for line in f:
                    output.write(line)



        clustered_dupes = deduper.partition(data_d, 0.5)

        cluster_membership = {}
        for cluster_id, (records, scores) in enumerate(clustered_dupes):
            for record_id, score in zip(records, scores):
                cluster_membership[record_id] = {
                    "Cluster ID": cluster_id,
                    "confidence_score": score
                }
        with open(output_file_path, 'w') as f_output, open(input_file, encoding='cp1252') as f_input:
            # Read the first 3 bytes
            leading_bytes = f_input.read(3)

            if (leading_bytes != 'ï»¿'):
                f_input.seek(0)  # Not a BOM, reset stream to beginning of file
            else:
                pass  # skip BOM
            reader = csv.DictReader(f_input)
            fieldnames = ['Cluster ID', 'confidence_score'] + reader.fieldnames

            writer = csv.DictWriter(f_output, fieldnames=fieldnames)
            writer.writeheader()

            for row in reader:
                row_id = int(row['Id'])
                row.update(cluster_membership[row_id])
                writer.writerow(row)
