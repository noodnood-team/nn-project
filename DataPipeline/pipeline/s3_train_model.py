def step_train(feature_path):
    import os
    import sys
    # Get the current path of the cmd
    system_path = os.getcwd()
    sys.path.append(system_path)
    
    import logging
    import pandas as pd
    from DataPipeline.data.split import split_data
    from DataPipeline.data.create_dataloader import create_dataloader
    from DataPipeline.model.train import train
    from DataPipeline.model.model import resnet_model, get_training_components
    from DataPipeline.model.save_model import save_model

    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    df = pd.read_parquet(feature_path)

    train_df, test_df = split_data(df)
    train_loader, test_loader = create_dataloader(train_df, test_df)

    model, device = resnet_model()
    criterion, optimizer = get_training_components(model)

    train(model, train_loader, criterion, optimizer, device)
    save_model(model, "artifacts/model/model.pth")

    logger.info("Training step completed successfully.")
    return "artifacts/model/model.pth"