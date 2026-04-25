def resnet_model():
    import torchvision.models as models
    import torch.nn as nn
    import torch

    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, 4)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    return model, device

def get_training_components(model, learning_rate, weight_decay):
    import torch.optim as optim
    import torch.nn as nn

    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate, weight_decay=weight_decay)

    return criterion, optimizer

def train(model, train_loader, criterion, optimizer, device, num_epochs):
    from clearml import Task
    import torch
    logger = Task.current_task().get_logger()
    
    patience=10
    min_delta=0.001 

    # Initialize early stopping parameters
    best_loss = float('inf')
    epochs_no_improve = 0

    for epoch in range(num_epochs):
        model.train()
        total_loss = 0

        for imgs, labels in train_loader:
            imgs, labels = imgs.to(device), labels.to(device)

            outputs = model(imgs)
            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        avg_loss = total_loss / len(train_loader)

        logger.report_scalar(
            title="loss",
            series="train",
            value=avg_loss,
            iteration=epoch
        )

        print(f"Epoch {epoch+1}, Loss: {avg_loss:.4f}")

        # Early stopping check
        if avg_loss < best_loss - min_delta:
            best_loss = avg_loss
            epochs_no_improve = 0
            torch.save(model.state_dict(), 'best_Resnet18_model.pth')
        else:
            epochs_no_improve += 1

        if epochs_no_improve >= patience:
            print(f"Early stopping triggered after {epoch+1} epochs: no improvement for {patience} epochs.")
            break

    return None

def save_model(model, path):
    import torch
    import os

    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(model.state_dict(), path)
    return None

def eval(test_loader, model, criterion, device):
    import torch
    import numpy as np
    from clearml import Task
    from sklearn.metrics import mean_absolute_error, mean_squared_error

    logger = Task.current_task().get_logger()

    model.eval()
    val_loss = 0

    all_outputs = []
    all_labels = []

    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs, labels = imgs.to(device), labels.to(device)

            outputs = model(imgs)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

            all_outputs.append(outputs.cpu().numpy())
            all_labels.append(labels.cpu().numpy())

    avg_loss = val_loss / len(test_loader)

    # concatenate all outputs and labels
    y_pred = np.vstack(all_outputs)
    y_true = np.vstack(all_labels)

    # reverse log transformation
    y_pred = np.expm1(y_pred)
    y_true = np.expm1(y_true)

    # calculate MAE and RMSE
    mae = mean_absolute_error(y_true, y_pred)
    rmse = mean_squared_error(y_true, y_pred) ** 0.5

    print("Validation Loss:", avg_loss)
    print("MAE:", mae)
    print("RMSE:", rmse)

    # report metrics to ClearML logger
    logger.report_scalar("metrics", "mse_loss", value=float(avg_loss), iteration=0)
    logger.report_scalar("metrics", "mae", value=float(mae), iteration=0)
    logger.report_scalar("metrics", "rmse", value=float(rmse), iteration=0)

    return {
        "mse_loss": float(avg_loss),
        "mae": float(mae),
        "rmse": float(rmse)
    }