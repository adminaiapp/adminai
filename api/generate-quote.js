export default async function handler(req,res){
 if(req.method!=="POST") return res.status(405).json({ok:false,error:"Método no permitido."});
 const key=process.env.OPENAI_API_KEY, model=process.env.OPENAI_MODEL||"gpt-5.6";
 if(!key) return res.status(500).json({ok:false,error:"OPENAI_API_KEY no está configurada en Vercel."});
 try{
  const x=req.body||{}, n=v=>Number.isFinite(Number(v))?Number(v):0;
  const input={client:String(x.client||""),email:String(x.email||""),description:String(x.description||""),quantity:n(x.quantity),unit_price:n(x.unit_price),discount_percent:n(x.discount_percent),tax_percent:n(x.tax_percent),currency:String(x.currency||"USD")};
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},body:JSON.stringify({model,input:[
   {role:"system",content:"Eres AdminAI. Crea una cotización profesional. Devuelve SOLO JSON válido con client,email,description,quantity,unit_price,discount_percent,tax_percent,subtotal,discount_amount,tax_amount,total,validity_days,notes. Calcula correctamente los importes."},
   {role:"user",content:JSON.stringify(input)}
  ]})});
  const raw=await r.text(); if(!r.ok)return res.status(r.status).json({ok:false,error:raw.slice(0,500)});
  const d=JSON.parse(raw), quote=JSON.parse(d.output_text||"");
  return res.status(200).json({ok:true,quote});
 }catch(e){return res.status(500).json({ok:false,error:e.message||"Error interno."})}
}
