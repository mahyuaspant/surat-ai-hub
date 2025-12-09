import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating letter content for:", prompt, "type:", type);

    const systemPrompt = `Kamu adalah asisten yang ahli dalam membuat surat resmi Indonesia. 
Tugas kamu adalah membuat konten surat yang profesional, formal, dan sesuai dengan standar surat resmi Indonesia.

Panduan format surat:
1. Gunakan bahasa Indonesia yang baku dan formal
2. Struktur surat harus jelas: pembuka, isi, penutup
3. Gunakan kalimat yang sopan dan profesional
4. Jangan sertakan KOP surat, tanggal, atau tanda tangan - fokus hanya pada isi surat
5. Format paragraf yang rapi

Berikan HANYA konten isi surat, tanpa header, tanggal, atau bagian tanda tangan.`;

    const userPrompt = type === 'template' 
      ? `Buatkan template surat untuk: "${prompt}". Template ini akan digunakan berulang kali, jadi gunakan placeholder seperti [NAMA], [TANGGAL], [ALAMAT] untuk bagian yang perlu diisi nanti.`
      : `Buatkan isi surat resmi untuk keperluan: "${prompt}"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    console.log("Generated content length:", generatedContent?.length);

    return new Response(JSON.stringify({ content: generatedContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error generating letter:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
