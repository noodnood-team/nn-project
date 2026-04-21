def step_feature(processed_path):
    import os
    import sys
    # Get the current path of the cmd
    system_path = os.getcwd()
    sys.path.append(system_path)

    from DataPipeline.data.feature_engineering import feature_engineering
    import pandas as pd
    import logging

    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    df = pd.read_parquet(processed_path)
    df = feature_engineering(df)

    os.makedirs("artifacts/featured", exist_ok=True)
    save_path = "artifacts/featured/data.parquet"
    df.to_parquet(save_path)

    logger.info(f"Saved featured dataset to {save_path}")
    logger.info("Feature engineering step completed successfully.")
    return save_path