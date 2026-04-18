# Parse raw metadata files and build a dataframe with the following columns:
def parse_basic(path):
    import pandas as pd
    rows = []

    with open(path) as f:
        for line in f:
            parts = line.strip().split(",")

            try:
                rows.append({
                    "dish_id": parts[0].replace("dish_", ""),
                    "total_calories": float(parts[1]),
                    "total_mass": float(parts[2]),
                    "total_fat": float(parts[3]),
                    "total_carb": float(parts[4]),
                    "total_protein": float(parts[5]),
                })
            except:
                continue

    return pd.DataFrame(rows)

def clean_data(df):
    # remove rows with zero calories
    df_nozero = df[df["total_calories"] > 0]

    return df_nozero

# output = dataframe with the following columns: dish_id, total_calories, total_mass, total_fat, total_carb, total_protein, image_path
def preprocessing(local_path):
    import logging
    import os
    import pandas as pd

    # Set up logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    df1 = parse_basic(os.path.join(local_path, "dish_metadata_cafe1.csv"))
    df2 = parse_basic(os.path.join(local_path, "dish_metadata_cafe2.csv"))

    df = pd.concat([df1, df2], ignore_index=True)

    # map image path to each dish
    df["image_path"] = df["dish_id"].apply(
        lambda x: os.path.join(local_path, f"dish_{x}_rgb.png")
    )

    df = df[df["image_path"].apply(os.path.exists)]

    # remove rows with zero calories
    df = clean_data(df)

    logger.info("Preprocessed dataset with {} samples".format(len(df)))
    return df