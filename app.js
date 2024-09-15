const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());

mongoose.connect("mongodb+srv://lakshminikhithad:123@cluster0.64qlj.mongodb.net/seats?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
});

const seatSchema = new mongoose.Schema({
  seatStatus: {
    type: String,
    required: true,
    default: "0".repeat(80)
  }
});

const Seat = mongoose.model('Seat', seatSchema);
app.use(express.json());

app.get('/st', async (req, res) => {
  try {
    let seatData = await Seat.findOne();
    if (!seatData) {
      seatData = new Seat();
      await seatData.save();
    }
    res.json({ all_seats: seatData.seatStatus });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch seat data' });
  }
});

const reserveSeats = (allSeats, numSeats) => {
  let reservedSeats = [];
  let seatsArray = allSeats.split('');
  const rows = 11;
  for (let i = 0; i < seatsArray.length; i += 7) {
    let rowSize = i === 77 ? 3 : 7;
    const row = seatsArray.slice(i, i + rowSize);
    const availableSeats = row.map((seat, index) => seat === '0' ? index : null).filter(index => index !== null);
    if (availableSeats.length >= numSeats) {
      for (let j = 0; j < numSeats; j++) {
        seatsArray[i + availableSeats[j]] = '1';
        reservedSeats.push(i + availableSeats[j]);
      }
      return { updatedSeats: seatsArray.join(''), reservedSeats };
    }
  }
  for (let i = 0; i < seatsArray.length; i++) {
    if (seatsArray[i] === '0') {
      seatsArray[i] = '1';
      reservedSeats.push(i);
      if (reservedSeats.length === numSeats) {
        return { updatedSeats: seatsArray.join(''), reservedSeats };
      }
    }
  }
  return { updatedSeats: seatsArray.join(''), reservedSeats };
};

app.post('/r', async (req, res) => {
  const { numSeats } = req.body;
  if (numSeats < 1 || numSeats > 7) {
    return res.status(400).json({ error: 'Invalid number of seats. You can reserve between 1 and 7 seats.' });
  }
  try {
    let seatData = await Seat.findOne();
    if (!seatData) {
      seatData = new Seat();
    }
    const { updatedSeats, reservedSeats } = reserveSeats(seatData.seatStatus, numSeats);

    seatData.seatStatus = updatedSeats;
    await seatData.save();

    res.json({ success: true, reservedSeats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reserve seats' });
  }
});

app.listen(5000, function() {
  console.log('Server is running on http://localhost:5000');
});
