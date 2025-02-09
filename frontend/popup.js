// Import PDF.js library
import * as pdfjsLib from './libs/pdf.mjs';

function scanForPII2(text) {
    const patterns = {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        phone: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        ssn: /\b(?!XXX-XX-XXXX)(?!xxx-xx-xxxx)(?!xxx-xx-\d{4})(\d{3}-\d{2}-\d{4})\b/g,
        tin: /\b(?!9XX-XX-XXXX)(?!9xx-xx-xxxx)(?!9xx-xx-\d{4} )(9\d{2}-\d{2}-\d{4})\b/g,
        driverLicense: /\b[A-Z]{1,3}\d{6,8}\b/g,
        DoB: /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b/g
    };
    
    let foundPII = [];
    
    // Loop through the patterns
    for (const [type, regex] of Object.entries(patterns)) {
        const matches = text.match(regex);
        if (matches) {
            foundPII.push(`${type}: ${matches.join(', ')}`);
        }
    }
    
    // Return the PII results
    return foundPII;
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

  // Scan for PII and then display the results
//   document.getElementById('output').textContent = textContent;
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

        // Scan for PII and dispay the results
        // document.getElementById('output').textContent = textContent;
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

    if (piiResults.length > 0) {
        document.body.classList.add('red-theme');
        outputDiv.innerHTML = `<strong>PII Detected:</strong><br>${piiResults.join('<br>')}`;
    } else {
        document.body.classList.remove('red-theme'); // Remove red theme if no PIIs found
        outputDiv.textContent = "No PIIs found.";
    }
    
    // Reset the button to allow new file upload
    uploadButton.textContent = "Upload New File";
}

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
