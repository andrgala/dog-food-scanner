from google.cloud import vision

def extract_text_from_image(content: bytes, vision_client):
    """
    Extract text from image bytes using Google Vision API.
    """
    image = vision.Image(content=content)
    response = vision_client.text_detection(image=image)

    if not response.text_annotations:
        return ""

    full_text = response.text_annotations[0].description
    return full_text
