#!/bin/bash

# Target directory for resized images and YAML templates
TARGET_DIR="../public/items"
mkdir -p "$TARGET_DIR"

# Loop through all images in the folder
for IMAGE_PATH in *.{jpg,jpeg,png,gif,bmp,JPG,JPEG,PNG,GIF,BMP}; do
  # Check if glob didn't match anything
  [ -e "$IMAGE_PATH" ] || continue

  FILENAME=$(basename "$IMAGE_PATH")
  BASENAME="${FILENAME%.*}"
  BASENAME="${BASENAME// /-}"
  EXT="${FILENAME##*.}"
  # Convert extension to lowercase for consistency
  EXT=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
  
  TARGET_IMAGE="$TARGET_DIR/$BASENAME.$EXT"
  TARGET_YAML="$TARGET_DIR/$BASENAME.yaml"

  # Resize image if it doesn't already exist in the target directory
  if [ ! -f "$TARGET_IMAGE" ]; then
    echo "Resizing $FILENAME..."
    # Resize image using macOS sips (max 800px width/height)
    sips -Z 800 "$IMAGE_PATH" --out "$TARGET_IMAGE" > /dev/null
  else
    echo "Skipping $FILENAME - already resized."
  fi

  # Create YAML template if it doesn't exist
  if [ ! -f "$TARGET_YAML" ]; then
    cat <<EOF > "$TARGET_YAML"
- title: "Replace with Item Title"
  description: "Detailed description of the item."
  productlink: ""
  tags: []
EOF
    echo "Created template $TARGET_YAML"
  fi
done

echo "Batch processing complete. Please edit the YAML files in public/items/ to provide details."
