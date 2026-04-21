def train(model, train_loader, criterion, optimizer, device):
    from clearml import Task
    import torch
    logger = Task.current_task().get_logger()
    
    patience=10
    min_delta=0.001 

    # Initialize early stopping parameters
    best_loss = float('inf')
    epochs_no_improve = 0

    for epoch in range(50):
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