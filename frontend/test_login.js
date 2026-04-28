import axios from 'axios';
async function test() {
  try {
    const res = await axios.post('http://localhost:8000/auth/login', {
      email: 'candidate@demo.com',
      password: 'demo123'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
