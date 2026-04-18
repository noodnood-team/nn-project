import numpy as np

def feature_engineering(df):
    # log-transform nutritional values to reduce skewness in the distribution and make it easier for the model to learn
    df["calories_log"] = np.log1p(df["total_calories"])
    df["protein_log"] = np.log1p(df["total_protein"])
    df["carb_log"] = np.log1p(df["total_carb"])
    df["fat_log"] = np.log1p(df["total_fat"])

    return df