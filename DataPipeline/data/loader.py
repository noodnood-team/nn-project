def load_data():
    from clearml import Dataset
    import logging
    from clearml import Task
    import os
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    Task.set_credentials(
     api_host="https://api.clear.ml",
     web_host="https://app.clear.ml",
     files_host="https://files.clear.ml",
     key=os.getenv('clear_ml_key'), # get it from https://app.clear.ml/settings/workspace-configuration
     secret=os.getenv('clear_ml_secret') # get it from https://app.clear.ml/settings/workspace-configuration
    )

    print("start loading dataset from ClearML...")
    print(os.getenv('clear_ml_key'))
    
    try:
        ds = Dataset.get(
            dataset_name="nutrition5k_dataset",
            dataset_project="NutritionAnalyser"
        )
        local_path = ds.get_local_copy()
        logger.info(f"Loaded raw dataset: {ds.name}")
        print("finished loading dataset from ClearML.")
        return local_path

    except Exception as e:
        raise RuntimeError(f"Error loading dataset: {e}")