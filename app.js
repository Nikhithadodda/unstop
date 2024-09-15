const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());

mongoose.connect("mongodb+srv://nikhitha:el77vaOZsfQZ8ttb@cluster0.7xyxy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log('Connected');
});

const stchema = new mongoose.Schema({
  sttatus: {
    type: String,
    required: true,
    default: "0".repeat(80)
  }
});

const st = mongoose.model('st', stchema);
app.use(express.json());

app.get('/st', async (req, res) => {
  let stData = await st.findOne();
  if (!stData) {
    stData = new st();
    await stData.save();
  }
  res.json({ all_st: stData.sttatus });
});

const rst = (allst, numst) => {
  let rdst = [];
  let stArray = allst.split('');
  const rows = 11;
  for (let i = 0; i < stArray.length; i += 7) {
    let rowSize = i === 77 ? 3 : 7;
    const row = stArray.slice(i, i + rowSize);
    const availablest = row.map((st, index) => st === '0' ? index : null).filter(index => index !== null);
    if (availablest.length >= numst) {
      for (let j = 0; j < numst; j++) {
        stArray[i + availablest[j]] = '1';
        rdst.push(i + availablest[j]);
      }
      return { updatedst: stArray.join(''), rdst };
    }
  }
  for (let i = 0; i < stArray.length; i++) {
    if (stArray[i] === '0') {
      stArray[i] = '1';
      rdst.push(i);
      if (rdst.length === numst) {
        return { updatedst: stArray.join(''), rdst };
      }
    }
  }
  return { updatedst: stArray.join(''), rdst };
};

app.post('/r', async (req, res) => {
  const { numst } = req.body;
  if (numst < 1 || numst > 7) {
    return res.status(400).json({ error: 'Invalid' });
  }
  let stData = await st.findOne();
  if (!stData) {
    stData = new st();
  }
  const { updatedst, rdst } = rst(stData.sttatus, numst);
  stData.sttatus = updatedst;
  await stData.save();
  res.json({ success: true, rdst });
});

app.listen(5000, function() {
  console.log('Server is running on http://localhost:5000');
});

const path = require('path');
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
