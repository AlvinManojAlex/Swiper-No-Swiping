chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'pdf-uploaded') {
        const file = message.file;

        // Log the received PDF file details
        console.log("Received PDF file details:", file);

        // If you need the base64 content to do further processing, you can use the file.content
        const fileContent = file.content;
        console.log("Received base64 PDF content:", fileContent);
    }
});
