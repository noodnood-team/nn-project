'''
 This code defines a ClearML pipeline for a machine learning project.
 This script is for MLOps level 1.
'''

print("Starting ClearML pipeline...")
from clearml.automation import PipelineController
import sys
import os
# Get the current path of the cmd
system_path = os.getcwd()
sys.path.append(system_path)


# from DataPipeline.pipeline.s1_process_dataset import step_preprocess
# from DataPipeline.pipeline.s2_feature_engineering import step_feature
# from DataPipeline.pipeline.s3_train_model import step_train
# from DataPipeline.pipeline.s4_evaluate_model import step_evaluate

pipe = PipelineController(
    name="Pipeline",
    project="NutritionAnalyser",
    version="1.0",
)
pipe.set_default_execution_queue("default")

pipe.add_step(
    name="preprocess_dataset",
    base_task_project="NutritionAnalyser",
    base_task_name="step_preprocess_base",
    execution_queue="default",
)

pipe.add_step(
    name="feature_engineering",
    parents=["preprocess_dataset"],
    base_task_project="NutritionAnalyser",
    base_task_name="step_feature_base",
    execution_queue="default",
    parameter_override={
        "General/processed_path": "${preprocess_dataset.artifacts.processed_data.url}",
    },
)

pipe.add_step(
    name="train_model",
    parents=["feature_engineering"],
    base_task_project="NutritionAnalyser",
    base_task_name="step_train_base",
    execution_queue="default",
    parameter_override={
        "General/feature_path": "${feature_engineering.artifacts.featured_data.url}",
    },
)

pipe.add_step(
    name="evaluate_model",
    parents=["train_model", "feature_engineering"],
    base_task_project="NutritionAnalyser",
    base_task_name="step_evaluate_base",
    execution_queue="default",
    parameter_override={
        "General/feature_path": "${feature_engineering.artifacts.featured_data.url}",
        "General/model_path": "${train_model.artifacts.trained_model.url}",
    },
)

# pipe.start_locally(run_pipeline_steps_locally=True)
pipe.start(queue="default")