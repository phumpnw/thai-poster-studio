// Browser-side OCR. The image is processed locally by a WASM worker.
let engine;
function loadEngine(){
 if(globalThis.Tesseract)return Promise.resolve(globalThis.Tesseract);
 if(!engine)engine=new Promise((resolve,reject)=>{
 const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=()=>resolve(globalThis.Tesseract);s.onerror=()=>{s.remove();engine=null;reject(new Error('โหลด OCR ไม่สำเร็จ'))};document.head.append(s);
 });return engine;
}
export function mapLine(line,w,h,W,H){
 const b=line.bbox;if(!b||!line.text?.trim())return null;
 const k=Math.max(W/w,H/h),dx=(W-w*k)/2,dy=(H-h*k)/2;
 const x=(b.x0*k+dx)/W*100,y=(b.y0*k+dy)/H*100, width=(b.x1-b.x0)*k/W*100;
 if(x<0||y<0||x+width>100.5||y+(b.y1-b.y0)*k/H*100>100.5)return null;
 return {txt:line.text.trim(),x,y,width:Math.min(100-x,Math.max(5,width*1.12)),size:Math.max(.5,Math.min(50,(b.y1-b.y0)*k/W*100*1.25)),confidence:Math.round(line.confidence||0),bbox:b};
}
export async function recognize(image,lang,progress){
 const T=await loadEngine();let worker;
 try{
 worker=await T.createWorker(lang,1,{logger:m=>progress(m.status,m.progress)});
 await worker.setParameters({tessedit_pageseg_mode:T.PSM.SPARSE_TEXT});
 const {data}=await worker.recognize(image);
 return (data.lines||[]).filter(l=>l.text?.trim()&&l.bbox);
 }finally{if(worker)await worker.terminate()}
}
export function setupOCR({getImage,getState,importLayers}){
 const $=id=>document.getElementById(id),dialog=$('ocrDialog'),list=$('ocrResults'),status=$('ocrStatus'),bar=$('ocrProgress'),run=$('ocrRun'),apply=$('ocrApply');let source=null,found=[];
 function clear(){found=[];list.replaceChildren();apply.disabled=true;bar.value=0}
 $('ocrOpen').onclick=()=>{if(!getImage()){alert('กรุณานำเข้าภาพโปสเตอร์ก่อน');return}clear();source=getState().bg;status.textContent='เลือกภาษาแล้วกดเริ่มตรวจจับ';dialog.showModal()};
 $('ocrClose').onclick=()=>dialog.close();
 dialog.addEventListener('cancel',e=>{if(run.disabled)e.preventDefault()});
 run.onclick=async()=>{clear();run.disabled=true;$('ocrClose').disabled=true;try{
 const im=getImage(),s=getState();source=s.bg;status.textContent='กำลังโหลดระบบ OCR…';
 const lines=await recognize(im,$('ocrLang').value,(phase,p)=>{status.textContent=phase==='recognizing text'?'กำลังอ่านตัวอักษร '+Math.round(p*100)+'%':'กำลังเตรียม OCR…';bar.value=Number.isFinite(p)?p:0});
 found=lines.map(l=>mapLine(l,im.naturalWidth,im.naturalHeight,s.w,s.h)).filter(Boolean);
 for(const l of found){const row=document.createElement('div');row.className='ocr-row';const check=document.createElement('input');check.type='checkbox';check.checked=true;check.setAttribute('aria-label','เลือกข้อความ');const text=document.createElement('textarea');text.value=l.txt;text.rows=2;const meta=document.createElement('small');meta.textContent='ความมั่นใจ '+l.confidence+'% · X '+l.x.toFixed(1)+'% / Y '+l.y.toFixed(1)+'%';const body=document.createElement('div');body.append(text,meta);row.append(check,body);list.append(row);l.check=check;l.input=text;}
 bar.value=1;status.textContent=found.length?'พบ '+found.length+' บรรทัด — ตรวจแก้ข้อความก่อนนำเข้า':'ไม่พบข้อความในพื้นที่โปสเตอร์ ลองเปลี่ยนภาษาหรือใช้ภาพคมชัดขึ้น';apply.disabled=!found.length;
 }catch(e){status.textContent='ตรวจจับไม่สำเร็จ: '+e.message}finally{run.disabled=false;$('ocrClose').disabled=false}};
 apply.onclick=()=>{if(source!==getState().bg){status.textContent='ภาพเปลี่ยนแล้ว กรุณาตรวจจับใหม่';return}const picked=found.filter(l=>l.check.checked&&l.input.value.trim()).map(l=>({txt:l.input.value.trim(),x:l.x,y:l.y,width:l.width,size:l.size}));if(!picked.length){status.textContent='เลือกข้อความอย่างน้อยหนึ่งรายการ';return}importLayers(picked,$('ocrReplace').checked);dialog.close()};
}
