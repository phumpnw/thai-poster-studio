# Thai Poster Studio 2

เปิดใช้งานด้วย GitHub Pages หรือ `python -m http.server 8080` จากโฟลเดอร์นี้

- index.html: UI markup
- css/studio.css: responsive studio theme
- js/app.js: state, controls, history, interaction
- js/render.js: Canvas typography, wrapping and drawing
- js/io.js: file download

นำเข้าภาพพื้นหลัง เพิ่มข้อความ ลากย้าย ปรับฟอนต์ ขอบ เงา และส่งออก PNG หรือ JSON. ขนาดพิมพ์เริ่มต้น 80×120 ซม. DPI ใช้คำนวณจำนวนพิกเซล (PNG ไม่ได้ฝังค่า DPI ที่เลือก). ฟอนต์ที่นำเข้าอยู่ในหน่วยความจำของแท็บ ต้องนำเข้าใหม่เมื่อเปิดโปรเจกต์ใหม่. AI workflow เป็นการส่งออกพื้นหลังและคัดลอกพรอมต์ไปใช้ภายนอก ไม่ใช่ API เชื่อมต่ออัตโนมัติ. ยังไม่มี OCR, inpainting หรือ font matching. คีย์ลัด Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Delete, ลูกศร และ Escape.
