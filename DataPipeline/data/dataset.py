from clearml import Dataset
from PIL import Image
import torch


class FoodDataset(Dataset):
    def __init__(self, df, transform=None):
        self.df = df
        self.transform = transform

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        try:
            img = Image.open(row["image_path"]).convert("RGB")
        except:
            return self.__getitem__((idx + 1) % len(self.df))

        if self.transform:
            img = self.transform(img)

        label = torch.tensor([
            row["calories_log"],
            row["protein_log"],
            row["carb_log"],
            row["fat_log"]
        ], dtype=torch.float32)
        
        return img, label