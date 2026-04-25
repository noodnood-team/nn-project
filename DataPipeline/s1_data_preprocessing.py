from clearml import Task
import logging
import pandas as pd
import os

from data_module import load_data, preprocessing, feature_engineering, split_data

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    task = Task.init(
        project_name="NutritionAnalyser",
        task_name="s1_data_preprocessing"
        )

    args = {
        "test_size": 0.25,
        "random_state": 42
        }
 
    task.connect(args)
    logger.info(f"Connected parameters: {args}")

    # Dataset.get()
    local_path = load_data()

    #preprocess
    df = preprocessing(local_path)

    #feature engineering
    df = feature_engineering(df)

    #split train/test
    train_df, test_df = split_data(df, test_size=args["test_size"], random_state=args["random_state"])

    # Save processed data to temporary files
    train_df.to_csv("train_df.csv", index=False)
    test_df.to_csv("test_df.csv", index=False)
    logger.info("Saved train_df.csv and test_df.csv")

    # Upload artifact
    task.upload_artifact(
        name="train_df",
        artifact_object="train_df.csv",
        wait_on_upload=True
    )
    task.upload_artifact(
        name="test_df",
        artifact_object="test_df.csv",
        wait_on_upload=True
    )
    logger.info("Uploaded train_df.csv and test_df.csv to ClearML artifacts")

    # Clean up temporary files
    for file in ["train_df.csv", "test_df.csv"]:
        if os.path.exists(file):
            os.remove(file)
            logger.info(f"Cleaned up temporary file: {file}")

    logger.info("s1_data_preprocessing completed.")

if __name__ == "__main__":
    main()