'''
 This code defines a ClearML pipeline for a machine learning project.
 This script is for MLOps level 1.
'''
print("Starting ClearML pipeline...")
from clearml import PipelineController
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, force=True)
logger = logging.getLogger(__name__)

pipe = PipelineController(
    name="Pipeline",
    project="NutritionAnalyser",
    version="1.0",
)

pipe.set_default_execution_queue("default")

pipe.add_step(
    name="s1_data_preprocessing",
    base_task_project="NutritionAnalyser",
    base_task_name="s1_data_preprocessing",
    execution_queue="default",
    parameter_override={
        "General/test_size": 0.25,
        "General/random_state": 42
    }
)

pipe.add_step(
    name="s2_train_model",
    parents=["s1_data_preprocessing"],
    base_task_project="NutritionAnalyser",
    base_task_name="s2_train_model",
    execution_queue="default",
    parameter_override={
        "General/preprocess_task_id": "${s1_data_preprocessing.id}",
        'General/num_epochs': 20,
        'General/batch_size': 32,
        'General/learning_rate': 1e-3,
        'General/weight_decay': 1e-5
    }
)

pipe.add_step(
    name="s3_evaluate_model",
    parents=["s2_train_model", "s1_data_preprocessing"],
    base_task_project="NutritionAnalyser",
    base_task_name="s3_evaluate_model",
    execution_queue="default",
    parameter_override={
        "General/preprocess_task_id": "${s1_data_preprocessing.id}",
        "General/train_task_id": "${s2_train_model.id}",
        "General/batch_size": 32
    }
) 

# Start the pipeline locally but tasks will run on queue
logger.info("Starting pipeline locally with tasks on queue: default")
pipe.start_locally()
logger.info("Pipeline started successfully")