def save_model(model, path):
    from clearml import Task, OutputModel
    import torch
    import os

    os.makedirs(os.path.dirname(path), exist_ok=True)
    torch.save(model.state_dict(), path)

    task = Task.current_task()
    output_model = OutputModel(task=task)
    output_model.update_weights(path)

    return None