/* ============================================================
   Google Apps Script — رفع بوان الكريدي لـ Google Drive
   ------------------------------------------------------------
   البنية:
     BONS-CREDIT/
       2026-09/            (الشهر)
         2026-09-22/       (النهار)
           YOUSSEF/        (العامل)
             barj al Amal sarl_YOUSSEF_1000dh_20260922.jpg

   الطريقة:
   1. افتح https://script.google.com  و سجل بحساب Google ديالك
   2. Projects > New project (مشروع جديد)
   3. امسح الكود الموجود و الصق هاد الكود كامل
   4. Save (حفظ)
   5. Deploy > New deployment > Type: Web app
        - Execute as: Me
        - Who has access: Anyone
   6. انسخ الرابط اللي ينتهي بـ /exec و لصقو فالتطبيق:
      الإعدادات > ربط Google Drive
   ============================================================ */

function clean_(s) {
  return String(s || "autre").replace(/[\\\/:*?"<>|]/g, "_").slice(0, 80) || "autre";
}

function child_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function folder_(data) {
  var rootName = "BONS-CREDIT";
  var it = DriveApp.getFoldersByName(rootName);
  var root = it.hasNext() ? it.next() : DriveApp.createFolder(rootName);
  var month = clean_(data.month || "sans-mois");
  var day = clean_(data.day || "sans-jour");
  var worker = clean_(data.worker || "autre");
  return child_(child_(child_(root, month), day), worker);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === "ping") return json_({ ok: true });
    var folder = folder_(data);
    var blob = Utilities.newBlob(
      Utilities.base64Decode(data.base64),
      data.mime || "image/jpeg",
      data.name
    );
    var file = folder.createFile(blob);
    return json_({ ok: true, id: file.getId(), url: file.getUrl() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
