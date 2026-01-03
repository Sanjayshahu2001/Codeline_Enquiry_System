// 🔴 YOUR EXISTING BACKEND URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxGl9PumcuVdnN3lIPMS8JxYgAW69TdChvA9_NkELLxOxg-kAFpGux5w1O-yQf7tGp8/exec";

const form = document.getElementById('inquiryForm');
const btn = document.getElementById('submitBtn');
const msgBox = document.getElementById('statusMsg');

form.addEventListener('submit', e => {
    e.preventDefault();
    
    // Button Loading State
    btn.disabled = true;
    btn.innerHTML = '<span>Processing...</span> <i class="fas fa-spinner fa-spin"></i>';
    msgBox.style.display = 'none';

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Reset Button
        btn.disabled = false;
        btn.innerHTML = '<span>Get Course PDF</span> <i class="fas fa-paper-plane"></i>';
        
        if(result.status === "success") {
            // Show Success Message
            msgBox.innerHTML = "✅ Success! Opening WhatsApp...";
            msgBox.className = "message success";
            msgBox.style.display = "block";

            // Whatsapp Logic
            const userWhatsapp = "91" + data.whatsapp; 
            const pdfLink = result.pdfUrl;
            const courseName = result.courseName;
            const address = result.address;
            const mapLink = result.mapLink;
            const userName = data.name;

            const messageText = `Dear ${userName},

Thank you for visiting *Codeline.AI*.

Here are the details for the *${courseName}* program.

📄 *Download Brochure:* ${pdfLink}

📍 *Visit Institute:*
${address}
Google Map: ${mapLink}

Regards, Team Codeline.AI`;

            const encodedText = encodeURIComponent(messageText);
            const waUrl = `https://wa.me/${userWhatsapp}?text=${encodedText}`;
            
            // Open WhatsApp & Reset Form
            window.open(waUrl, '_blank');
            form.reset();
        } else {
            throw new Error(result.message);
        }
    })
    .catch(error => {
        btn.disabled = false;
        btn.innerHTML = '<span>Get Course PDF</span> <i class="fas fa-paper-plane"></i>';
        msgBox.innerHTML = "❌ Error: " + error.message;
        msgBox.className = "message error";
        msgBox.style.display = "block";
    });
});