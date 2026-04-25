from clearml import Task
import torch
from torchvision import models

def load_model_from_clearml(train_task_id):
    s2_task = Task.get_task(task_id=train_task_id)

    model_path = s2_task.artifacts["model"].get_local_copy()

    model = models.resnet18(pretrained=False)
    model.fc = torch.nn.Linear(model.fc.in_features, 4)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)

    model.eval()
    model = model.to(device)

    return model, device