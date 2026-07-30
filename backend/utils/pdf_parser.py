import logging
import fitz  # PyMuPDF

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path: str):
    """
    Extract text from a PDF file using PyMuPDF (fitz).
    Returns (True, extracted_text) on success, or (False, error_message) on failure.
    """
    try:
        doc = fitz.open(file_path)
    except Exception as e:
        logger.error(f"Failed to open PDF file at {file_path}: {e}")
        return False, "Failed to open or parse the PDF file. The file may be corrupted or invalid."
        
    try:
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text and text.strip():
                text_parts.append(text.strip())
                
        doc.close()
        
        combined_text = "\n\n".join(text_parts).strip()
        if not combined_text:
            return False, "No selectable text found in the PDF. If this is an image-only or scanned resume, OCR processing is required."
            
        return True, combined_text
    except Exception as e:
        logger.error(f"Error extracting text from PDF pages {file_path}: {e}")
        doc.close()
        return False, f"Error extracting text from PDF file: {str(e)}"
