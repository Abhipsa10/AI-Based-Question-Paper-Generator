import os
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import PyPDF2
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

def extract_text_from_pdf(file_obj):
    text = ""
    try:
        reader = PyPDF2.PdfReader(file_obj)
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

@app.route('/generate', methods=['POST'])
def generate_paper():
    if not os.environ.get("GROQ_API_KEY"):
        return jsonify({"error": "GROQ_API_KEY is missing. Please add it to the .env file."}), 500

    subject = request.form.get('subject', 'General Subject')
    marks = request.form.get('marks', '100')
    difficulty = request.form.get('difficulty', 'Standard')
    exam_type = request.form.get('examType', 'End Semester')
    
    syllabus_text = ""
    pyqs_text = ""

    # Process Syllabus File
    if 'syllabus' in request.files:
        syllabus_file = request.files['syllabus']
        if syllabus_file.filename != '':
            print(f"-> Uploaded Syllabus: {syllabus_file.filename}")
            if syllabus_file.filename.lower().endswith('.pdf'):
                syllabus_text = extract_text_from_pdf(syllabus_file)
            elif syllabus_file.filename.lower().endswith('.txt'):
                syllabus_text = syllabus_file.read().decode('utf-8', errors='ignore')
            else:
                syllabus_text = ""
                print(f"   WARNING: Unsupported syllabus format ({syllabus_file.filename}). Use PDF or TXT.")
            print(f"   Extracted {len(syllabus_text)} characters from Syllabus.")
                
    # Process PYQs File
    if 'pyqs' in request.files:
        pyqs_file = request.files['pyqs']
        if pyqs_file.filename != '':
            print(f"-> Uploaded PYQs: {pyqs_file.filename}")
            if pyqs_file.filename.lower().endswith('.pdf'):
                pyqs_text = extract_text_from_pdf(pyqs_file)
            elif pyqs_file.filename.lower().endswith('.txt'):
                pyqs_text = pyqs_file.read().decode('utf-8', errors='ignore')
            else:
                pyqs_text = ""
                print(f"   WARNING: Unsupported PYQ format ({pyqs_file.filename}). Use PDF or TXT.")
            print(f"   Extracted {len(pyqs_text)} characters from PYQs.")

    # Allowing much larger text context for full syllabus and PYQs reading
    # LLaMA 3.3 70B versatile supports up to 128k tokens, so ~200k chars is safe.
    syllabus_text = syllabus_text[:200000]
    pyqs_text = pyqs_text[:200000]

    prompt = f"""
    You are an expert academic AI assistant tasked with generating a high-quality college-level question paper.
    
    CRITICAL CONSTRAINTS:
    1. Use ONLY the content inside the uploaded syllabus and PYQ PDFs for ALL question types (MCQ, short, long).
    2. Long questions MUST also come directly from the uploaded files' concepts, topics, explanations, formulas, and derivations.
    3. You are NOT allowed to create or imagine any generic or easy questions.
    4. This is a COLLEGE-LEVEL exam, so long questions must be technical, detailed, and syllabus-based.
    5. If any topic or concept is NOT found in the PDF, do NOT make a question from it.
    6. Maintain the selected difficulty level ({difficulty}) for ALL sections.
    7. If the long-question content is insufficient inside the PDFs, ask for more files by returning {{"error": "Insufficient content. Please upload more files instead of generating childish questions."}} instead of generating fake questions.
    8. Avoid repeating previous PYQs.
    9. Generate AS MANY valid questions as possible based ONLY on the provided material, guided by the Exam Type below. Just return the JSON with whatever number of valid questions you could extract.
    
    Requirements:
    - Subject: {subject}
    - Difficulty Profile: {difficulty}
    - Exam Type: {exam_type}
    
    Exam Type Guidelines:
    - Unit Test: small paper, 1-2 units only (approx. 5 MCQs, 3 Short Answers, 2 Long Answers).
    - Mid Semester: moderate length, selective units (approx. 10 MCQs, 5 Short Answers, 5 Long Answers).
    - End Semester: full syllabus, mixed difficulty (approx. 10 MCQs, 10 Short Answers, 10 Long Answers).
    - Remedial Exam: conceptual, simplified but still syllabus-based (approx. 10 MCQs, 5 Short Answers, 5 Long Answers).
    
    Syllabus Content:
    {syllabus_text if syllabus_text else 'No specific syllabus provided. Use general knowledge.'}
    
    Previous Year Questions (PYQs):
    {pyqs_text if pyqs_text else 'No previous questions provided.'}
    
    Format the output with proper numbering and marks.
    Generate questions divided into Section A (MCQs, 1 mark), Section B (Short Answer, 2 marks), and Section C (Long Answer, 5 marks).
    
    For Answer Key generation, you MUST provide the correct answer and a detailed explanation for every question.
    
    Respond STRICTLY in the following JSON format without any markdown or extra text:
    {{
        "sectionA": [
            {{"q_num": "Q1", "text": "Question text here", "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"], "answer": "A) Option 1", "explanation": "Why this is correct", "marks": 1}},
            ...
        ],
        "sectionB": [
            {{"q_num": "Q11", "text": "Short answer question text here", "explanation": "Detailed explanation/answer", "marks": 2}},
            ...
        ],
        "sectionC": [
            {{"q_num": "Q21", "text": "Long descriptive question text here", "detailed_answer": "Comprehensive answer covering all points", "marks": 5}},
            ...
        ]
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON-only response bot. You must only output valid JSON based on the requested structure. Do not output markdown backticks."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        response_content = chat_completion.choices[0].message.content
        data = json.loads(response_content)
        
        if "error" in data:
            return jsonify({"error": data["error"]}), 400
            
        return jsonify({"success": True, "data": data})

    except Exception as e:
        print("Groq API Error:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/replace', methods=['POST'])
def replace_question():
    if not os.environ.get("GROQ_API_KEY"):
        return jsonify({"error": "GROQ_API_KEY is missing. Please add it to the .env file."}), 500

    subject = request.form.get('subject', 'General Subject')
    difficulty = request.form.get('difficulty', 'Standard')
    q_type = request.form.get('type', 'MCQ') # MCQ, Short, Long
    q_num = request.form.get('q_num', 'Q1')
    marks = request.form.get('marks', '1')
    
    syllabus_text = ""
    pyqs_text = ""

    # Process Syllabus File
    if 'syllabus' in request.files:
        syllabus_file = request.files['syllabus']
        if syllabus_file.filename != '':
            if syllabus_file.filename.lower().endswith('.pdf'):
                syllabus_text = extract_text_from_pdf(syllabus_file)
            elif syllabus_file.filename.lower().endswith('.txt'):
                syllabus_text = syllabus_file.read().decode('utf-8', errors='ignore')
                
    # Process PYQs File
    if 'pyqs' in request.files:
        pyqs_file = request.files['pyqs']
        if pyqs_file.filename != '':
            if pyqs_file.filename.lower().endswith('.pdf'):
                pyqs_text = extract_text_from_pdf(pyqs_file)
            elif pyqs_file.filename.lower().endswith('.txt'):
                pyqs_text = pyqs_file.read().decode('utf-8', errors='ignore')

    syllabus_text = syllabus_text[:200000]
    pyqs_text = pyqs_text[:200000]

    prompt = f"""
    You are an expert academic AI assistant. You need to generate a SINGLE replacement question for a college-level exam.
    
    Requirements:
    - Subject: {subject}
    - Difficulty Profile: {difficulty}
    - Question Type: {q_type} (MCQ, Short Answer, or Long Answer)
    - Question Number to assign: {q_num}
    - Marks: {marks}
    
    CRITICAL CONSTRAINTS:
    1. Use ONLY the content inside the uploaded syllabus and PYQ PDFs.
    2. Do NOT create or imagine generic questions.
    3. If content is insufficient, return an error.
    
    Syllabus Content:
    {syllabus_text if syllabus_text else 'No specific syllabus provided.'}
    
    Previous Year Questions (PYQs):
    {pyqs_text if pyqs_text else 'No previous questions provided.'}
    
    Respond STRICTLY in the following JSON format without any markdown or extra text.
    If MCQ:
    {{
        "q_num": "{q_num}", "text": "Question text here", "options": ["A) Opt 1", "B) Opt 2", "C) Opt 3", "D) Opt 4"], "answer": "A) Opt 1", "explanation": "Why this is correct", "marks": {marks}
    }}
    If Short Answer:
    {{
        "q_num": "{q_num}", "text": "Short answer question text here", "explanation": "Detailed explanation/answer", "marks": {marks}
    }}
    If Long Answer:
    {{
        "q_num": "{q_num}", "text": "Long descriptive question text here", "detailed_answer": "Comprehensive answer covering all points", "marks": {marks}
    }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON-only response bot. You must only output valid JSON based on the requested structure. Do not output markdown backticks."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        
        response_content = chat_completion.choices[0].message.content
        data = json.loads(response_content)
        
        if "error" in data:
            return jsonify({"error": data["error"]}), 400
            
        return jsonify({"success": True, "data": data})

    except Exception as e:
        print("Groq API Error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000))
    )
