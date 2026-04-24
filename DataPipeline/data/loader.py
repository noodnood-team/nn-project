def load_data():
    from clearml import Dataset
    import logging

    logger = logging.getLogger(__name__)
    logger.info("start loading dataset from ClearML...")

    try:
        ds = Dataset.get(
            dataset_name="nutrition5k_dataset",
            dataset_project="NutritionAnalyser"
        )
        local_path = ds.get_local_copy()
        logger.info(f"Loaded raw dataset: {ds.name}")
        logger.info(f"Dataset local path: {local_path}")
        logger.info("finished loading dataset from ClearML.")
        return local_path

    except Exception as e:
        raise RuntimeError(f"Error loading dataset: {e}")