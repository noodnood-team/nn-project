# nn-project

This project is designed to automate a data processing and machine learning workflow. It utilizes ClearML for pipeline management and includes modules for data loading, preprocessing, feature engineering, model training, and evaluation.

## Project Structure
- **DataPipeline**: Contains scripts for data handling, model training, and pipeline automation.
- **artifacts**: Stores data and model artifacts.
- **model_service**: Hosts a Flask application for model inference.

## Installation

Ensure you have Python 3.8 or higher installed. To install the required packages, run:

```bash
pip install -r requirements.txt
```

## Usage

To start the data processing and training pipeline, run:

```bash
py DataPipeline/pipeline/clearml_pipeline.py
```

## Running the Model Service

After training, you can start the model service with Flask to serve predictions:

```bash
py model_service/app.py
```

## Key Technologies
- Python
- Flask
- PyTorch
- ClearML
- Scikit-learn
