import json
import ast

input_file = "imagenet_labels.json"
output_file = "imagenet_labels_array.json"

# Read the raw file as text
with open(input_file, "r") as f:
    raw_text = f.read()

# Use ast.literal_eval to parse Python-style dict
data_dict = ast.literal_eval(raw_text)

# Convert dict to array of values sorted by key
labels_array = [data_dict[i] for i in range(len(data_dict))]

# Save as valid JSON array
with open(output_file, "w") as f:
    json.dump(labels_array, f, indent=2)

print(f"Converted {input_file} → {output_file} as a proper JSON array.")
