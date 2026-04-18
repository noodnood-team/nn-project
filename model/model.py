def resnet_model():
    import torchvision.models as models
    import torch.nn as nn
    import torch

    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    for param in model.parameters():
        param.requires_grad = False
    model.fc = nn.Linear(model.fc.in_features, 4)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    return model, device

def get_training_components(model):
    import torch.optim as optim
    import torch.nn as nn

    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-4)

    return criterion, optimizer