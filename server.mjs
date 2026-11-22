// Server lokal untuk CariTepat: menyajikan file statis + endpoint POST /api/chat (Gemini).
// Jalankan: node server.mjs   (lalu buka http://localhost:3000)
// Logika AI ada di lib/asisten.mjs — file yang sama dipakai api/chat.mjs di Vercel.
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { jawab } from "./lib/asisten.mjs";

// Baca .env kalau ada (Node 20.12+). Tanpa .env, pakai env var dari shell.
try {
  process.loadEnvFile(".env");
} catch (e) {
  if (e.code !== "ENOENT") console.warn("Gagal membaca .env:", e.message);
}

const ROOT = process.cwd();
const PORT = Number(process.env.PORT) || 3000;
const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon"
};

const json = (res, status, obj) => {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
};

async function chat(req, res) {
  let body = "";
  for await (const c of req) body += c;

  let data;
  try {
    data = JSON.parse(body || "{}");
  } catch {
    return json(res, 400, { jawaban: "Format permintaan tidak valid." });
  }

  const pesan = String(data.pesan || "").trim();
  if (!pesan) return json(res, 400, { jawaban: "Pertanyaannya masih kosong." });

  if (!KEY) {
    console.error("[chat] GEMINI_API_KEY belum diisi. Salin .env.example menjadi .env lalu isi key-nya.");
    return json(res, 500, { jawaban: "Asisten AI belum dikonfigurasi di server. Isi GEMINI_API_KEY di file .env." });
  }

  const hasil = await jawab({ pesan, riwayat: data.riwayat, key: KEY, modelUtama: MODEL });
  const out = { jawaban: hasil.jawaban };
  if (hasil.model) out.model = hasil.model;
  return json(res, hasil.status, out);
}

async function statis(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = resolve(ROOT, "." + (pathname === "/" ? "/index.html" : pathname));

  // Cegah akses ke luar folder project (../)
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  // Jangan sajikan file rahasia
  if (/[\\/](\.env|\.git|node_modules)([\\/]|$)/.test(file)) {
    res.writeHead(404).end("Not found");
    return;
  }

  try {
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}

createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") return chat(req, res);
  if (req.method === "GET" || req.method === "HEAD") return statis(req, res);
  res.writeHead(405).end("Method not allowed");
}).listen(PORT, () => {
  console.log(`CariTepat jalan di http://localhost:${PORT}`);
  console.log(KEY ? `Model: ${MODEL}` : "PERINGATAN: GEMINI_API_KEY kosong, asisten AI belum aktif.");
});
