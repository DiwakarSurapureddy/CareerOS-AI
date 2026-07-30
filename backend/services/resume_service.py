import os
import uuid
import logging
import mimetypes
from werkzeug.utils import secure_filename
from flask import current_app
from utils.pdf_parser import extract_text_from_pdf
from utils.docx_parser import extract_text_from_docx
from utils.txt_parser import extract_text_from_txt
from services.resume_parser import RuleBasedResumeParser
from models.resume import Resume

logger = logging.getLogger(__name__)

class ResumeService:
    """Service orchestrating secure upload validation, disk storage, document extraction, parsing, and MongoDB persistence."""
    
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}
    ALLOWED_MIMES = {
        'pdf': ['application/pdf'],
        'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream', 'application/zip'],
        'txt': ['text/plain']
    }
    FORBIDDEN_EXTENSIONS = {'exe', 'sh', 'bat', 'cmd', 'msi', 'js', 'vbs', 'scr', 'jar', 'dll'}

    @classmethod
    def process_upload(cls, file_obj, user_id: str):
        """
        Validate, save, extract text, parse resume content, and persist metadata to MongoDB.
        Returns (True, result_dict, status_code) on success, or (False, error_msg, status_code) on failure.
        """
        if not file_obj or file_obj.filename == '':
            return False, "No resume file selected or attached in request.", 400

        original_filename = file_obj.filename.strip()
        ext = cls._get_extension(original_filename)

        # 1. Security: Block executables and validate extension
        if ext in cls.FORBIDDEN_EXTENSIONS:
            return False, "Security rejection: Executable and scripting file types are strictly prohibited.", 415
            
        if ext not in cls.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Supported formats are PDF, DOCX, and TXT.", 415

        # 2. Security & Validation: MIME Type inspection where possible
        mimetype = file_obj.mimetype or mimetypes.guess_type(original_filename)[0]
        if mimetype and not any(mimetype.lower() in allowed_m for allowed_m in cls.ALLOWED_MIMES.values()):
            if ext == 'docx' and ('application' in mimetype.lower() or 'octet' in mimetype.lower() or 'zip' in mimetype.lower()):
                pass
            elif ext == 'txt' and ('text' in mimetype.lower() or 'octet' in mimetype.lower()):
                pass
            elif ext == 'pdf' and 'pdf' in mimetype.lower():
                pass
            else:
                logger.warning(f"MIME verification mismatch for '{original_filename}': detected {mimetype}")

        # 3. Security: Secure filename & generate unique prefix to prevent overwrite conflicts and path traversal
        safe_original = secure_filename(original_filename)
        if not safe_original:
            safe_original = f"resume_{uuid.uuid4().hex[:6]}.{ext}"

        unique_prefix = uuid.uuid4().hex
        stored_filename = f"{unique_prefix}_{safe_original}"
        upload_dir = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, stored_filename)

        # 4. Save file to disk
        try:
            file_obj.save(file_path)
            logger.info(f"Resume saved successfully to storage: {stored_filename}")
        except Exception as e:
            logger.error(f"File system save error for {stored_filename}: {e}")
            return False, "Failed to write uploaded resume file to disk storage.", 500

        # Validate maximum file size limit post-save
        max_size = current_app.config.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024)
        if os.path.exists(file_path) and os.path.getsize(file_path) > max_size:
            cls._remove_file_silent(file_path)
            return False, f"File size exceeds the maximum allowed limit of {max_size // (1024*1024)}MB.", 413
            
        if os.path.exists(file_path) and os.path.getsize(file_path) == 0:
            cls._remove_file_silent(file_path)
            return False, "The uploaded resume file is completely empty (0 bytes).", 400

        # 5. Extract text using format-specific document parsers
        success, extract_result = cls._extract_text(file_path, ext)
        if not success:
            cls._remove_file_silent(file_path)
            return False, extract_result, 422  # 422 Unprocessable Entity for corrupted / image-only files

        raw_text = extract_result

        # 6. Parse structured resume metadata via rule-based extraction
        parsed_data = RuleBasedResumeParser.parse(raw_text)

        # 7. Store metadata in MongoDB resumes collection
        created, db_result = Resume.create(
            user_id=user_id,
            original_filename=safe_original,
            stored_filename=stored_filename,
            file_type=ext,
            file_path=file_path,
            extracted_text=raw_text,
            parsed_data=parsed_data
        )

        if not created:
            cls._remove_file_silent(file_path)
            return False, f"Database persistence failed while saving resume record: {db_result}", 500

        # Return standardized data without exposing server disk path
        response_data = {
            "resume_id": db_result["id"],
            "filename": safe_original,
            "file_type": ext,
            "parsed_data": parsed_data
        }
        return True, response_data, 201

    @classmethod
    def delete_resume(cls, resume_id: str, user_id: str):
        """Delete database record and remove corresponding uploaded file from disk storage."""
        doc = Resume.find_by_id(resume_id, user_id=user_id)
        if not doc:
            return False, "Resume not found or you do not have authorization to delete it.", 404

        file_path = doc.get("file_path")
        if file_path and os.path.exists(file_path):
            cls._remove_file_silent(file_path)

        deleted = Resume.delete(resume_id, user_id=user_id)
        if not deleted:
            return False, "Failed to delete resume record from database.", 500

        return True, "Resume deleted successfully.", 200

    @classmethod
    def _extract_text(cls, file_path: str, ext: str):
        if ext == 'pdf':
            return extract_text_from_pdf(file_path)
        elif ext == 'docx':
            return extract_text_from_docx(file_path)
        elif ext == 'txt':
            return extract_text_from_txt(file_path)
        return False, f"Unsupported file format '{ext}'"

    @staticmethod
    def _get_extension(filename: str) -> str:
        if '.' not in filename:
            return ''
        return filename.rsplit('.', 1)[-1].lower().strip()

    @staticmethod
    def _remove_file_silent(file_path: str):
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.debug(f"Purged storage file: {file_path}")
        except Exception as e:
            logger.warning(f"Unable to delete storage file {file_path}: {e}")
