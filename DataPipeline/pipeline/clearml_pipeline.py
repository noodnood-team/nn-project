'''
 This code defines a ClearML pipeline for a machine learning project.
 This script is for MLOps level 1.
'''

print("Starting ClearML pipeline...")
import sys
import dotenv 
import os

# Get the current path of the cmd
system_path = os.getcwd()
sys.path.append(system_path)

from clearml.automation import PipelineController
from DataPipeline.pipeline.s1_process_dataset import step_preprocess
from DataPipeline.pipeline.s2_feature_engineering import step_feature
from DataPipeline.pipeline.s3_train_model import step_train
from DataPipeline.pipeline.s4_evaluate_model import step_evaluate

dotenv.load_dotenv()

from clearml import Task
Task.set_credentials(
     api_host="https://api.clear.ml",
     web_host="https://app.clear.ml",
     files_host="https://files.clear.ml",
     key=os.getenv('clear_ml_key'), # get it from https://app.clear.ml/settings/workspace-configuration
     secret=os.getenv('clear_ml_secret') # get it from https://app.clear.ml/settings/workspace-configuration
)

pipe = PipelineController(
    name="Pipeline",
    project="NutritionAnalyser",
    version="1.0",
)

pipe.add_function_step(
    name="preprocess_dataset",
    function=step_preprocess,
    function_return=["processed_path"],
    execution_queue="default"
)

pipe.add_function_step(
    name="feature_engineering",
    function=step_feature,
    parents=["preprocess_dataset"],
    function_kwargs=dict(
        processed_path="${preprocess_dataset.processed_path}"
    ),
    function_return=["feature_path"],
    execution_queue="default"
)

pipe.add_function_step(
    name="train_model",
    function=step_train,
    parents=["feature_engineering"],
    function_kwargs=dict(
        feature_path="${feature_engineering.feature_path}"
    ),
    function_return=["model_path"],
    execution_queue="default"
)

pipe.add_function_step(
    name="evaluate_model",
    function=step_evaluate,
    parents=["train_model"],
    function_kwargs=dict(
        model_path="${train_model.model_path}",
        feature_path="${feature_engineering.feature_path}"
    ),
    function_return=["val_loss"],
    execution_queue="default"
)

# pipe.start_locally(run_pipeline_steps_locally=True)
pipe.start(queue="default")