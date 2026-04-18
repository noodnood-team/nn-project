def split_data(df):
    from sklearn.model_selection import train_test_split
    import pandas as pd

    df["cal_bin"] = pd.qcut(df["total_calories"], q=5, labels=False) # create 5 bins of calories for stratified splitting

    train_df, test_df = train_test_split(df, test_size=0.3, random_state=42, stratify=df["cal_bin"]) # stratify by calorie bins to ensure similar distribution of calories in train and test sets
    train_df = train_df.drop(columns=["cal_bin"]).reset_index(drop=True)
    test_df = test_df.drop(columns=["cal_bin"]).reset_index(drop=True)

    # select only the columns we need for training the model
    train_df = train_df[[
        "image_path",
        "calories_log",
        "protein_log",
        "carb_log",
        "fat_log"
    ]]

    test_df = test_df[[
        "image_path",
        "calories_log",
        "protein_log",
        "carb_log",
        "fat_log"
    ]]

    return train_df, test_df