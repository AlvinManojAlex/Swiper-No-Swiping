function scanForPII2(text) {
    const patterns = {
        email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        phone: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
        dob: /\b(?:\d{2}[-/])?\d{2}[-/]\d{4}\b/g,
        driverLicense: /\b[A-Z]{1,3}\d{6,8}\b/g
    };
    
    let foundPII = [];
    
    // Loop through the patterns
    for (const [type, regex] of Object.entries(patterns)) {
        const matches = text.match(regex);
        if (matches) {
            foundPII.push(`${type}: ${matches.join(', ')}`);
        }
    }
    
    // Show the results
    if (foundPII.length > 0) {
        alert(`PII Detected:\n${foundPII.join('\n')}`);
    } else {
        alert("No PII found.");
    }
}
