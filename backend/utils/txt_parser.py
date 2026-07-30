import logging

logger = logging.getLogger(__name__)

def extract_text_from_txt(file_path: str):
    """
    Safely read a plain TXT resume file with UTF-8 and fallback encoding handling.
    Returns (True, extracted_text) on success, or (False, error_message) on failure.
    """
    encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'utf-16']
    
    for enc in encodings:
        try:
            with open(file_path, 'r', encoding=enc, errors='strict') as f:
                content = f.read().strip()
                if not content:
                    return False, "The TXT document appears to be completely empty."
                return True, content
        except UnicodeDecodeError:
            continue
        except Exception as e:
            logger.error(f"Error reading TXT file {file_path} with encoding {enc}: {e}")
            return False, f"Error reading TXT file: {str(e)}"
            
    # Fallback with ignore/replace if strict failed across all tested encodings
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read().strip()
            if not content:
                return False, "The TXT document appears to be completely empty."
            return True, content
    except Exception as e:
        logger.error(f"Fallback reading failed for TXT file {file_path}: {e}")
        return False, "Failed to decode the TXT file due to severe formatting or encoding issues."
