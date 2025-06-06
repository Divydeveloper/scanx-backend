import os
import shutil
import splitfolders  # install via: pip install split-folders

# Path to extracted dataset
input_folder = r"C:\Users\divya\OneDrive\Desktop\brain_tumor_dataset"

# Output directory for train/val/test
output_folder = 'brain_data_split'

# Split data: 80% train, 10% val, 10% test
splitfolders.ratio(input_folder, output=output_folder, seed=42, ratio=(0.8, 0.1, 0.1))
