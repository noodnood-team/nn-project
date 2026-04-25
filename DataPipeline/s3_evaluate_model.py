from clearml import Task
import pandas as pd
import logging
from data_module import create_dataloader, split_data
from model_module import resnet_model, eval
import torch


def main():
    task = Task.init(
        project_name="NutritionAnalyser",
        task_name="s3_evaluate_model",
    )
    # only create the task, we will actually execute it later
    # task.execute_remotely()

    logging.basicConfig(level=logging.INFO, force=True)
    logger = logging.getLogger(__name__)

    args = {
        "preprocess_task_id": "",
        "train_task_id": "",
        "batch_size": 32
    }
    task.connect(args)
    logger.info(f"Connected parameters: {args}")
    
    preprocess_task_id = task.get_parameter("General/preprocess_task_id")
    s1_task = Task.get_task(task_id=preprocess_task_id)

    # load train_df and test_df from input artifacts
    train_df_path = s1_task.artifacts["train_df"].get_local_copy()
    test_df_path = s1_task.artifacts["test_df"].get_local_copy()
    train_df = pd.read_csv(train_df_path)
    test_df = pd.read_csv(test_df_path)
    logger.info("Finished loading preprocessed data.")

    # create dataloader for test set
    _, test_loader = create_dataloader(train_df, test_df, batch_size=args['batch_size'])
    logger.info("Created dataloader for testing.")

    # Load model artifact from s2
    s2_task = Task.get_task(task_id=args["train_task_id"])
    model_path = s2_task.artifacts["model"].get_local_copy()
    logger.info(f"Loaded model artifact from: {model_path}")

    model, device = resnet_model()
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)

    criterion = torch.nn.MSELoss()
    val_loss = eval(test_loader, model, criterion, device)

    task.get_logger().report_scalar(
        "metrics",
        "val_loss",
        iteration=0,
        value=float(val_loss)
    )

    task.upload_artifact(
        name="evaluation_result",
        artifact_object={"val_loss": float(val_loss)}
    )

    logger.info(f"Validation loss = {val_loss}")
    logger.info("s3_evaluate_model completed.")

if __name__ == "__main__":
    main()