def eval(test_loader, model, criterion, device):
    import torch
    from clearml import Task

    logger = Task.current_task().get_logger()

    model.eval()
    val_loss = 0

    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs, labels = imgs.to(device), labels.to(device)

            outputs = model(imgs)
            loss = criterion(outputs, labels)
            val_loss += loss.item()

    avg_loss = val_loss / len(test_loader)

    print("Validation Loss:", avg_loss)

    logger.report_scalar(
        title="loss",
        series="test",
        value=avg_loss,
        iteration=0
    )
    return avg_loss