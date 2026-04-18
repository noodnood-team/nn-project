def step_preprocess():
    from data.loader import load_data
    from data.preprocessing import preprocessing
    from clearml import Task
    import os
    import pandas as pd
    import logging

    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    # Load the raw dataset from ClearML
    path = load_data()
    df = preprocessing(path)

    os.makedirs("artifacts/processed", exist_ok=True)
    save_path = "artifacts/processed/data.parquet"
    df.to_parquet(save_path)
    logger.info(f"Saved preprocessed dataset to {save_path}")

    logger.info("Preprocessing step completed successfully.")
    return save_path