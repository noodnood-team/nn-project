## output = path to the dataset on the local machine
def load_data():
    from clearml import Dataset
    import logging

    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        ds = Dataset.get(
            dataset_name="nutrition5k_dataset",
            dataset_project="NutritionAnalyser"
        )

        print("start loading dataset from ClearML...")
        local_path = ds.get_local_copy()
        logger.info(f"Loaded raw dataset: {ds.name}")
        print("finished loading dataset from ClearML.")
        return local_path

    except Exception as e:
        raise RuntimeError(f"Error loading dataset: {e}")