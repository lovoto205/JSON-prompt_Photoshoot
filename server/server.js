import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())

const uploadDir = path.join(process.cwd(), 'server', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'))
  }
})

app.use('/uploads', express.static(uploadDir))
app.use(express.json())

// Endpoint для перевода текста
app.post('/translate', async (req, res) => {
  try {
    console.log('Translation request received:', req.body)
    const { text } = req.body
    if (!text) return res.json({ translatedText: '' })

    // Используем LibreTranslate API (бесплатно)
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'ru',
        target: 'en',
        format: 'text'
      })
    })

    const data = await response.json()
    console.log('Translation response:', data)

    if (data.translatedText) {
      console.log(`Translated "${text}" -> "${data.translatedText}"`)
      return res.json({ translatedText: data.translatedText })
    }

    // Если не удалось перевести, возвращаем оригинал
    console.log('Translation failed, returning original text')
    res.json({ translatedText: text })
  } catch (e) {
    console.error('Translation error:', e)
    res.json({ translatedText: req.body.text || '' })
  }
})

app.post('/generate', upload.single('photo'), async (req, res) => {
  try {
    const prompt = req.body.prompt || 'beautiful landscape'

    // Генерация через Pollinations.ai (бесплатно)
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&enhance=true`

    // Скачиваем изображение
    const imageRes = await fetch(imageUrl)

    if (!imageRes.ok) {
      throw new Error(`Failed to generate image: ${imageRes.statusText}`)
    }

    const imageBuffer = Buffer.from(await imageRes.arrayBuffer())
    const imagePath = path.join(uploadDir, `generated-${Date.now()}.png`)
    fs.writeFileSync(imagePath, imageBuffer)

    res.json({ imageUrl: `/uploads/${path.basename(imagePath)}` })
  } catch (e) {
    console.error('Ошибка генерации:', e)
    res.status(400).json({ error: String(e.message || e) })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server on port ${PORT}`))
