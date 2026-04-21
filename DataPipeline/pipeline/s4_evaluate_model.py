def step_evaluate(model_path, feature_path):
    import torch
    import pandas as pd

    from DataPipeline.data.split import split_data
    from DataPipeline.data.create_dataloader import create_dataloader
    from DataPipeline.model.model import resnet_model
    from DataPipeline.model.evaluation import eval

    from clearml import Task

    logger = Task.current_task().get_logger()

    df = pd.read_parquet(feature_path)

    train_df, test_df = split_data(df)
    _, test_loader = create_dataloader(train_df, test_df)


    model, device = resnet_model()
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.to(device)

    criterion = torch.nn.MSELoss()


    val_loss = eval(test_loader, model, criterion, device)

    return val_loss