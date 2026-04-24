from clearml import Task
import logging
import pandas as pd
import torch
import os
import sys

system_path = os.getcwd()
sys.path.append(system_path)

from DataPipeline.data.split import split_data
from DataPipeline.data.create_dataloader import create_dataloader
from DataPipeline.model.model import resnet_model
from DataPipeline.model.evaluation import eval

def main():
    task = Task.init(
        project_name="NutritionAnalyser",
        task_name="step_evaluate_base",
        task_type=Task.TaskTypes.testing,
    )

    logging.basicConfig(level=logging.INFO, force=True)
    logger = logging.getLogger(__name__)

    params = {
        "feature_path": "",
        "model_path": "",
    }
    params = task.connect(params)

    logger.info("Evaluation step started")

    df = pd.read_pickle(params["feature_path"])

    train_df, test_df = split_data(df)
    _, test_loader = create_dataloader(train_df, test_df)

    model, device = resnet_model()
    model.load_state_dict(torch.load(params["model_path"], map_location=device))
    model.to(device)

    criterion = torch.nn.MSELoss()
    val_loss = eval(test_loader, model, criterion, device)

    task.get_logger().report_scalar(
        "metrics",
        "val_loss",
        iteration=0,
        value=float(val_loss)
    )

    logger.info(f"Validation loss = {val_loss}")


if __name__ == "__main__":
    main()