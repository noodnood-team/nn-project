'''
This script runs the entire pipeline for the Nutrition Analyser project. It includes the following steps:
1. Load the dataset using ClearML and get the path of the dataset on the local machine.
2. Preprocess the dataset and get a dataframe.
3. Perform feature engineering and get a dataframe.
4. Split the dataframe into train and test sets.
5. Create dataloaders for train and test sets.
6. Create the model and device.
7. Get the criterion and optimizer for training the model.
8. Train the model.
9. Evaluate the model on the test set.
10. Save the trained model.

This is for MLOps level 0, where we run the entire pipeline in a single script.
'''

from DataPipeline.data.loader import load_data
from DataPipeline.data.preprocessing import preprocessing
from DataPipeline.data.feature_engineering import feature_engineering
from DataPipeline.data.split import split_data
from DataPipeline.data.create_dataloader import create_dataloader

from DataPipeline.model.model import resnet_model, get_training_components
from DataPipeline.model.train import train
from DataPipeline.model.evaluation import eval
from DataPipeline.model.save_model import save_model

import os
import dotenv 
dotenv.load_dotenv()

from clearml import Task
Task.set_credentials(
     api_host="https://api.clear.ml",
     web_host="https://app.clear.ml",
     files_host="https://files.clear.ml",
     key=os.getenv('clear_ml_key'), # get it from https://app.clear.ml/settings/workspace-configuration
     secret=os.getenv('clear_ml_secret') # get it from https://app.clear.ml/settings/workspace-configuration
)

def run_pipeline():
    task = Task.init(
        project_name="NutritionAnalyser", 
        task_name="Run Pipeline"
    )

    task.execute_remotely(queue_name="default") 

    path = load_data() # download dataset from ClearML and get the path of the dataset on the local machine
    df = preprocessing(path) # preprocess the dataset and get a dataframe
    df = feature_engineering(df) # perform feature engineering and get a dataframe

    train_df, test_df = split_data(df) # split the dataframe into train and test sets
    train_loader, test_loader = create_dataloader(train_df, test_df) # create dataloaders for train and test sets
    print("Data preprocessing and feature engineering completed.")

    model, device = resnet_model() # create the model and device
    criterion, optimizer = get_training_components(model) # get the criterion and optimizer for training the model
    print("Starting training...")
    train(model, train_loader, criterion, optimizer, device) # train the model
    print("Training completed. Starting evaluation...")
    eval(test_loader, model, criterion, device) # evaluate the model on the test set
    save_model(model, "resnet_model.pth") # save the trained model

#use "py -m pipeline.run_pipeline" to run the pipeline in command line locally
if __name__ == "__main__":
    run_pipeline() 