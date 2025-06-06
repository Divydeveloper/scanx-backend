from tensorflow.keras.models import load_model

# Load the trained model
model = load_model('models/chest_xray_model.h5')
model1 = load_model('models/brain_tumor_model.h5')
print("Model loaded successfully.")
from tensorflow.keras.preprocessing import image
import numpy as np

# Load the image
img_path = 'sample.jpg'  # Replace with path to your test image
img = image.load_img(img_path, target_size=(150, 150))
img_array = image.img_to_array(img)
img_array = np.expand_dims(img_array, axis=0) / 255.0  # Normalize

# Predict
prediction = model.predict(img_array)

# Interpret
result = "Pneumonia" if prediction[0][0] > 0.5 else "Normal"
print("Result:", result)
