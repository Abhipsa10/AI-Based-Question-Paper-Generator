document.addEventListener('DOMContentLoaded', () => {
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Scroll reveal animation using Intersection Observer
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Update active state in nav
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hide chatbot greeting after a few seconds automatically
    setTimeout(() => {
        const greeting = document.getElementById('chatGreeting');
        if (greeting && greeting.style.display !== 'none') {
            greeting.style.opacity = '0';
            setTimeout(() => {
                greeting.style.display = 'none';
            }, 500);
        }
    }, 8000);
});

// Chatbot functionality
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatGreeting = document.getElementById('chatGreeting');
    
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'flex';
        if (chatGreeting) chatGreeting.style.display = 'none';
    } else {
        chatWindow.style.display = 'none';
    }
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;
    
    const chatBody = document.getElementById('chatBody');
    
    // Add user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user';
    userMsgDiv.textContent = message;
    chatBody.appendChild(userMsgDiv);
    
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Simulate AI response
    setTimeout(() => {
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'chat-message bot';
        
        const lowerMsg = message.toLowerCase();
        let botResponse = '';

        // Advanced response dictionary
        const responses = [
            {
                keywords: ['hello', 'hi', 'hey', 'greetings'],
                answer: "Hello there! Welcome to EduAI. How can I assist you with generating your question paper today?"
            },
            {
                keywords: ['bloom', 'taxonomy', 'cognitive'],
                answer: "Our AI strictly maps to Bloom's Taxonomy. It analyzes the semantics of each question to automatically categorize it into Remembering, Understanding, Applying, Analyzing, Evaluating, or Creating, ensuring perfectly balanced assessments."
            },
            {
                keywords: ['repeat', 'repetition', 'duplicate', 'same'],
                answer: "We guarantee zero repetition! Our Zero Repetition Engine uses advanced vector similarity search to cross-reference thousands of previous papers, ensuring no question is mathematically or semantically duplicated."
            },
            {
                keywords: ['upload', 'own', 'custom', 'import', 'bank'],
                answer: "Yes, you can upload your own institution's question bank via CSV or Excel. Our AI will ingest it, automatically analyze the content, assign Bloom's levels, and add it to your secure database."
            },
            {
                keywords: ['math', 'equation', 'latex', 'formula', 'science'],
                answer: "Absolutely. The platform has native support for LaTeX and MathML. It perfectly renders complex mathematical equations, chemical formulas, and scientific notations for STEM subjects."
            },
            {
                keywords: ['export', 'download', 'format', 'pdf', 'word', 'docx'],
                answer: "Once generated, you can instantly export your question paper to a highly formatted PDF or DOCX file. It will automatically include your university's logo, headers, and specific margin requirements."
            },
            {
                keywords: ['price', 'cost', 'subscription', 'plan', 'buy'],
                answer: "We offer flexible enterprise pricing based on your institution's size and needs. Please reach out via our contact form to schedule a demo and get a tailored quote."
            },
            {
                keywords: ['weight', 'marks', 'distribution', 'balance'],
                answer: "Our Topic-Weightage Analyzer distributes marks dynamically. It looks at your syllabus priorities, credit hours, and module importance to automatically pair part-questions (like 2a and 2b) to sum up exactly to the section totals."
            },
            {
                keywords: ['how', 'work', 'process', 'steps'],
                answer: "It's a 4-step process: 1. You configure parameters (marks, difficulty). 2. The AI performs semantic search based on syllabus. 3. Algorithm balances marks and Bloom's levels. 4. You review, tweak, and export!"
            }
        ];

        // Find matching response
        for (const item of responses) {
            if (item.keywords.some(keyword => lowerMsg.includes(keyword))) {
                botResponse = item.answer;
                break;
            }
        }

        // Default fallback response
        if (!botResponse) {
            botResponse = "That's an interesting point! While I specialize in answering questions about EduAI's capabilities—like our zero-repetition engine, Bloom's taxonomy mapping, or custom question uploads—our support team would be happy to discuss deeper specifics with you.";
        }
        
        botMsgDiv.textContent = botResponse;
        chatBody.appendChild(botMsgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
}

// Generate Paper Modal Logic
function openGenerateModal() {
    document.getElementById('generateModal').classList.add('active');
    // Reset modal state
    document.getElementById('modalFormContent').style.display = 'block';
    document.getElementById('modalLoadingContent').style.display = 'none';
    document.getElementById('modalSuccessContent').style.display = 'none';
    document.getElementById('generateForm').reset();
}

function closeGenerateModal() {
    document.getElementById('generateModal').classList.remove('active');
}

let generatedPaperData = null;
let currentSubject = "";
let currentMarks = "";
let currentDifficulty = "";
let currentExamType = "";
let totalPapersGenerated = 1248;
let totalQuestionsInBank = 15400;

async function handleGenerateSubmit(event) {
    event.preventDefault();
    
    // Hide form, show loading
    document.getElementById('modalFormContent').style.display = 'none';
    document.getElementById('modalLoadingContent').style.display = 'block';
    
    const loadingText = document.getElementById('loadingText');
    const texts = [
        "Analyzing syllabus embeddings...",
        "Querying vector database...",
        "Applying Bloom's taxonomy...",
        "Balancing difficulty ratio...",
        "Finalizing document..."
    ];
    
    let step = 0;
    const interval = setInterval(() => {
        step++;
        if (step < texts.length) {
            loadingText.textContent = texts[step];
        }
    }, 1500);

    // Prepare form data
    const form = document.getElementById('generateForm');
    const formData = new FormData();
    
    const subjectSelect = document.getElementById('subject');
    currentSubject = subjectSelect.options[subjectSelect.selectedIndex].text;
    currentMarks = "60"; // Initial estimate, gets recalculated on download
    const difficultySelect = document.getElementById('difficulty');
    currentDifficulty = difficultySelect.options[difficultySelect.selectedIndex].text.split(' ')[0];
    const examTypeSelect = document.getElementById('examType');
    currentExamType = examTypeSelect.options[examTypeSelect.selectedIndex].text;

    formData.append('subject', currentSubject);
    formData.append('marks', currentMarks);
    formData.append('difficulty', currentDifficulty);
    formData.append('examType', currentExamType);
    
    const syllabusInput = document.getElementById('syllabus');
    if (syllabusInput.files.length > 0) {
        formData.append('syllabus', syllabusInput.files[0]);
    }
    
    const pyqsInput = document.getElementById('pyqs');
    if (pyqsInput.files.length > 0) {
        formData.append('pyqs', pyqsInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        clearInterval(interval);

        if (result.error) {
            alert("Backend Error: " + result.error);
            closeGenerateModal();
            return;
        }

        generatedPaperData = result.data;
        
        // Update Faculty Dashboard Stats dynamically
        totalPapersGenerated++;
        const qCount = (generatedPaperData.sectionA?.length || 0) + 
                       (generatedPaperData.sectionB?.length || 0) + 
                       (generatedPaperData.sectionC?.length || 0);
        totalQuestionsInBank += qCount;
        
        if(document.getElementById('papersGeneratedCount')) {
            document.getElementById('papersGeneratedCount').textContent = totalPapersGenerated.toLocaleString();
        }
        if(document.getElementById('questionsInBankCount')) {
            document.getElementById('questionsInBankCount').textContent = (totalQuestionsInBank / 1000).toFixed(1) + 'k';
        }

        // Add Recent Activity to Dashboard
        const facultyList = document.querySelector('.faculty-list');
        if(facultyList) {
            const li = document.createElement('li');
            li.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-sm); transition: transform 0.2s ease;";
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1.2rem;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary), var(--primary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);">YOU</div>
                    <div>
                        <h5 style="margin: 0; font-size: 1.05rem; color: var(--text-main);">Current Faculty</h5>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Self Generated: ${currentSubject}</p>
                    </div>
                </div>
                <span style="font-size: 0.8rem; font-weight: 600; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.3rem 0.8rem; border-radius: 2rem;">Just Now</span>
            `;
            facultyList.insertBefore(li, facultyList.firstChild);
        }
        
        // Show success
        document.getElementById('modalLoadingContent').style.display = 'none';
        document.getElementById('modalSuccessContent').style.display = 'block';

    } catch (error) {
        clearInterval(interval);
        console.error("Error connecting to backend:", error);
        alert("Failed to connect to the backend server. Please try again.");
        closeGenerateModal();
    }
}

function downloadMockPaper() {
    if (!generatedPaperData) {
        alert("No paper data available.");
        return;
    }

    let actualMarks = 0;
    if (generatedPaperData.sectionA) {
        actualMarks += generatedPaperData.sectionA.reduce((sum, q) => sum + (parseInt(q.marks) || 1), 0);
    }
    if (generatedPaperData.sectionB) {
        actualMarks += generatedPaperData.sectionB.reduce((sum, q) => sum + (parseInt(q.marks) || 5), 0);
    }
    if (generatedPaperData.sectionC) {
        actualMarks += generatedPaperData.sectionC.reduce((sum, q) => sum + (parseInt(q.marks) || 5), 0);
    }
    currentMarks = actualMarks.toString();

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add content to PDF
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(109, 40, 217); // Primary color
        doc.text("EduAI Generated Assessment", 105, 30, null, null, "center");
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); // Muted text
        doc.text(`Subject: ${currentSubject}`, 20, 50);
        doc.text(`Total Marks: ${currentMarks}`, 20, 58);
        doc.text(`Difficulty Profile: ${currentDifficulty}`, 20, 66);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 74);
        
        // Add a line separator
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 85, 190, 85);
        
        let currentY = 100;

        const checkPageBreak = (addedHeight) => {
            if (currentY + addedHeight > 280) {
                doc.addPage();
                currentY = 20;
            }
        };

        // Render Section A
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42); // Main text
        checkPageBreak(15);
        doc.text("Section A: Multiple Choice Questions (1 Mark Each)", 20, currentY);
        currentY += 15;
        
        doc.setFont("helvetica", "normal");
        if (generatedPaperData.sectionA) {
            generatedPaperData.sectionA.forEach(q => {
                const textLines = doc.splitTextToSize(`${q.q_num}. ${q.text} [${q.marks} Mark]`, 170);
                checkPageBreak(textLines.length * 7);
                doc.text(textLines, 20, currentY);
                currentY += (textLines.length * 7) + 3;
                
                if (q.options) {
                    q.options.forEach(opt => {
                        const optLines = doc.splitTextToSize(`   ${opt}`, 170);
                        checkPageBreak(optLines.length * 7);
                        doc.text(optLines, 20, currentY);
                        currentY += (optLines.length * 7) + 1;
                    });
                }
                currentY += 6; // Space after each question
            });
        }
        
        currentY += 5;

        // Render Section B
        checkPageBreak(25);
        doc.setFont("helvetica", "bold");
        doc.text("Section B: Short Answer Questions", 20, currentY);
        currentY += 15;
        
        doc.setFont("helvetica", "normal");
        if (generatedPaperData.sectionB) {
            generatedPaperData.sectionB.forEach(q => {
                const textLines = doc.splitTextToSize(`${q.q_num}. ${q.text} [${q.marks} Marks]`, 170);
                checkPageBreak(textLines.length * 7);
                doc.text(textLines, 20, currentY);
                currentY += (textLines.length * 7) + 8;
            });
        }
        
        currentY += 5;

        // Render Section C
        if (generatedPaperData.sectionC && generatedPaperData.sectionC.length > 0) {
            checkPageBreak(25);
            doc.setFont("helvetica", "bold");
            doc.text("Section C: Long Answer Questions", 20, currentY);
            currentY += 15;
            
            doc.setFont("helvetica", "normal");
            generatedPaperData.sectionC.forEach(q => {
                const textLines = doc.splitTextToSize(`${q.q_num}. ${q.text} [${q.marks} Marks]`, 170);
                checkPageBreak(textLines.length * 7);
                doc.text(textLines, 20, currentY);
                currentY += (textLines.length * 7) + 8;
            });
        }
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("Generated securely via EduAI Zero-Repetition Engine", 105, 280, null, null, "center");
        
        // Trigger download
        doc.save(`EduAI_${currentSubject.replace(/\s+/g, '_')}_Paper.pdf`);
    } catch (e) {
        console.error("PDF Generation failed:", e);
        alert("Failed to generate PDF. Make sure you are connected to the internet to load the PDF library.");
    }
    
    // Do not close preview modal automatically so user can keep editing if desired
    // closePreviewModal(); 
}

function openPreviewDashboard() {
    closeGenerateModal();
    document.getElementById('previewModal').classList.add('active');
    renderPreview();
}

function closePreviewModal() {
    document.getElementById('previewModal').classList.remove('active');
}

function renderPreview() {
    const container = document.getElementById('previewContainer');
    container.innerHTML = '';

    if (!generatedPaperData) return;

    const renderSection = (title, dataArray, sectionKey, type) => {
        if (!dataArray || dataArray.length === 0) return;
        
        const sectionTitle = document.createElement('h4');
        sectionTitle.style.marginTop = '1rem';
        sectionTitle.style.marginBottom = '1rem';
        sectionTitle.style.color = 'var(--primary)';
        sectionTitle.textContent = title;
        container.appendChild(sectionTitle);

        dataArray.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'preview-question';
            qDiv.id = `q-${sectionKey}-${index}`;

            let optionsHtml = '';
            if (q.options) {
                optionsHtml = `<div class="preview-options">
                    ${q.options.map((opt, oIdx) => `<div class="preview-option" id="opt-${sectionKey}-${index}-${oIdx}">${opt}</div>`).join('')}
                </div>`;
            }

            qDiv.innerHTML = `
                <h5>
                    <span id="qtext-${sectionKey}-${index}" style="flex: 1; margin-right: 1rem;">${q.q_num}. ${q.text} [${q.marks} Marks]</span>
                    <div class="preview-question-actions">
                        <button onclick="editQuestion('${sectionKey}', ${index})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="replaceQuestion('${sectionKey}', ${index}, '${type}')" title="Regenerate/Replace"><i class="fa-solid fa-rotate"></i></button>
                    </div>
                </h5>
                ${optionsHtml}
            `;
            container.appendChild(qDiv);
        });
    };

    renderSection('Section A: Multiple Choice Questions', generatedPaperData.sectionA, 'sectionA', 'MCQ');
    renderSection('Section B: Short Answer Questions', generatedPaperData.sectionB, 'sectionB', 'Short Answer');
    renderSection('Section C: Long Answer Questions', generatedPaperData.sectionC, 'sectionC', 'Long Answer');
}

function editQuestion(sectionKey, index) {
    const q = generatedPaperData[sectionKey][index];
    const qtextSpan = document.getElementById(`qtext-${sectionKey}-${index}`);
    
    if (qtextSpan.querySelector('input')) return;

    const originalText = q.text;
    qtextSpan.innerHTML = `${q.q_num}. <input type="text" class="editable-input" value="${originalText.replace(/"/g, '&quot;')}" style="width:70%; display:inline-block; margin-left: 10px;" id="edit-text-${sectionKey}-${index}"> [${q.marks} Marks] <button class="btn btn-primary" style="padding: 0.2rem 0.8rem; font-size: 0.8rem;" onclick="saveEdit('${sectionKey}', ${index})">Save</button>`;

    if (q.options) {
        q.options.forEach((opt, oIdx) => {
            const optDiv = document.getElementById(`opt-${sectionKey}-${index}-${oIdx}`);
            optDiv.innerHTML = `<input type="text" class="editable-input" value="${opt.replace(/"/g, '&quot;')}" id="edit-opt-${sectionKey}-${index}-${oIdx}">`;
        });
    }
}

function saveEdit(sectionKey, index) {
    const q = generatedPaperData[sectionKey][index];
    const newText = document.getElementById(`edit-text-${sectionKey}-${index}`).value;
    q.text = newText;

    if (q.options) {
        q.options.forEach((opt, oIdx) => {
            q.options[oIdx] = document.getElementById(`edit-opt-${sectionKey}-${index}-${oIdx}`).value;
        });
    }

    renderPreview();
}

async function replaceQuestion(sectionKey, index, type) {
    const qDiv = document.getElementById(`q-${sectionKey}-${index}`);
    qDiv.style.opacity = '0.5';
    const originalQ = generatedPaperData[sectionKey][index];

    const formData = new FormData();
    formData.append('subject', currentSubject);
    formData.append('difficulty', currentDifficulty);
    formData.append('type', type);
    formData.append('q_num', originalQ.q_num);
    formData.append('marks', originalQ.marks);
    
    const syllabusInput = document.getElementById('syllabus');
    if (syllabusInput.files.length > 0) formData.append('syllabus', syllabusInput.files[0]);
    const pyqsInput = document.getElementById('pyqs');
    if (pyqsInput.files.length > 0) formData.append('pyqs', pyqsInput.files[0]);

    try {
        const response = await fetch('http://localhost:5000/replace', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.error) {
            alert("Backend Error: " + result.error);
            qDiv.style.opacity = '1';
            return;
        }

        generatedPaperData[sectionKey][index] = result.data;
        renderPreview();
    } catch (error) {
        console.error("Error replacing question:", error);
        alert("Failed to connect to the backend server.");
        qDiv.style.opacity = '1';
    }
}

function downloadAnswerKey() {
    if (!generatedPaperData) {
        alert("No paper data available.");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Green color
        doc.text("EduAI Answer Key", 105, 30, null, null, "center");
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`Subject: ${currentSubject}`, 20, 50);
        doc.text(`Exam Type: ${currentExamType}`, 20, 58);
        doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 66);
        
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 75, 190, 75);
        
        let currentY = 90;

        const checkPageBreak = (addedHeight) => {
            if (currentY + addedHeight > 280) {
                doc.addPage();
                currentY = 20;
            }
        };

        const renderAnswers = (title, dataArray) => {
            if (!dataArray || dataArray.length === 0) return;
            
            checkPageBreak(15);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(title, 20, currentY);
            currentY += 10;
            
            doc.setFont("helvetica", "normal");
            dataArray.forEach(q => {
                let ansText = `${q.q_num}. `;
                if (q.answer) ansText += `Correct Option: ${q.answer}\n`;
                if (q.explanation) ansText += `Explanation: ${q.explanation}\n`;
                if (q.detailed_answer) ansText += `Detailed Answer: ${q.detailed_answer}\n`;
                
                const textLines = doc.splitTextToSize(ansText, 170);
                checkPageBreak(textLines.length * 7);
                doc.text(textLines, 20, currentY);
                currentY += (textLines.length * 7) + 5;
            });
            currentY += 5;
        };

        renderAnswers("Section A Answers", generatedPaperData.sectionA);
        renderAnswers("Section B Answers", generatedPaperData.sectionB);
        renderAnswers("Section C Answers", generatedPaperData.sectionC);
        
        doc.save(`EduAI_${currentSubject.replace(/\s+/g, '_')}_AnswerKey.pdf`);
    } catch (e) {
        console.error("Answer Key Generation failed:", e);
        alert("Failed to generate PDF. Make sure you are connected to the internet to load the PDF library.");
    }
}

// Faculty Dashboard Modal Logic
function openFacultyDashboard() {
    console.log("Attempting to open Faculty Dashboard...");
    const modal = document.getElementById('facultyModal');
    if (modal) {
        modal.classList.add('active');
        console.log("Faculty Dashboard opened successfully.");
    } else {
        console.error("Error: facultyModal element not found!");
    }
}

function closeFacultyDashboard() {
    document.getElementById('facultyModal').classList.remove('active');
}
