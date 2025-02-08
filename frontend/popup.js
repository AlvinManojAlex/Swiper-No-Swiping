document.getElementById('parse-button').addEventListener('click', function () {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
  
    if (file) {
      // Just displaying the file name for now
      document.getElementById('output').textContent = `Selected file: ${file.name}`;
      
      // Future parsing logic will go here
    } else {
      document.getElementById('output').textContent = "No file selected.";
    }
  });