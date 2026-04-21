from flask import Flask, request, jsonify
import torch
from DataPipeline.model.model import resnet_model  # แก้ตาม model ของคุณ
from PIL import Image
import torchvision.transforms as transforms

app = Flask(__name__)

# โหลด model
model = resnet_model()
model.load_state_dict(torch.load("artifacts/model/model.pth"))
model.eval()

# การแปลงภาพให้เหมาะสมกับ model
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # รับข้อมูลจาก request (คาดว่าจะเป็นรูป)
        img_file = request.files["image"]
        img = Image.open(img_file.stream).convert("RGB")
        img = transform(img).unsqueeze(0)

        # ใช้ model ทำนาย
        with torch.no_grad():
            outputs = model(img)
            _, predicted = torch.max(outputs, 1)

        return jsonify({"prediction": predicted.item()})
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)