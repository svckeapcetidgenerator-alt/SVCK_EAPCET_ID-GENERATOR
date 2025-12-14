// Global variables
const ADMIN_PIN = "9059";
let adminLoggedIn = false;
let camTrack = null;
let editIndex = -1;
let isEditMode = false;

// --- INITIALIZATION ---
function init() {
    // 1. Load persistent images (Logo and Signature)
    const logoData = localStorage.getItem("collegeLogo");
    if (logoData) {
        document.getElementById("collegeLogo").src = logoData;
        document.getElementById("previewAdminLogo").src = logoData;
    } else {
        // Fallback for logo if none is set
        document.getElementById("collegeLogo").src = "https://placehold.co/84x84/003366/ffffff?text=SVCE";
        document.getElementById("previewAdminLogo").src = "https://placehold.co/150x150/003366/ffffff?text=SVCE";
    }

    const signData = localStorage.getItem("principalSign");
    if (signData) {
        document.getElementById("principalSign").src = signData;
        document.getElementById("previewAdminSign").src = signData;
    }
}
window.onload = init; // Execute initialization on load

// ---------- ADMIN NAVIGATIONS & ACTIONS ----------
function openAdminLogin(){ document.getElementById("adminLoginBox").style.display="flex"; document.getElementById("mainMenu").style.display="none"; }
function verifyAdmin(){
    const pin = document.getElementById("adminPin").value.trim();
    if(pin===ADMIN_PIN){ adminLoggedIn=true; document.getElementById("adminLoginBox").style.display="none"; document.getElementById("adminPanel").style.display="flex"; openTab("tabLogo"); console.log("Admin verified ✔"); }
    else console.error("Incorrect PIN ❌");
}
function logoutAdmin(){ adminLoggedIn=false; document.getElementById("adminPanel").style.display="none"; document.getElementById("adminLoginBox").style.display="none"; document.getElementById("studentPage").style.display="none"; document.getElementById("mainMenu").style.display="block"; console.log("Logged out successfully!"); }


// Show main menu
function goHome() {
    document.getElementById("mainMenu").style.display = "block";
    document.getElementById("adminLoginBox").style.display = "none";
    document.getElementById("adminPanel").style.display = "none";

    // Clear PIN input
    document.getElementById("adminPin").value = "";
}

function verifyAdmin(){
    const pin = document.getElementById("adminPin").value;

    if(pin === ADMIN_PIN){
        adminLoggedIn = true;
        // Replaced alert with custom logging since alert is forbidden
        console.log("Admin Verified ✔");

        document.getElementById("adminLoginBox").style.display = "none";
        document.getElementById("adminPanel").style.display = "flex";
        openTab("tabLogo"); // Open default tab
    } else {
        console.error("Incorrect PIN ❌");
        // Custom message box could be used here instead of console.error
    }
}


// Admin logout function
function logoutAdmin() {
    alert("Admin logged out successfully!");
    
    // Hide admin panel
    document.getElementById("adminPanel").style.display = "none";
    
    // Show main menu
    document.getElementById("mainMenu").style.display = "block";
    
    // Clear any sensitive data (optional)
    document.getElementById("adminPin").value = "";

    // Reset admin tabs
    const tabs = document.getElementsByClassName("admin-tab");
    for (let tab of tabs) {
        tab.style.display = "none";
    }
}

// ---------- STUDENT PAGE NAVIGATION ----------
function openStudentPage() {
    document.getElementById("studentPage").style.display = "block";
    document.getElementById("mainMenu").style.display = "none";
    // Ensure save eligibility is checked on entry if data is somehow pre-filled
    checkSaveEligibility();
}

function goBack() {
    document.getElementById("studentPage").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    clearStudentForm(); // Clear the form when going back
    checkSaveEligibility(); // Re-check eligibility after clearing form
}

// ---------- TABS ----------
function openTab(tabId) {
    if (!adminLoggedIn) return; // Guard for admin access

    const tabs = document.getElementsByClassName("admin-tab");
    for (let i = 0; i < tabs.length; i++) tabs[i].style.display = "none";
    document.getElementById(tabId).style.display = "block";

    if (tabId === 'tabStudents') {
        renderStudentTable(); // RENDER TABLE when student tab is opened
    }
}

