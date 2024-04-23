const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer(); // 配置 multer，使用默认存储设置
require('dotenv').config();

const app = express();
const PORT = 3000;

const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

mongoose.connect(uri, clientOptions)
  .then(() => console.log("已連接到數據庫"))
  .catch(err => console.error("無法連接到數據庫:", err));

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

const RegistrationSchema = new mongoose.Schema({
    name: String,
    email: String,
    course: String
  });
  
const Registration = mongoose.model('Registration', RegistrationSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('歡迎來到報名後台');
});

app.post('/register', upload.none(), async (req, res) => {
    console.log(req.body);
  const { name, email, course } = req.body;

  console.log("名字:", name, "邮箱:", email, "课程:", course);

  try {
    const newRegistration = new Registration({name,email,course});
    await newRegistration.save();
    res.status(201).send(newRegistration);
  } catch (error) {
    console.error("保存過程中發生錯誤:", error);
    res.status(500).send('服務器錯誤');
  }
});

app.get('/registrations', async (req, res) => {
    try {
      const registrations = await Registration.find({});
      res.status(200).json(registrations);
    } catch (error) {
      console.error(error);
      res.status(500).send('無法讀取報名訊息');
    }
});

app.patch('/register/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, course } = req.body;

  try {
      const registration = await Registration.findByIdAndUpdate(id, { name, email, course }, { new: true });
      if (registration) {
          res.status(200).send(registration);
      } else {
          res.status(404).send('找不到該報名資訊');
      }
  } catch (error) {
      console.error("更新過程中發生錯誤:", error);
      res.status(500).send('服務器錯誤');
  }
});

app.delete('/register/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const registration = await Registration.findByIdAndDelete(id);
      if (registration) {
          res.status(200).send('報名資訊已刪除');
      } else {
          res.status(404).send('找不到該報名資訊');
      }
  } catch (error) {
      console.error("刪除過程中發生錯誤:", error);
      res.status(500).send('服務器錯誤');
  }
});

app.listen(PORT, () => {
  console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});