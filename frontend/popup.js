// Import PDF.js library
import * as pdfjsLib from './libs/pdf.mjs';

function scanForPII2(text) {
    const patterns = {
        email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
        phone: /\b\d{10}\b|\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g,
        ssn: /\b(?!XXX-XX-XXXX)(\d{3}-\d{2}-\d{4})\b/g,
        tin: /\b(?!9XX-XX-XXXX)(9\d{2}-\d{2}-\d{4})\b/g,
        driverLicense: /\b[A-Z]{1,3}\d{6,8}\b/g,
        DoB: /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b/g
    };
    
    let foundPII = [];
    let matches = {};  // Store matches for redaction
    
    // Loop through the patterns
    for (const [type, regex] of Object.entries(patterns)) {
        const typeMatches = text.match(regex);
        if (typeMatches) {
            foundPII.push(`${type}: ${typeMatches.join(', ')}`);
            matches[type] = typeMatches;  // Store matches by type
        }
    }
    
    // Return both the PII results and matches
    return { foundPII, matches };
}

// Set the worker src (pdf.worker.mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = './libs/pdf.worker.mjs';

// Function to load and extract text from the PDF file
async function extractTextFromPDF(file) {
  // Check if file is provided
  if (!file) {
    console.error("No file provided");
    return;
  }

  // Create a blob URL
  const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
  const pdf = await loadingTask.promise;

  let textContent = '';

  // Loop through each page and extract text
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Extract text from the content of the page
    const pageText = content.items.map(item => item.str).join(' ');
    textContent += pageText + '\n\n';  // Add the extracted text for this page
  }

  // Store the content and filename
  currentFileContent = textContent;
  currentFileName = file.name;

  // Scan for PII and then display the results
  const piiResults = scanForPII2(textContent);
  displayPiiResults(piiResults);
}

// Function to load and extract text from the TXT file
async function extractTextFromTXT(file) {
    // Check if file provided
    if (!file) {
        console.error("No file provided");
        return
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const textContent = e.target.result;
        
        // Store the content and filename
        currentFileContent = textContent;
        currentFileName = file.name;

        // Scan for PII and display the results
        const piiResults = scanForPII2(textContent);
        displayPiiResults(piiResults);
    };

    reader.onerror = function(e) {
        console.error("Error reading file")
        document.getElementById('output').textContent = "Error reading file";
    };

    reader.readAsText(file);
}

// Function to display the PII results on the extension frontend
function displayPiiResults(piiResults) {
    const outputDiv = document.getElementById('output');
    const uploadButton = document.getElementById('upload-button');
    const redactButton = document.getElementById('redact-button');

    if (piiResults.foundPII.length > 0) {
        document.body.classList.add('red-theme');
        outputDiv.innerHTML = `
            <strong>PII Detected:</strong><br>
            ${piiResults.foundPII.join('<br>')}
        `;
        // Show the redact button that's already in the HTML
        redactButton.style.display = 'block';
    } else {
        document.body.classList.remove('red-theme');
        outputDiv.textContent = "No PIIs found.";
        // Hide the redact button
        redactButton.style.display = 'none';
    }
    
    uploadButton.textContent = "Upload New File";
}

// Function to redact PII from text
function redactPII(text, matches) {
    let redactedText = text;
    // Go through each type of PII
    for (const [type, typeMatches] of Object.entries(matches)) {
        typeMatches.forEach(match => {
            // Replace each match with X's of the same length
            redactedText = redactedText.replace(match, 'X'.repeat(match.length));
        });
    }
    return redactedText;
}

// Function to download text as file
function downloadTextFile(text, originalFileName) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const baseName = originalFileName.split('.')[0];  // Just get the name without extension
    a.href = url;
    a.download = `${baseName}_redacted.txt`;  // Always use .txt extension
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add these variables at the top level to store the current file's content
let currentFileContent = '';
let currentFileName = '';

// Remove the separate parse button event listener and combine functionality
document.getElementById('upload-button').addEventListener('click', function() {
    const fileInput = document.getElementById('file-input');
    
    // Always clear the file input when clicking the button
    fileInput.value = '';
    // Always trigger file selection
    fileInput.click();
});

document.getElementById('file-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('upload-button').textContent = file.name;
        document.getElementById('output').textContent = `Processing: ${file.name}`;
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension === 'pdf') {
            extractTextFromPDF(file);
        } else if (fileExtension === 'txt') {
            extractTextFromTXT(file);
        } else {
            document.getElementById('output').textContent = "Unsupported file type.";
            document.getElementById('upload-button').textContent = "Upload New File";
        }
    }
});

// Update the event listener to target the button by ID instead of delegation
document.getElementById('redact-button').addEventListener('click', function() {
    const piiResults = scanForPII2(currentFileContent);
    const redactedText = redactPII(currentFileContent, piiResults.matches);
    downloadTextFile(redactedText, currentFileName);
});