/* -------- LOGO -------- */
function saveLogo(){
    if(!adminLoggedIn) return console.error("Admin only");
    let file=document.getElementById("adminLogoUpload").files[0];
    if(!file) return console.error("Choose an image");
    let r=new FileReader();
    r.onload=e=>{
        localStorage.setItem("collegeLogo",e.target.result);
        document.getElementById("collegeLogo").src=e.target.result;
        document.getElementById("previewAdminLogo").src=e.target.result;
        console.log("Logo Saved ✔");
    };
    r.readAsDataURL(file);
}

/* -------- SIGNATURE -------- */
function savePrincipalSign(){
    if(!adminLoggedIn) return console.error("Admin only");
    let f=document.getElementById("adminSignUpload").files[0];
    if(!f) return console.error("Select signature");
    let r=new FileReader();
    r.onload=e=>{
        localStorage.setItem("principalSign",e.target.result);
        document.getElementById("principalSign").src=e.target.result;
        document.getElementById("previewAdminSign").src=e.target.result;
        console.log("Signature Saved ✔");
    };
    r.readAsDataURL(f);
}

function deletePrincipalSign(){
    if(!adminLoggedIn) return console.error("Admin only");
    localStorage.removeItem("principalSign");
    document.getElementById("principalSign").src="";
    document.getElementById("previewAdminSign").src="";
    console.log("Deleted ✔");
}

/* -------- STUDENT LIST MANAGEMENT -------- */
// Render student table
function renderStudentTable(){
    let students = JSON.parse(localStorage.getItem("students") || "[]");
    let search = document.getElementById("searchStudent").value.toLowerCase();
    let tbody = document.getElementById("studentTableBody");
    tbody.innerHTML = "";

    students.forEach((s, i) => {
        const fullName = (s.first + " " + s.last).toLowerCase();
        if(fullName.includes(search) || s.regno.toLowerCase().includes(search)){
            tbody.innerHTML += `
            <tr>
                <td>${s.first} ${s.last}</td>
                <td>${s.regno}</td>
                <td>${s.email}</td>
                <td>${s.mobile}</td>
                <td>${s.village}</td>
                <td>${s.address}</td>
                <td>
                    <button class="btn-small" style="width: 60px; margin: 2px;" onclick="openEditModal(${i})">✏️</button>
                    <button class="btn-small" style="width: 60px; margin: 2px; background: #cc0000;" onclick="deleteStudent(${i})">🗑️</button>
                </td>
            </tr>`;
        }
    });
}

// Open edit modal
function openEditModal(i){
    if(!adminLoggedIn) return console.error("Admin only");
    let students = JSON.parse(localStorage.getItem("students") || "[]");
    let s = students[i];
    editIndex = i;

    document.getElementById("editFirstName").value = s.first;
    document.getElementById("editLastName").value = s.last;
    document.getElementById("editEmail").value = s.email;
    document.getElementById("editMobile").value = s.mobile;
    document.getElementById("editAddress").value = s.address;
    document.getElementById("editVillage").value = s.village;
    document.getElementById("editRegNo").value = s.regno;

    document.getElementById("adminEditModal").style.display = "block";
}

// Close modal
function closeEditModal(){
    document.getElementById("adminEditModal").style.display = "none";
    editIndex = -1;
}

// Save edited student
function saveEditedStudent(){
    let students = JSON.parse(localStorage.getItem("students") || "[]");
    if(editIndex === -1) return;

    let f = document.getElementById("editFirstName").value.trim();
    let l = document.getElementById("editLastName").value.trim();
    let e = document.getElementById("editEmail").value.trim();
    let m = document.getElementById("editMobile").value.trim();
    let a = document.getElementById("editAddress").value.trim();
    let v = document.getElementById("editVillage").value.trim();

    if(!f || !l || !e || !m || !a || !v) return console.error("All fields are required!");
    if(!e.endsWith("@gmail.com") || !/^\d{10}$/.test(m)) return console.error("Email or Mobile format is invalid!");


    // Update student
    students[editIndex] = {
        ...students[editIndex],
        first: f,
        last: l,
        email: e,
        mobile: m,
        address: a,
        village: v
    };

    localStorage.setItem("students", JSON.stringify(students));
    console.log("Student details updated ✔");

    closeEditModal();
    renderStudentTable();
}

