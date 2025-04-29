from google.cloud import vision

def extract_text_from_image(content: bytes, vision_client, extract_feeding_table=False):
    """
    Extract text from image bytes using Google Vision API.
    If extract_feeding_table=True, try to structure the result into feeding guideline rows.
    """
    image = vision.Image(content=content)
    response = vision_client.text_detection(image=image)

    if not response.text_annotations:
        return "" if not extract_feeding_table else []

    full_text = response.text_annotations[0].description

    if extract_feeding_table:
        return parse_feeding_guidelines(full_text)

    return full_text


def parse_feeding_guidelines(raw_text):
    """
    Try to extract structured feeding guideline rows from raw OCR text.
    Returns a list of dictionaries with keys: weight, amount, notes.
    """
    lines = raw_text.strip().split('\\n')
    structured = []

    for line in lines:
        parts = line.strip().split()
        if len(parts) >= 2:
            structured.append({
                'weight': parts[0],
                'amount': parts[1],
                'notes': ' '.join(parts[2:]) if len(parts) > 2 else ''
            })

    return structured
