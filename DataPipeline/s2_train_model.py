from clearml import Task
import pandas as pd
import logging
import os

from data_module import create_dataloader
from model_module import resnet_model, get_training_components, train, save_model

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
# Initialize the task
    task = Task.init(
        project_name='NutritionAnalyser',
        task_name='s2_train_model',
    )

    args = {
        "preprocess_task_id": "",
        'num_epochs': 20,
        'batch_size': 32,
        'learning_rate': 1e-3,
        'weight_decay': 1e-5
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

    # create dataloader
    train_loader, test_loader = create_dataloader(train_df, test_df, batch_size=args['batch_size'])
    logger.info("Created dataloaders for training and testing.")

    # initialize model and training components
    model, device = resnet_model()
    criterion, optimizer = get_training_components(model, args['learning_rate'], args['weight_decay'])

    # train the model
    train(model, train_loader, criterion, optimizer, device, num_epochs=args['num_epochs'])
    logger.info("Finished training the model.")

    # Save the model
    model_path = "artifacts/model/resnet18_model.pth"
    save_model(model, model_path)
    logger.info("Saved the trained model")

    # Upload model artifact
    task.upload_artifact(
        name="model",
        artifact_object=model_path,
        wait_on_upload=True
    )

    logger.info("s2_train_model completed.")

if __name__ == "__main__":
    main()