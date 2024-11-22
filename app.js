import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app=express();
const port=5000 || process.env.PORT ;
app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());

//GET Request
app.get('/', (req,res)=>{
    res.send("Backend responding");
});

app.get('/bfhl', (req,res)=>{
    res.status(200).json({operation: 1});
});

//POST Request
app.post('/bfhl', (req, res) => {
    const { data, full_name, dob, email, roll_number, file_b64 } = req.body;

    // Validate required fields
    if (!full_name || !dob) {
        return res.status(400).json({
            is_success: false,
            message: "Missing full_name or dob"
        });
    }

    // Create user_id
    const formattedName = full_name.toLowerCase().replace(/ /g, '_'); // Replace spaces with underscores
    const formattedDOB = dob.replace(/-/g, ''); // Remove dashes or format appropriately (e.g., "ddmmyyyy")
    const user_id = `${formattedName}_${formattedDOB}`;

    // Process Data 
    const numbers = data.filter(item => /^\d+$/.test(item)); // only numbers
    const alphabets = data.filter(item => /^[a-zA-Z]$/.test(item)); // only alphabets

    // Find the highest lowercase alphabet
    const lowercaseAlphabets = alphabets.filter(char => /^[a-z]$/.test(char));
    const highestLowercase = lowercaseAlphabets.length > 0
        ? [lowercaseAlphabets.sort().pop()]
        : [];

    // Check for prime numbers
    const isPrimeFound = numbers.some(num => isPrime(parseInt(num, 10)));

    // Handle File (Validate Base64 String)
    const fileDetails = handleFile(file_b64);

    // Create Response
    const response = {
        is_success: true,
        user_id,
        email,
        roll_number,
        numbers,
        alphabets,
        highest_lowercase_alphabet: highestLowercase,
        is_prime_found: isPrimeFound,
        file_valid: fileDetails.valid,
        file_mime_type: fileDetails.mimeType,
        file_size_kb: fileDetails.sizeKB
    };

    res.status(200).json(response);
});

// Utility to check for prime numbers
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

// Utility to validate and process Base64 file
function handleFile(base64) {
    if (!base64) {
        return { valid: false, mimeType: null, sizeKB: null };
    }
    try {
        const buffer = Buffer.from(base64, 'base64');
        const mimeType = "application/octet-stream"; 
        const sizeKB = buffer.length / 1024; // File size in KB
        return { valid: true, mimeType, sizeKB: sizeKB.toFixed(2) };
    } catch (err) {
        return { valid: false, mimeType: null, sizeKB: null };
    }
}
app.listen(port);


