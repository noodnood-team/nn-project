from clearml import Task
import os
import logging
import pandas as pd
import sys

system_path = os.getcwd()
sys.path.append(system_path)

from DataPipeline.data.feature_engineering import feature_engineering

def main():
    task = Task.init(
        project_name="NutritionAnalyser",
        task_name="step_feature_base",
        task_type=Task.TaskTypes.data_processing,
    )

    logging.basicConfig(level=logging.INFO, force=True)
    logger = logging.getLogger(__name__)

    params = {
        "processed_path": "",
        "output_path": "artifacts/featured/data.pkl",
    }
    params = task.connect(params)

    logger.info("Feature engineering step started")

    df = pd.read_pickle(params["processed_path"])
    df = feature_engineering(df)

    os.makedirs(os.path.dirname(params["output_path"]), exist_ok=True)
    df.to_pickle(params["output_path"])

    task.upload_artifact(
        name="featured_data",
        artifact_object=params["output_path"]
    )

    logger.info("Feature engineering step completed")


if __name__ == "__main__":
    main()