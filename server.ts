const express = require('express');
const path = require('path');
const app = express();

// Static dosyaları serve et
app.use(express.static(path.join(__dirname, 'build')));

// Tüm route'ları index.html'e yönlendir
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// 8080 portunda sunucuyu başlat
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 