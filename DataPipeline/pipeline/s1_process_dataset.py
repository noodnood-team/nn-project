from clearml import Task
import os
import logging
import sys

system_path = os.getcwd()
sys.path.append(system_path)

from DataPipeline.data.loader import load_data
from DataPipeline.data.preprocessing import preprocessing

def main():
    task = Task.init(
        project_name="NutritionAnalyser",
        task_name="step_preprocess_base",
        task_type=Task.TaskTypes.data_processing,
    )

    logging.basicConfig(level=logging.INFO, force=True)
    logger = logging.getLogger(__name__)

    params = {
        "output_path": "artifacts/processed/data.pkl",
    }
    params = task.connect(params)

    logger.info("Preprocessing step started")

    path = load_data()
    df = preprocessing(path)

    os.makedirs(os.path.dirname(params["output_path"]), exist_ok=True)
    df.to_pickle(params["output_path"])

    task.upload_artifact(
        name="processed_data",
        artifact_object=params["output_path"]
    )

    logger.info("Preprocessing step completed")


if __name__ == "__main__":
    main()