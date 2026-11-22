// Endpoint POST /api/chat untuk Vercel (serverless function).
// Logika AI ada di lib/asisten.mjs, sama dengan yang dipakai server.mjs di lokal.
// Environment variable yang wajib diisi di dashboard Vercel: GEMINI_API_KEY (opsional: GEMINI_MODEL).
import { jawab } from "../lib/asisten.mjs";

const kirim = (res, status, obj) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
};

async function bacaBody(req) {
  // Vercel biasanya sudah mem-parse body JSON ke req.body.
  if (req.body && typeof req.body === "object") return req.body;
  let body = "";
  for await (const c of req) body += c;
  if (Buffer.isBuffer(req.body)) body = req.body.toString("utf8");
  return JSON.parse(body || "{}");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return kirim(res, 405, { jawaban: "Metode tidak didukung." });

  let data;
  try {
    data = await bacaBody(req);
  } catch {
    return kirim(res, 400, { jawaban: "Format permintaan tidak valid." });
  }

  const pesan = String(data?.pesan || "").trim();
  if (!pesan) return kirim(res, 400, { jawaban: "Pertanyaannya masih kosong." });

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("[chat] GEMINI_API_KEY belum diisi di environment Vercel.");
    return kirim(res, 500, { jawaban: "Asisten AI belum dikonfigurasi. Isi GEMINI_API_KEY di pengaturan Vercel." });
  }

  // Vercel mematikan function kalau terlalu lama, jadi total waktu dibatasi lebih ketat
  // daripada di lokal. Sisa waktu dipakai untuk mencoba model cadangan.
  const hasil = await jawab({
    pesan,
    riwayat: data?.riwayat,
    key,
    modelUtama: process.env.GEMINI_MODEL,
    batasMs: 26000,
    perCobaMs: 11000
  });

  const body = { jawaban: hasil.jawaban };
  if (hasil.model) body.model = hasil.model;
  return kirim(res, hasil.status, body);
}
