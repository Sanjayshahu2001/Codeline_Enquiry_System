// --- CONFIGURATION ---
const COURSE_PDF_IDS = {
  "Java": "1reW7KCAlN6i37Zlb9X2G0DSpmp3uUlPB",
  "Python": "116T03zb7CB7VUSS4J006r_zXXZVtNlap",
  "FullStack": "" 
};

// LOCATION DETAILS
const INSTITUTE_ADDRESS = "Sangam Talkies Road, Plot No.452, Sakkardara Rd, Anand Nagar, Nandanvan, Nagpur, Maharashtra 440024";
const GOOGLE_MAP_LINK = "https://maps.app.goo.gl/iQvaTW3rFWNKYbZ7A";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    
    // --- NEW DATA FIELDS ---
    const name = data.name;
    const mobile = data.mobile;       // Primary Call Number
    const whatsapp = data.whatsapp;   // WhatsApp Number
    const email = data.email;
    const city = data.city;
    const qualification = data.qualification;
    const stream = data.stream;
    const passingYear = data.passingYear;
    const course = data.course;
    
    // 1. Link Generate
    const fileId = COURSE_PDF_IDS[course];
    let fileUrl = fileId ? "https://drive.google.com/uc?export=download&id=" + fileId : "Link Not Available";

    // 2. Send Email to Admin/Institute (With Full Details)
    let emailStatus = "FAILED";
    try {
      if(fileId) {
        const file = DriveApp.getFileById(fileId);
        MailApp.sendEmail({
          to: email, // Student ko email
          subject: `Codeline Course Details: ${course}`,
          body: `Hi ${name},\n\nHere is the PDF for the ${course} course.\n\n📍 Visit Us:\n${INSTITUTE_ADDRESS}\n${GOOGLE_MAP_LINK}\n\nRegards,\nTeam Codeline`,
          attachments: [file.getBlob()]
        });
        emailStatus = "SENT";
      }
    } catch (err) {
      emailStatus = "ERROR: " + err.message;
    }

    // 3. Sheet Update (Saari details save hongi)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inquiries");
    // Row Format: Date, Name, Mobile, WhatsApp, Email, City, Qual, Stream, Year, Course, Status
    sheet.appendRow([
      new Date(), name, mobile, whatsapp, email, city, qualification, stream, passingYear, course, "Redirect", emailStatus
    ]);

    // 4. Return Response
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      pdfUrl: fileUrl,      
      courseName: course,
      address: INSTITUTE_ADDRESS,
      mapLink: GOOGLE_MAP_LINK
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: e.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    lock.releaseLock();
  }
}