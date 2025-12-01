const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });
const sensores = [];

app.post("/convert", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).send("No se envió archivo");

  const inputPath = req.file.path;
  const outputPath = path.join("uploads", `${req.file.filename}.wav`);

  ffmpeg(inputPath)
    .outputOptions(["-ar 16000", "-ac 1", "-c:a pcm_s16le"])
    .toFormat("wav")
    .save(outputPath)
    .on("end", () => {
      fs.readFile(outputPath, (err, data) => {
        if (err) return res.status(500).send("Error al leer archivo");

        res.set({
          "Content-Type": "audio/wav",
          "Content-Length": data.length,
        });

        res.send(data);

        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    })
    .on("error", (err) => {
      fs.unlink(inputPath, () => {});
      res.status(500).send("Error al convertir: " + err.message);
    });
});

app.post("/api/sensores", express.json(), (req, res) => {
  console.log(req.body);
  const { temperatura, humedad } = req.body;
  console.log(req.body);
  if (typeof temperatura !== "number" || typeof humedad !== "number") {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const registro = {
    temperatura,
    humedad,
    timestamp: Date.now(),
  };
  sensores.push(registro);
  res.json({ ok: true, registro });
});
app.get("/api/sensores", (req, res) => {
  res.json(sensores);
});

app.listen(3000, () => {
  console.log("Servidor escuchando en puerto 3000");
});
