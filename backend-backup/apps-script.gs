// --- CONFIGURATION ---
const COURSE_PDF_IDS = {
  "Java": "1reW7KCAlN6i37Zlb9X2G0DSpmp3uUlPB",
  "Python": "116T03zb7CB7VUSS4J006r_zXXZVtNlap",
  "FullStack": "" 
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    
    const name = data.name;
    const phone = data.phone;
    const email = data.email;
    const course = data.course; // Ye 'undefined' aa raha tha, ab fix hoga
    
    // 1. Link Generate Karna
    const fileId = COURSE_PDF_IDS[course];
    let fileUrl = "";
    if (fileId) {
      fileUrl = "https://drive.google.com/uc?export=download&id=" + fileId; 
    } else {
      fileUrl = "Link Not Available";
    }

    // 2. Email Bhejna
    let emailStatus = "FAILED";
    try {
      if(fileId) {
        const file = DriveApp.getFileById(fileId);
        MailApp.sendEmail({
          to: email,
          subject: `Codeline Course Details: ${course}`,
          body: `Hi ${name},\n\nHere is your PDF.\n\nRegards,\nTeam Codeline`,
          attachments: [file.getBlob()]
        });
        emailStatus = "SENT";
      }
    } catch (err) {
      emailStatus = "ERROR: " + err.message;
    }

    // 3. Sheet Update
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inquiries");
    sheet.appendRow([new Date(), name, phone, email, course, "Redirect", emailStatus, "YES"]);

    // 4. RETURN RESPONSE (Ye sabse zaruri line hai)
    // Hum frontend ko 'pdfUrl' aur 'courseName' wapis bhej rahe hain
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      pdfUrl: fileUrl,      // ✅ Ye bhejna zaruri hai
      courseName: course    // ✅ Ye bhejna zaruri hai
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