// Delete student
function deleteStudent(i){
    if(!confirm("Delete student?")) return; // Use custom modal in real app, but using confirm() as existing code uses it.
    let students = JSON.parse(localStorage.getItem("students") || "[]");
    students.splice(i,1);
    localStorage.setItem("students", JSON.stringify(students));
    renderStudentTable();
}

/* -------- RESET REGISTRATION -------- */
function resetRegSeries(){
    if(!adminLoggedIn) return console.error("Admin only");
    if(!confirm("Are you sure you want to reset all registration numbers?")) return; // Use custom modal
    localStorage.removeItem("regByYear");
    console.log("Registration series reset ✔");
}


/* -------- REG NUMBER LOGIC -------- */
function generateRegNo(year){
    let db=JSON.parse(localStorage.getItem("regByYear")||"{}");
    let next=( (db[year]||0)+1 ).toString().padStart(3,"0");
    db[year]=parseInt(next);
    localStorage.setItem("regByYear",JSON.stringify(db));
    return "SV"+year+next;
}

function previewReg(){
    let date=document.getElementById("regDate").value;
    if(!date) return;
    let year=new Date(date).getFullYear();
    let db=JSON.parse(localStorage.getItem("regByYear")||"{}");
    // Calculate the *next* number for preview
    let next=( (db[year]||0)+1 ).toString().padStart(3,"0"); 
    let r="SV"+year+next;

    document.getElementById("regno").value=r;
    document.getElementById("outRegNo").innerText=r;
    updateQR(r);
    checkSaveEligibility(); // Call eligibility check here as regDate is key
}

/* -------- QR CODE -------- */
function updateQR(reg){
    let q=document.getElementById("qrcode");
    q.innerHTML="";
    // Only generate QR if reg is valid
    if (reg && reg !== '-----') {
        new QRCode(q,{ text:"ID:"+reg, width:55, height:55, colorDark : "#003366" });
    }
}

/* -------- SAVE STUDENT (NEW OR EDIT) -------- */
function saveStudent(){


    let f = document.getElementById("firstName").value.trim();
    let l = document.getElementById("lastName").value.trim();
    let e = document.getElementById("email").value.trim();
    let m = document.getElementById("mobile").value.trim();
    let a = document.getElementById("address").value.trim();
    let v = document.getElementById("village").value.trim();
    let p = document.getElementById("studentPhoto").src;
    let d = document.getElementById("regDate").value;

    if(!f || !l || !e || !m || !a || !v || !p){
        return alert("Fill all fields!");
    }

    let students = JSON.parse(localStorage.getItem("students") || "[]");

    // 🟢 EDIT MODE
    if(isEditMode){
        students[editIndex] = {
            ...students[editIndex],
            first: f,
            last: l,
            email: e,
            mobile: m,
            address: a,
            village: v,
            photo: p
        };

        localStorage.setItem("students", JSON.stringify(students));

        alert("Student Updated ✔");
        clearStudentForm();


        isEditMode = false;
        editIndex = -1;
    }
    // 🔵 NEW STUDENT
    else{
        if(!d) return alert("Select registration date!");

        let duplicate = students.some(s => s.email === e || s.mobile === m);
        if(duplicate) return alert("⚠️Email or Mobile already exists!");

        let year = new Date(d).getFullYear();
        let reg = generateRegNo(year);

        students.push({
            first:f,
            last:l,
            email:e,
            mobile:m,
            address:a,
            village:v,
            regno:reg,
            photo:p
        });

        localStorage.setItem("students", JSON.stringify(students));

        document.getElementById("regno").value = reg;
        document.getElementById("outRegNo").innerText = reg;
        updateQR(reg);

        alert("Student Saved ✔");
    }

    renderStudentTable();

    document.getElementById("btnDownloadPNG").disabled = false;
    document.getElementById("btnDownloadPDF").disabled = false;
}

