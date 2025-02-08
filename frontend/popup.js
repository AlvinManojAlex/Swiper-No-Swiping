// Import PDF.js library
import * as pdfjsLib from './libs/pdf.mjs';

// Set the worker src (pdf.worker.mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = './libs/pdf.worker.mjs';

// Function to load and extract text from the PDF file
async function extractTextFromPDF(file) {
  // Check if file is provided
  if (!file) {
    console.error("No file provided");
    return;
  }

  const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file)); // Create a Blob URL
  const pdf = await loadingTask.promise;

  let textContent = '';  // Initialize an empty string to hold the extracted text

  // Loop through each page and extract text
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Extract text from the content of the page
    const pageText = content.items.map(item => item.str).join(' ');
    textContent += pageText + '\n\n';  // Add the extracted text for this page
  }

  // Display the extracted text in the output div
  document.getElementById('output').textContent = textContent || "No text found.";
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
        document.getElementById('output').textContent = textContent || "No text found.";
    };

    reader.onerror = function(e) {
        console.error("Error reading file")
        document.getElementById('output').textContent = "Error reading file";
    };

    reader.readAsText(file);
}

// Event listener for the Parse File button
document.getElementById('parse-button').addEventListener('click', function () {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];

  if (file) {
    // Display file name and start PDF processing
    document.getElementById('output').textContent = `Selected file: ${file.name}`;

    // Clear any previous output (text or canvas)
    document.getElementById('output').innerHTML = '';

    // Extracting the file extension
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'pdf') {
        // Call the function to extract text from the PDF
        extractTextFromPDF(file);
    } else if (fileExtension === 'txt') {
        extractTextFromTXT(file);
    } else {
        document.getElementById('output').textContent = "Unsupported file type.";
    }
  } else {
    document.getElementById('output').textContent = "No file selected.";
  }
});
