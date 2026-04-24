from clearml import Task
import os
import logging
import pandas as pd
import sys

system_path = os.getcwd()
sys.path.append(system_path)

from DataPipeline.data.split import split_data
from DataPipeline.data.create_dataloader import create_dataloader
from DataPipeline.model.train import train
from DataPipeline.model.model import resnet_model, get_training_components
from DataPipeline.model.save_model import save_model

def main():
    task = Task.init(
        project_name="NutritionAnalyser",
        task_name="step_train_base",
        task_type=Task.TaskTypes.training,
    )

    logging.basicConfig(level=logging.INFO, force=True)
    logger = logging.getLogger(__name__)

    params = {
        "feature_path": "",
        "model_path": "artifacts/model/model.pth",
    }
    params = task.connect(params)

    logger.info("Training step started")

    df = pd.read_pickle(params["feature_path"])

    train_df, test_df = split_data(df)
    train_loader, test_loader = create_dataloader(train_df, test_df)

    model, device = resnet_model()
    criterion, optimizer = get_training_components(model)

    train(model, train_loader, criterion, optimizer, device)

    os.makedirs(os.path.dirname(params["model_path"]), exist_ok=True)
    save_model(model, params["model_path"])

    task.upload_artifact(
        name="trained_model",
        artifact_object=params["model_path"]
    )

    logger.info("Training step completed")


if __name__ == "__main__":
    main()