/* -------- PHOTO LOADING -------- */
function loadStudentPhoto(ev){
    let file = ev.target.files[0];
    if (!file) return;

    let r=new FileReader();
    r.onload=e=>{
        document.getElementById("studentPhoto").src=e.target.result;
        document.getElementById("studentPhoto").style.display="block";
        checkSaveEligibility(); // Call eligibility check after photo loads
    };
    r.readAsDataURL(file);
}

/* -------- CAMERA -------- */
function openCamera(){
    document.getElementById("cameraPopup").style.display="block";
    navigator.mediaDevices.getUserMedia({video:true}).then(stream=>{
        document.getElementById("cameraStream").srcObject=stream;
        camTrack=stream.getTracks()[0];
    }).catch(err => {
        console.error("Could not access camera: ", err);
    });
}

function capturePhoto(){
    let v=document.getElementById("cameraStream");
    let c=document.getElementById("cameraCanvas");
    c.getContext("2d").drawImage(v,0,0,c.width,c.height);

    let img=c.toDataURL("image/png");
    document.getElementById("studentPhoto").src=img;
    document.getElementById("studentPhoto").style.display="block";

    checkSaveEligibility(); // Call eligibility check after photo capture
    closeCamera();
}

function closeCamera(){
    document.getElementById("cameraPopup").style.display="none";
    if(camTrack) camTrack.stop();
}

function clearStudentForm(){
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("address").value = "";
    document.getElementById("village").value = "";
    document.getElementById("regDate").value = "";
    document.getElementById("regno").value = "";
    document.getElementById("uploadPhoto").value = ""; // Clear file input

    // Clear photo
    document.getElementById("studentPhoto").src = "data:image/png;base64,";
    document.getElementById("studentPhoto").style.display = "none";

    // Clear preview
    document.getElementById("outName").innerText = "-----";
    document.getElementById("outRegNo").innerText = "-----";
    document.getElementById("outEmail").innerText = "-----";
    document.getElementById("outMobile").innerText = "-----";
    document.getElementById("outAddress").innerText = "-----";
    document.getElementById("outVillage").innerText = "-----";
    document.getElementById("qrcode").innerHTML = "";

    // Disable downloads and save button
    document.getElementById("btnDownloadPNG").disabled = true;
    document.getElementById("btnDownloadPDF").disabled = true;
    document.getElementById("saveBtn").disabled = true;
}

function addAnotherStudent(){
    // Use custom modal in real app, but using confirm() as existing code uses it.
    if(!confirm("Clear form and add another student?")) return;

    // Clear form & preview
    clearStudentForm();

    // Reset edit mode (safety)
    isEditMode = false;
    editIndex = -1;

    // Focus first input
    document.getElementById("firstName").focus();
}


