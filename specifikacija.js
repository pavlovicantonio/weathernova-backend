const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


mongoose.connect('mongodb://localhost:3030/Weathernova', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(400).json({ message: 'Please provide both username and password' });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ message: 'Username already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({ username, password: hashedPassword });

		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});


app.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({ message: 'Invalid username or password' });
		}

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return res.status(401).json({ message: 'Invalid username or password' });
		}

		const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });

		res.json({ token });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Internal server error' });
	}
});

app.post('/logout', (req, res) => {
	res.json({ message: 'Logout successful' });
});

app.get('/weather', (req, res) => {
	res.json({ message: 'Weather data retrieved successfully' });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
