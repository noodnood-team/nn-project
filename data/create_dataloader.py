def create_dataloader(train_df, test_df):
    import torchvision.transforms as transforms
    from torch.utils.data import DataLoader
    from data.dataset import FoodDataset
    
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)), 
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    test_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

    train_loader = DataLoader(
        FoodDataset(train_df, train_transform),
        batch_size=32,
        shuffle=True,
        num_workers=4,
        pin_memory=True
    )

    test_loader = DataLoader(
        FoodDataset(test_df, test_transform),
        batch_size=32,
        num_workers=4
    )

    return train_loader, test_loader