/* -------- PREVIEW UPDATE -------- */
function updatePreview() {
    let first = document.getElementById("firstName").value.trim();
    let last = document.getElementById("lastName").value.trim();

    function cap(x) {
        return x ? x.charAt(0).toUpperCase() + x.slice(1).toLowerCase() : "";
    }

    document.getElementById("outName").innerText =
        (cap(first) + " " + cap(last)).trim() || "-----";

    document.getElementById("outEmail").innerText =
        document.getElementById("email").value || "-----";

    document.getElementById("outMobile").innerText =
        document.getElementById("mobile").value || "-----";

    document.getElementById("outAddress").innerText =
        document.getElementById("address").value || "-----";

    document.getElementById("outVillage").innerText =
        document.getElementById("village").value || "-----";
}
/* ---------- DUPLICATE CHECK ---------- */
function checkDuplicateWarnings(email,mobile){
    const students=JSON.parse(localStorage.getItem("students")||"[]");
    const emailWarn=students.some(s=>s.email===email);
    const mobileWarn=students.some(s=>s.mobile===mobile);
    document.getElementById("emailWarning").innerText=emailWarn?"⚠️ Email already exists!":"";
    document.getElementById("mobileWarning").innerText=mobileWarn?"⚠️ Mobile number already exists!":"";
    return emailWarn||mobileWarn;
}
/* -------- SAVE BUTTON ELIGIBILITY CHECK (THE FIX) -------- */
function checkSaveEligibility(){
    let f = document.getElementById("firstName").value.trim();
    let l = document.getElementById("lastName").value.trim();
    let e = document.getElementById("email").value.trim();
    let m = document.getElementById("mobile").value.trim();
    let a = document.getElementById("address").value.trim();
    let v = document.getElementById("village").value.trim();
    let d = document.getElementById("regDate").value;
    let p = document.getElementById("studentPhoto").src;

    // Validation checks
    let emailValid = e.endsWith("@gmail.com");
    let mobileValid = /^\d{10}$/.test(m);
    // Check if photo src is not the placeholder base64 data:image/png;base64, (which is what clearStudentForm uses)
    let photoLoaded = p && p !== "data:image/png;base64,"; 

    let saveBtn = document.getElementById("saveBtn");

    const isEligible = (
        f && l && a && v && d &&
        emailValid &&
        mobileValid &&
        photoLoaded 
    );

    if(isEligible){
        saveBtn.disabled = false;
        saveBtn.style.opacity = "1";
        saveBtn.style.cursor = "pointer";
    } else {
        saveBtn.disabled = true;
        saveBtn.style.opacity = "0.6";
        saveBtn.style.cursor = "not-allowed";
    }
}

// ---------- VALIDATIONS (Only for visual feedback) ----------
function validateEmail(){
    let email=document.getElementById("email").value.trim();
    document.getElementById("email").style.border=email && !email.endsWith("@gmail.com")?"2px solid red":"1px solid #ccc";
    if (email.endsWith("@gmail.com")) document.getElementById("email").style.border = "2px solid #28a745";
}
function validateMobile(){
    let mob=document.getElementById("mobile").value.trim();
    document.getElementById("mobile").style.border=mob && !/^\d{10}$/.test(mob)?"2px solid red":"1px solid #ccc";
    if (/^\d{10}$/.test(mob)) document.getElementById("mobile").style.border = "2px solid #28a745";
}
// ---------- EXPORT TO EXCEL ----------
function exportToExcel() {
    let students = JSON.parse(localStorage.getItem("students") || "[]");

    if (students.length === 0) {
        console.error("No students to export ❌");
        return;
    }

    // Prepare Excel data
    let ws_data = [
        ["First Name", "Last Name", "Reg No", "Email", "Mobile", "Address", "Village"]
    ];

    students.forEach(s => {
        ws_data.push([
            s.first,
            s.last,
            s.regno,
            s.email,
            s.mobile,
            s.address,
            s.village
        ]);
    });

    // Create new workbook
    let wb = XLSX.utils.book_new();
    let ws = XLSX.utils.aoa_to_sheet(ws_data);

    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Download file
    XLSX.writeFile(wb, "SV_Students_List.xlsx");
}

/* -------- DOWNLOAD -------- */
function downloadPNG() {
    const card = document.getElementById("frontCard");
    html2canvas(card, {
        backgroundColor: null,  // transparent background
        scale: 3,               // higher resolution
        useCORS: true
    }).then(canvas => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "ID_" + document.getElementById("outRegNo").innerText + ".png";
        a.click();
    });
}

function downloadPDF() {
    const card = document.getElementById("frontCard");

    html2canvas(card, {
        scale: 4,               // higher scale for sharpness
        useCORS: true,
        backgroundColor: "#fff", // white background to avoid transparency issues
        width: card.scrollWidth, // ensures full width
        height: card.scrollHeight // ensures full height
    }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");

        // 
        // Convert pixels to mm
        const pxToMm = 0.264583;
        const imgWidthMM = canvas.width * pxToMm;
        const imgHeightMM = canvas.height * pxToMm;

         // Create PDF exactly same size as card
        const pdf = new jspdf.jsPDF({
            orientation: imgWidthMM > imgHeightMM ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [imgWidthMM, imgHeightMM]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM);
        pdf.save("ID.pdf");
    });
}