const activateOnFileAttach = () => {
    // Create a hidden input[type="file"] element
    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.style.display = 'none';  // Hide the file input

    // Set up the event listener for when a file is selected
    hiddenFileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            console.log("Files attached:", files);

            const file = files[0];
            
            // Storing the file in local storage as a Blob URL
            const fielURL = URL.createObjectURL(file);
            localStorage.setItem('fileBlobURL', fileURL);
            console.log("Blob URL stored in local storage", fileURL);
        }
    });

    // Flag to track if the file input dialog has been opened
    let isFileInputOpen = false;

    // Observe the body for changes to dynamically attach event listeners
    const observer = new MutationObserver(() => {
        const customFileTrigger = document.querySelector('#\\:1pq.a1.aaA.aMZ');  // Gmail's custom file trigger div

        if (customFileTrigger) {
            // Attach the event listener for triggering file input
            customFileTrigger.addEventListener('click', (e) => {
                e.preventDefault();  // Prevent any default behavior if needed

                // If the website has already opened the file dialog, don't trigger it again
                if (!isFileInputOpen) {
                    // Set the flag indicating the file input dialog is open
                    isFileInputOpen = true;

                    // Trigger the hidden file input dialog (extension's dialog)
                    hiddenFileInput.click();
                }
            });
        }
    });

    // Start observing the document body for changes (if elements are added dynamically)
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for the file input change in case the website opened the file dialog directly
    document.addEventListener('change', (event) => {
        if (event.target && event.target.type === 'file') {
            // Mark that the file input dialog has been opened by the website
            isFileInputOpen = true;

            // You can process the selected file here if needed
            const files = event.target.files;
            if (files.length > 0) {
                console.log("Website opened file dialog and selected files:", files);
                
                // Storing the file in local storage as a Blob URL
                const fileURL = URL.createObjectURL(files[0]);
                localStorage.setItem('fileBlobURL', fileURL);
                console.log("Blob URL stored in local storage", fileURL);
            }
        }
    });
};

// Run the function when the script loads
activateOnFileAttach();
