def train(model, train_loader, criterion, optimizer, device):
    from clearml import Task
    logger = Task.current_task().get_logger()
    
    for epoch in range(5):
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

    return None